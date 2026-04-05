from datetime import datetime, timezone

from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

db = SQLAlchemy()


class Tenant(db.Model):
    """A business/store that uses the POS system."""

    __tablename__ = "tenants"

    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(80), unique=True, nullable=False, index=True)
    business_name = db.Column(db.String(120), nullable=False)
    owner_email = db.Column(db.String(120), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc)
    )

    # Billing
    plan = db.Column(db.String(20), default="free")  # free, starter, pro
    stripe_customer_id = db.Column(db.String(80), nullable=True)
    stripe_subscription_id = db.Column(db.String(80), nullable=True)
    custom_domain = db.Column(db.String(120), nullable=True, unique=True)

    # Settings
    tax_rate = db.Column(db.Float, default=0.0)
    currency_symbol = db.Column(db.String(5), default="$")

    # Branding
    brand_primary = db.Column(db.String(7), default="#6366f1")
    brand_primary_hover = db.Column(db.String(7), default="#4f46e5")
    brand_navbar_bg = db.Column(db.String(7), default="#1e293b")
    brand_navbar_text = db.Column(db.String(7), default="#ffffff")
    brand_logo_url = db.Column(db.String(256), default="")
    brand_font = db.Column(db.String(80), default="")
    receipt_footer = db.Column(db.String(256), default="Thank you for your purchase!")

    # Relationships
    users = db.relationship("User", backref="tenant", lazy=True)
    categories = db.relationship("Category", backref="tenant", lazy=True)
    products = db.relationship("Product", backref="tenant", lazy=True)
    sales = db.relationship("Sale", backref="tenant", lazy=True)

    @property
    def brand(self):
        return {
            "primary": self.brand_primary,
            "primary_hover": self.brand_primary_hover,
            "navbar_bg": self.brand_navbar_bg,
            "navbar_text": self.brand_navbar_text,
            "logo_url": self.brand_logo_url,
            "font": self.brand_font,
            "receipt_footer": self.receipt_footer,
        }


class User(UserMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey("tenants.id"), nullable=True)
    username = db.Column(db.String(80), nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    display_name = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="cashier")  # superadmin, admin, cashier
    is_active_user = db.Column(db.Boolean, default=True)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc)
    )

    __table_args__ = (
        db.UniqueConstraint("tenant_id", "username", name="uq_tenant_username"),
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password, method="pbkdf2:sha256")

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @property
    def is_admin(self):
        return self.role in ("admin", "superadmin")

    @property
    def is_superadmin(self):
        return self.role == "superadmin"


class Category(db.Model):
    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey("tenants.id"), nullable=False)
    name = db.Column(db.String(80), nullable=False)
    color = db.Column(db.String(7), default="#6366f1")
    products = db.relationship("Product", backref="category", lazy=True)

    __table_args__ = (
        db.UniqueConstraint("tenant_id", "name", name="uq_tenant_category"),
    )


class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey("tenants.id"), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    sku = db.Column(db.String(50), nullable=True)
    price = db.Column(db.Float, nullable=False)
    cost = db.Column(db.Float, default=0.0)
    stock = db.Column(db.Integer, default=0)
    track_stock = db.Column(db.Boolean, default=True)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=True)
    image_url = db.Column(db.String(256), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc)
    )

    __table_args__ = (
        db.UniqueConstraint("tenant_id", "sku", name="uq_tenant_sku"),
    )

    @property
    def in_stock(self):
        return not self.track_stock or self.stock > 0


class Sale(db.Model):
    __tablename__ = "sales"

    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey("tenants.id"), nullable=False)
    receipt_number = db.Column(db.String(20), nullable=False)
    subtotal = db.Column(db.Float, nullable=False)
    tax_amount = db.Column(db.Float, default=0.0)
    discount_amount = db.Column(db.Float, default=0.0)
    total = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(20), default="cash")
    amount_tendered = db.Column(db.Float, default=0.0)
    change_due = db.Column(db.Float, default=0.0)
    cashier_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    cashier = db.relationship("User", backref="sales")
    note = db.Column(db.Text, nullable=True)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc)
    )
    items = db.relationship("SaleItem", backref="sale", lazy=True, cascade="all, delete-orphan")

    __table_args__ = (
        db.UniqueConstraint("tenant_id", "receipt_number", name="uq_tenant_receipt"),
    )


class SaleItem(db.Model):
    __tablename__ = "sale_items"

    id = db.Column(db.Integer, primary_key=True)
    sale_id = db.Column(db.Integer, db.ForeignKey("sales.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    product_name = db.Column(db.String(120), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    subtotal = db.Column(db.Float, nullable=False)
    product = db.relationship("Product")
