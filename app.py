import os
from datetime import datetime, timedelta, timezone

from flask import Flask, flash, jsonify, redirect, render_template, request, url_for
from flask_login import (
    LoginManager,
    current_user,
    login_required,
    login_user,
    logout_user,
)

from config import Config
from models import Category, Product, Sale, SaleItem, User, db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    os.makedirs(app.instance_path, exist_ok=True)

    db.init_app(app)

    login_manager = LoginManager()
    login_manager.login_view = "login"
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    # --- Context processor ---
    @app.context_processor
    def inject_config():
        return {
            "business_name": app.config["BUSINESS_NAME"],
            "currency": app.config["CURRENCY_SYMBOL"],
            "tax_rate": app.config["TAX_RATE"],
        }

    # ==================== AUTH ====================

    @app.route("/login", methods=["GET", "POST"])
    def login():
        if current_user.is_authenticated:
            return redirect(url_for("pos"))
        if request.method == "POST":
            username = request.form.get("username", "").strip()
            password = request.form.get("password", "")
            user = User.query.filter_by(username=username).first()
            if user and user.check_password(password) and user.is_active_user:
                login_user(user)
                return redirect(request.args.get("next") or url_for("pos"))
            flash("Invalid username or password.", "error")
        return render_template("login.html")

    @app.route("/logout")
    @login_required
    def logout():
        logout_user()
        return redirect(url_for("login"))

    # ==================== POS TERMINAL ====================

    @app.route("/")
    @login_required
    def pos():
        categories = Category.query.order_by(Category.name).all()
        products = Product.query.filter_by(is_active=True).order_by(Product.name).all()
        return render_template("pos.html", categories=categories, products=products)

    # ==================== SALES API ====================

    @app.route("/api/checkout", methods=["POST"])
    @login_required
    def checkout():
        data = request.get_json()
        items = data.get("items", [])
        payment_method = data.get("payment_method", "cash")
        amount_tendered = float(data.get("amount_tendered", 0))
        discount = float(data.get("discount", 0))
        note = data.get("note", "")

        if not items:
            return jsonify({"error": "Cart is empty"}), 400

        tax_rate = app.config["TAX_RATE"]
        subtotal = 0.0
        sale_items = []

        for item in items:
            product = db.session.get(Product, item["product_id"])
            if not product or not product.is_active:
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

        tax_amount = round(subtotal * tax_rate, 2)
        total = round(subtotal + tax_amount - discount, 2)
        change_due = round(max(amount_tendered - total, 0), 2) if payment_method == "cash" else 0

        receipt_number = _generate_receipt_number()

        sale = Sale(
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

    # ==================== ADMIN: PRODUCTS ====================

    @app.route("/admin/products")
    @login_required
    def admin_products():
        if not current_user.is_admin:
            flash("Access denied.", "error")
            return redirect(url_for("pos"))
        products = Product.query.order_by(Product.name).all()
        categories = Category.query.order_by(Category.name).all()
        return render_template("admin_products.html", products=products, categories=categories)

    @app.route("/admin/products/save", methods=["POST"])
    @login_required
    def save_product():
        if not current_user.is_admin:
            return jsonify({"error": "Access denied"}), 403
        data = request.get_json()
        product_id = data.get("id")

        if product_id:
            product = db.session.get(Product, product_id)
        else:
            product = Product()
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

    @app.route("/admin/products/<int:product_id>/delete", methods=["POST"])
    @login_required
    def delete_product(product_id):
        if not current_user.is_admin:
            return jsonify({"error": "Access denied"}), 403
        product = db.session.get(Product, product_id)
        if product:
            product.is_active = False
            db.session.commit()
        return jsonify({"message": "Product deactivated"})

    # ==================== ADMIN: CATEGORIES ====================

    @app.route("/admin/categories/save", methods=["POST"])
    @login_required
    def save_category():
        if not current_user.is_admin:
            return jsonify({"error": "Access denied"}), 403
        data = request.get_json()
        cat_id = data.get("id")
        if cat_id:
            cat = db.session.get(Category, cat_id)
        else:
            cat = Category()
            db.session.add(cat)
        cat.name = data["name"].strip()
        cat.color = data.get("color", "#6366f1")
        db.session.commit()
        return jsonify({"id": cat.id, "message": "Category saved"})

    # ==================== ADMIN: SALES HISTORY ====================

    @app.route("/admin/sales")
    @login_required
    def admin_sales():
        if not current_user.is_admin:
            flash("Access denied.", "error")
            return redirect(url_for("pos"))
        page = request.args.get("page", 1, type=int)
        sales = (
            Sale.query.order_by(Sale.created_at.desc())
            .paginate(page=page, per_page=25, error_out=False)
        )
        return render_template("admin_sales.html", sales=sales)

    @app.route("/api/sales/<int:sale_id>")
    @login_required
    def get_sale(sale_id):
        sale = db.session.get(Sale, sale_id)
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

    # ==================== ADMIN: REPORTS ====================

    @app.route("/admin/reports")
    @login_required
    def admin_reports():
        if not current_user.is_admin:
            flash("Access denied.", "error")
            return redirect(url_for("pos"))
        return render_template("admin_reports.html")

    @app.route("/api/reports/summary")
    @login_required
    def report_summary():
        if not current_user.is_admin:
            return jsonify({"error": "Access denied"}), 403

        days = request.args.get("days", 7, type=int)
        since = datetime.now(timezone.utc) - timedelta(days=days)
        sales = Sale.query.filter(Sale.created_at >= since).all()

        total_revenue = sum(s.total for s in sales)
        total_cost = 0
        items_sold = 0
        for s in sales:
            for si in s.items:
                items_sold += si.quantity
                if si.product:
                    total_cost += si.product.cost * si.quantity

        # Daily breakdown
        daily = {}
        for s in sales:
            day = s.created_at.strftime("%Y-%m-%d")
            daily.setdefault(day, {"revenue": 0, "transactions": 0})
            daily[day]["revenue"] += s.total
            daily[day]["transactions"] += 1

        # Top products
        product_sales = {}
        for s in sales:
            for si in s.items:
                product_sales.setdefault(si.product_name, {"qty": 0, "revenue": 0})
                product_sales[si.product_name]["qty"] += si.quantity
                product_sales[si.product_name]["revenue"] += si.subtotal
        top_products = sorted(product_sales.items(), key=lambda x: x[1]["revenue"], reverse=True)[:10]

        # Payment method breakdown
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

    # ==================== ADMIN: USERS ====================

    @app.route("/admin/users")
    @login_required
    def admin_users():
        if not current_user.is_admin:
            flash("Access denied.", "error")
            return redirect(url_for("pos"))
        users = User.query.order_by(User.username).all()
        return render_template("admin_users.html", users=users)

    @app.route("/admin/users/save", methods=["POST"])
    @login_required
    def save_user():
        if not current_user.is_admin:
            return jsonify({"error": "Access denied"}), 403
        data = request.get_json()
        user_id = data.get("id")

        if user_id:
            user = db.session.get(User, user_id)
        else:
            user = User()
            db.session.add(user)

        user.username = data["username"].strip()
        user.display_name = data["display_name"].strip()
        user.role = data.get("role", "cashier")
        user.is_active_user = data.get("is_active", True)
        if data.get("password"):
            user.set_password(data["password"])

        db.session.commit()
        return jsonify({"id": user.id, "message": "User saved"})

    # ==================== HELPERS ====================

    def _generate_receipt_number():
        now = datetime.now(timezone.utc)
        prefix = now.strftime("%Y%m%d")
        last = (
            Sale.query.filter(Sale.receipt_number.like(f"{prefix}%"))
            .order_by(Sale.receipt_number.desc())
            .first()
        )
        if last:
            seq = int(last.receipt_number[-4:]) + 1
        else:
            seq = 1
        return f"{prefix}{seq:04d}"

    def _ensure_admin_exists():
        if not User.query.filter_by(role="admin").first():
            admin = User(
                username="admin",
                display_name="Administrator",
                role="admin",
            )
            admin.set_password("admin")
            db.session.add(admin)
            db.session.commit()

    with app.app_context():
        db.create_all()
        _ensure_admin_exists()

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host="0.0.0.0", port=5000)
