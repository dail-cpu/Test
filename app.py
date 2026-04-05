import os
import re
from datetime import datetime, timedelta, timezone
from functools import wraps

from flask import (
    Flask,
    abort,
    flash,
    g,
    jsonify,
    redirect,
    render_template,
    request,
    url_for,
)
from flask_login import (
    LoginManager,
    current_user,
    login_required,
    login_user,
    logout_user,
)

from config import Config
from models import Category, Product, Sale, SaleItem, Tenant, User, db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    os.makedirs(app.instance_path, exist_ok=True)

    db.init_app(app)

    login_manager = LoginManager()
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    @login_manager.unauthorized_handler
    def unauthorized():
        tenant = g.get("tenant")
        if tenant:
            return redirect(url_for("tenant_login", slug=tenant.slug))
        return redirect(url_for("landing"))

    # --- Context processor ---
    @app.context_processor
    def inject_globals():
        tenant = g.get("tenant")
        ctx = {
            "platform_name": app.config["PLATFORM_NAME"],
            "platform_tagline": app.config["PLATFORM_TAGLINE"],
        }
        if tenant:
            ctx.update({
                "business_name": tenant.business_name,
                "currency": tenant.currency_symbol,
                "tax_rate": tenant.tax_rate,
                "brand": tenant.brand,
                "tenant": tenant,
            })
        return ctx

    # --- Tenant loader helper ---
    def load_tenant(slug):
        tenant = Tenant.query.filter_by(slug=slug, is_active=True).first()
        if not tenant:
            abort(404)
        g.tenant = tenant
        return tenant

    def tenant_admin_required(f):
        @wraps(f)
        @login_required
        def decorated(*args, **kwargs):
            if not current_user.is_admin or current_user.tenant_id != g.tenant.id:
                flash("Access denied.", "error")
                return redirect(url_for("tenant_pos", slug=g.tenant.slug))
            return f(*args, **kwargs)
        return decorated

    # ==================== LANDING PAGE ====================

    @app.route("/")
    def landing():
        if current_user.is_authenticated and current_user.is_superadmin:
            return redirect(url_for("superadmin_dashboard"))
        return render_template("landing.html")

    # ==================== TENANT SIGNUP ====================

    @app.route("/signup", methods=["GET", "POST"])
    def signup():
        if request.method == "POST":
            business_name = request.form.get("business_name", "").strip()
            slug = request.form.get("slug", "").strip().lower()
            email = request.form.get("email", "").strip()
            password = request.form.get("password", "")

            errors = []
            if not business_name:
                errors.append("Business name is required.")
            if not slug or not re.match(r"^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$", slug):
                errors.append("URL slug must be 3-32 chars: lowercase letters, numbers, hyphens.")
            if slug in ("superadmin", "signup", "static", "api", "login", "logout"):
                errors.append("That URL slug is reserved.")
            if not email:
                errors.append("Email is required.")
            if len(password) < 6:
                errors.append("Password must be at least 6 characters.")
            if Tenant.query.filter_by(slug=slug).first():
                errors.append("That URL slug is already taken.")

            if errors:
                for e in errors:
                    flash(e, "error")
                return render_template("signup.html", form=request.form)

            tenant = Tenant(
                slug=slug,
                business_name=business_name,
                owner_email=email,
            )
            db.session.add(tenant)
            db.session.flush()

            admin = User(
                tenant_id=tenant.id,
                username="admin",
                display_name=business_name + " Admin",
                role="admin",
            )
            admin.set_password(password)
            db.session.add(admin)
            db.session.commit()

            login_user(admin)
            return redirect(url_for("tenant_pos", slug=tenant.slug))

        return render_template("signup.html", form={})

    # ==================== SUPER ADMIN ====================

    @app.route("/superadmin/login", methods=["GET", "POST"])
    def superadmin_login():
        if current_user.is_authenticated and current_user.is_superadmin:
            return redirect(url_for("superadmin_dashboard"))
        if request.method == "POST":
            username = request.form.get("username", "").strip()
            password = request.form.get("password", "")
            user = User.query.filter_by(username=username, role="superadmin").first()
            if user and user.check_password(password):
                login_user(user)
                return redirect(url_for("superadmin_dashboard"))
            flash("Invalid credentials.", "error")
        return render_template("superadmin_login.html")

    @app.route("/superadmin")
    @login_required
    def superadmin_dashboard():
        if not current_user.is_superadmin:
            abort(403)
        tenants = Tenant.query.order_by(Tenant.created_at.desc()).all()
        # Stats per tenant
        tenant_stats = []
        for t in tenants:
            sale_count = Sale.query.filter_by(tenant_id=t.id).count()
            total_revenue = db.session.query(db.func.sum(Sale.total)).filter_by(tenant_id=t.id).scalar() or 0
            user_count = User.query.filter_by(tenant_id=t.id).count()
            product_count = Product.query.filter_by(tenant_id=t.id, is_active=True).count()
            tenant_stats.append({
                "tenant": t,
                "sales": sale_count,
                "revenue": round(total_revenue, 2),
                "users": user_count,
                "products": product_count,
            })
        total_tenants = len(tenants)
        total_revenue = sum(s["revenue"] for s in tenant_stats)
        total_sales = sum(s["sales"] for s in tenant_stats)
        return render_template(
            "superadmin.html",
            tenant_stats=tenant_stats,
            total_tenants=total_tenants,
            total_revenue=total_revenue,
            total_sales=total_sales,
        )

    @app.route("/superadmin/tenants/<int:tenant_id>/toggle", methods=["POST"])
    @login_required
    def superadmin_toggle_tenant(tenant_id):
        if not current_user.is_superadmin:
            abort(403)
        tenant = db.session.get(Tenant, tenant_id)
        if tenant:
            tenant.is_active = not tenant.is_active
            db.session.commit()
        return redirect(url_for("superadmin_dashboard"))

    # ==================== TENANT AUTH ====================

    @app.route("/<slug>/login", methods=["GET", "POST"])
    def tenant_login(slug):
        tenant = load_tenant(slug)
        if current_user.is_authenticated and current_user.tenant_id == tenant.id:
            return redirect(url_for("tenant_pos", slug=slug))
        if request.method == "POST":
            username = request.form.get("username", "").strip()
            password = request.form.get("password", "")
            user = User.query.filter_by(
                tenant_id=tenant.id, username=username
            ).first()
            if user and user.check_password(password) and user.is_active_user:
                login_user(user)
                return redirect(url_for("tenant_pos", slug=slug))
            flash("Invalid username or password.", "error")
        return render_template("login.html")

    @app.route("/<slug>/logout")
    @login_required
    def tenant_logout(slug):
        logout_user()
        return redirect(url_for("tenant_login", slug=slug))

    # ==================== TENANT POS ====================

    @app.route("/<slug>/")
    @login_required
    def tenant_pos(slug):
        tenant = load_tenant(slug)
        if current_user.tenant_id != tenant.id:
            abort(403)
        categories = Category.query.filter_by(tenant_id=tenant.id).order_by(Category.name).all()
        products = Product.query.filter_by(
            tenant_id=tenant.id, is_active=True
        ).order_by(Product.name).all()
        return render_template("pos.html", categories=categories, products=products)

    # ==================== TENANT CHECKOUT API ====================

    @app.route("/<slug>/api/checkout", methods=["POST"])
    @login_required
    def tenant_checkout(slug):
        tenant = load_tenant(slug)
        if current_user.tenant_id != tenant.id:
            abort(403)
        data = request.get_json()
        items = data.get("items", [])
        payment_method = data.get("payment_method", "cash")
        amount_tendered = float(data.get("amount_tendered", 0))
        discount = float(data.get("discount", 0))
        note = data.get("note", "")

        if not items:
            return jsonify({"error": "Cart is empty"}), 400

        subtotal = 0.0
        sale_items = []

        for item in items:
            product = db.session.get(Product, item["product_id"])
            if not product or not product.is_active or product.tenant_id != tenant.id:
                return jsonify({"error": f"Product not found: {item.get('product_id')}"}), 400
            qty = int(item["quantity"])
            if product.track_stock and product.stock < qty:
                return jsonify({"error": f"Insufficient stock for {product.name}"}), 400

            line_total = product.price * qty
            subtotal += line_total
            sale_items.append(
                SaleItem(
                    product_id=product.id,
                    product_name=product.name,
                    quantity=qty,
                    unit_price=product.price,
                    subtotal=line_total,
                )
            )
            if product.track_stock:
                product.stock -= qty

        tax_amount = round(subtotal * tenant.tax_rate, 2)
        total = round(subtotal + tax_amount - discount, 2)
        change_due = round(max(amount_tendered - total, 0), 2) if payment_method == "cash" else 0

        receipt_number = _generate_receipt_number(tenant.id)

        sale = Sale(
            tenant_id=tenant.id,
            receipt_number=receipt_number,
            subtotal=round(subtotal, 2),
            tax_amount=tax_amount,
            discount_amount=round(discount, 2),
            total=total,
            payment_method=payment_method,
            amount_tendered=amount_tendered,
            change_due=change_due,
            cashier_id=current_user.id,
            note=note,
            items=sale_items,
        )
        db.session.add(sale)
        db.session.commit()

        return jsonify({
            "receipt_number": receipt_number,
            "subtotal": sale.subtotal,
            "tax_amount": sale.tax_amount,
            "discount_amount": sale.discount_amount,
            "total": sale.total,
            "payment_method": sale.payment_method,
            "amount_tendered": sale.amount_tendered,
            "change_due": sale.change_due,
            "cashier": current_user.display_name,
            "items": [
                {
                    "name": si.product_name,
                    "quantity": si.quantity,
                    "unit_price": si.unit_price,
                    "subtotal": si.subtotal,
                }
                for si in sale_items
            ],
            "created_at": sale.created_at.isoformat(),
        })

    # ==================== TENANT ADMIN: PRODUCTS ====================

    @app.route("/<slug>/admin/products")
    def tenant_admin_products(slug):
        tenant = load_tenant(slug)

        @tenant_admin_required
        def inner():
            products = Product.query.filter_by(tenant_id=tenant.id).order_by(Product.name).all()
            categories = Category.query.filter_by(tenant_id=tenant.id).order_by(Category.name).all()
            return render_template("admin_products.html", products=products, categories=categories)
        return inner()

    @app.route("/<slug>/admin/products/save", methods=["POST"])
    @login_required
    def tenant_save_product(slug):
        tenant = load_tenant(slug)
        if not current_user.is_admin or current_user.tenant_id != tenant.id:
            return jsonify({"error": "Access denied"}), 403
        data = request.get_json()
        product_id = data.get("id")

        if product_id:
            product = Product.query.filter_by(id=product_id, tenant_id=tenant.id).first()
            if not product:
                return jsonify({"error": "Not found"}), 404
        else:
            product = Product(tenant_id=tenant.id)
            db.session.add(product)

        product.name = data["name"].strip()
        product.sku = data.get("sku", "").strip() or None
        product.price = float(data["price"])
        product.cost = float(data.get("cost", 0))
        product.stock = int(data.get("stock", 0))
        product.track_stock = data.get("track_stock", True)
        product.category_id = data.get("category_id") or None
        product.is_active = data.get("is_active", True)

        db.session.commit()
        return jsonify({"id": product.id, "message": "Product saved"})

    @app.route("/<slug>/admin/products/<int:product_id>/delete", methods=["POST"])
    @login_required
    def tenant_delete_product(slug, product_id):
        tenant = load_tenant(slug)
        if not current_user.is_admin or current_user.tenant_id != tenant.id:
            return jsonify({"error": "Access denied"}), 403
        product = Product.query.filter_by(id=product_id, tenant_id=tenant.id).first()
        if product:
            product.is_active = False
            db.session.commit()
        return jsonify({"message": "Product deactivated"})

    # ==================== TENANT ADMIN: CATEGORIES ====================

    @app.route("/<slug>/admin/categories/save", methods=["POST"])
    @login_required
    def tenant_save_category(slug):
        tenant = load_tenant(slug)
        if not current_user.is_admin or current_user.tenant_id != tenant.id:
            return jsonify({"error": "Access denied"}), 403
        data = request.get_json()
        cat_id = data.get("id")
        if cat_id:
            cat = Category.query.filter_by(id=cat_id, tenant_id=tenant.id).first()
        else:
            cat = Category(tenant_id=tenant.id)
            db.session.add(cat)
        cat.name = data["name"].strip()
        cat.color = data.get("color", "#6366f1")
        db.session.commit()
        return jsonify({"id": cat.id, "message": "Category saved"})

    # ==================== TENANT ADMIN: SALES ====================

    @app.route("/<slug>/admin/sales")
    def tenant_admin_sales(slug):
        tenant = load_tenant(slug)

        @tenant_admin_required
        def inner():
            page = request.args.get("page", 1, type=int)
            sales = (
                Sale.query.filter_by(tenant_id=tenant.id)
                .order_by(Sale.created_at.desc())
                .paginate(page=page, per_page=25, error_out=False)
            )
            return render_template("admin_sales.html", sales=sales)
        return inner()

    @app.route("/<slug>/api/sales/<int:sale_id>")
    @login_required
    def tenant_get_sale(slug, sale_id):
        tenant = load_tenant(slug)
        if current_user.tenant_id != tenant.id:
            abort(403)
        sale = Sale.query.filter_by(id=sale_id, tenant_id=tenant.id).first()
        if not sale:
            return jsonify({"error": "Not found"}), 404
        return jsonify({
            "receipt_number": sale.receipt_number,
            "subtotal": sale.subtotal,
            "tax_amount": sale.tax_amount,
            "discount_amount": sale.discount_amount,
            "total": sale.total,
            "payment_method": sale.payment_method,
            "amount_tendered": sale.amount_tendered,
            "change_due": sale.change_due,
            "cashier": sale.cashier.display_name,
            "note": sale.note,
            "items": [
                {
                    "name": si.product_name,
                    "quantity": si.quantity,
                    "unit_price": si.unit_price,
                    "subtotal": si.subtotal,
                }
                for si in sale.items
            ],
            "created_at": sale.created_at.isoformat(),
        })

    # ==================== TENANT ADMIN: REPORTS ====================

    @app.route("/<slug>/admin/reports")
    def tenant_admin_reports(slug):
        tenant = load_tenant(slug)

        @tenant_admin_required
        def inner():
            return render_template("admin_reports.html")
        return inner()

    @app.route("/<slug>/api/reports/summary")
    @login_required
    def tenant_report_summary(slug):
        tenant = load_tenant(slug)
        if not current_user.is_admin or current_user.tenant_id != tenant.id:
            return jsonify({"error": "Access denied"}), 403

        days = request.args.get("days", 7, type=int)
        since = datetime.now(timezone.utc) - timedelta(days=days)
        sales = Sale.query.filter(
            Sale.tenant_id == tenant.id,
            Sale.created_at >= since,
        ).all()

        total_revenue = sum(s.total for s in sales)
        total_cost = 0
        items_sold = 0
        for s in sales:
            for si in s.items:
                items_sold += si.quantity
                if si.product:
                    total_cost += si.product.cost * si.quantity

        daily = {}
        for s in sales:
            day = s.created_at.strftime("%Y-%m-%d")
            daily.setdefault(day, {"revenue": 0, "transactions": 0})
            daily[day]["revenue"] += s.total
            daily[day]["transactions"] += 1

        product_sales = {}
        for s in sales:
            for si in s.items:
                product_sales.setdefault(si.product_name, {"qty": 0, "revenue": 0})
                product_sales[si.product_name]["qty"] += si.quantity
                product_sales[si.product_name]["revenue"] += si.subtotal
        top_products = sorted(product_sales.items(), key=lambda x: x[1]["revenue"], reverse=True)[:10]

        payments = {}
        for s in sales:
            payments.setdefault(s.payment_method, {"count": 0, "total": 0})
            payments[s.payment_method]["count"] += 1
            payments[s.payment_method]["total"] += s.total

        return jsonify({
            "period_days": days,
            "total_revenue": round(total_revenue, 2),
            "total_cost": round(total_cost, 2),
            "gross_profit": round(total_revenue - total_cost, 2),
            "transaction_count": len(sales),
            "items_sold": items_sold,
            "average_sale": round(total_revenue / len(sales), 2) if sales else 0,
            "daily": [{"date": k, **v} for k, v in sorted(daily.items())],
            "top_products": [{"name": k, **v} for k, v in top_products],
            "payment_methods": [{"method": k, **v} for k, v in payments.items()],
        })

    # ==================== TENANT ADMIN: USERS ====================

    @app.route("/<slug>/admin/users")
    def tenant_admin_users(slug):
        tenant = load_tenant(slug)

        @tenant_admin_required
        def inner():
            users = User.query.filter_by(tenant_id=tenant.id).order_by(User.username).all()
            return render_template("admin_users.html", users=users)
        return inner()

    @app.route("/<slug>/admin/users/save", methods=["POST"])
    @login_required
    def tenant_save_user(slug):
        tenant = load_tenant(slug)
        if not current_user.is_admin or current_user.tenant_id != tenant.id:
            return jsonify({"error": "Access denied"}), 403
        data = request.get_json()
        user_id = data.get("id")

        if user_id:
            user = User.query.filter_by(id=user_id, tenant_id=tenant.id).first()
            if not user:
                return jsonify({"error": "Not found"}), 404
        else:
            user = User(tenant_id=tenant.id)
            db.session.add(user)

        user.username = data["username"].strip()
        user.display_name = data["display_name"].strip()
        user.role = data.get("role", "cashier")
        if user.role == "superadmin":
            user.role = "admin"  # prevent escalation
        user.is_active_user = data.get("is_active", True)
        if data.get("password"):
            user.set_password(data["password"])

        db.session.commit()
        return jsonify({"id": user.id, "message": "User saved"})

    # ==================== TENANT ADMIN: SETTINGS ====================

    @app.route("/<slug>/admin/settings")
    def tenant_admin_settings(slug):
        tenant = load_tenant(slug)

        @tenant_admin_required
        def inner():
            return render_template("admin_settings.html")
        return inner()

    @app.route("/<slug>/admin/settings/save", methods=["POST"])
    @login_required
    def tenant_save_settings(slug):
        tenant = load_tenant(slug)
        if not current_user.is_admin or current_user.tenant_id != tenant.id:
            return jsonify({"error": "Access denied"}), 403
        data = request.get_json()

        tenant.business_name = data.get("business_name", tenant.business_name).strip()
        tenant.tax_rate = float(data.get("tax_rate", tenant.tax_rate))
        tenant.currency_symbol = data.get("currency_symbol", tenant.currency_symbol).strip()
        tenant.brand_primary = data.get("brand_primary", tenant.brand_primary)
        tenant.brand_primary_hover = data.get("brand_primary_hover", tenant.brand_primary_hover)
        tenant.brand_navbar_bg = data.get("brand_navbar_bg", tenant.brand_navbar_bg)
        tenant.brand_navbar_text = data.get("brand_navbar_text", tenant.brand_navbar_text)
        tenant.brand_logo_url = data.get("brand_logo_url", tenant.brand_logo_url)
        tenant.brand_font = data.get("brand_font", tenant.brand_font)
        tenant.receipt_footer = data.get("receipt_footer", tenant.receipt_footer)

        db.session.commit()
        return jsonify({"message": "Settings saved"})

    # ==================== HELPERS ====================

    def _generate_receipt_number(tenant_id):
        now = datetime.now(timezone.utc)
        prefix = now.strftime("%Y%m%d")
        last = (
            Sale.query.filter(
                Sale.tenant_id == tenant_id,
                Sale.receipt_number.like(f"{prefix}%"),
            )
            .order_by(Sale.receipt_number.desc())
            .first()
        )
        if last:
            seq = int(last.receipt_number[-4:]) + 1
        else:
            seq = 1
        return f"{prefix}{seq:04d}"

    def _ensure_superadmin_exists():
        if not User.query.filter_by(role="superadmin").first():
            sa = User(
                tenant_id=None,
                username=app.config["SUPERADMIN_USERNAME"],
                display_name="Super Admin",
                role="superadmin",
            )
            sa.set_password(app.config["SUPERADMIN_PASSWORD"])
            db.session.add(sa)
            db.session.commit()

    with app.app_context():
        db.create_all()
        _ensure_superadmin_exists()

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host="0.0.0.0", port=8080)
