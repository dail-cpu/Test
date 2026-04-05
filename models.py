from datetime import datetime, timezone

from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

db = SQLAlchemy()


class User(UserMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    display_name = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="cashier")  # admin, cashier
    is_active_user = db.Column(db.Boolean, default=True)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc)
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @property
    def is_admin(self):
        return self.role == "admin"


class Category(db.Model):
    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    color = db.Column(db.String(7), default="#6366f1")  # hex color for UI
    products = db.relationship("Product", backref="category", lazy=True)


class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    sku = db.Column(db.String(50), unique=True, nullable=True)
    price = db.Column(db.Float, nullable=False)
    cost = db.Column(db.Float, default=0.0)  # cost price for profit tracking
    stock = db.Column(db.Integer, default=0)
    track_stock = db.Column(db.Boolean, default=True)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=True)
    image_url = db.Column(db.String(256), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc)
    )

    @property
    def in_stock(self):
        return not self.track_stock or self.stock > 0


class Sale(db.Model):
    __tablename__ = "sales"

    id = db.Column(db.Integer, primary_key=True)
    receipt_number = db.Column(db.String(20), unique=True, nullable=False)
    subtotal = db.Column(db.Float, nullable=False)
    tax_amount = db.Column(db.Float, default=0.0)
    discount_amount = db.Column(db.Float, default=0.0)
    total = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(20), default="cash")  # cash, card, other
    amount_tendered = db.Column(db.Float, default=0.0)
    change_due = db.Column(db.Float, default=0.0)
    cashier_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    cashier = db.relationship("User", backref="sales")
    note = db.Column(db.Text, nullable=True)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc)
    )
    items = db.relationship("SaleItem", backref="sale", lazy=True, cascade="all, delete-orphan")


class SaleItem(db.Model):
    __tablename__ = "sale_items"

    id = db.Column(db.Integer, primary_key=True)
    sale_id = db.Column(db.Integer, db.ForeignKey("sales.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    product_name = db.Column(db.String(120), nullable=False)  # snapshot at sale time
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)  # snapshot at sale time
    subtotal = db.Column(db.Float, nullable=False)
    product = db.relationship("Product")
