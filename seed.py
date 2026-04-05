"""Seed script to populate the database with sample data for demo purposes."""

from app import create_app
from models import Category, Product, User, db


def seed():
    app = create_app()
    with app.app_context():
        # Skip if data already exists
        if Product.query.first():
            print("Database already has data. Skipping seed.")
            return

        # Categories
        categories = {
            "Drinks": "#3b82f6",
            "Food": "#f59e0b",
            "Snacks": "#22c55e",
            "Desserts": "#ec4899",
            "Other": "#6366f1",
        }
        cat_objs = {}
        for name, color in categories.items():
            cat = Category(name=name, color=color)
            db.session.add(cat)
            cat_objs[name] = cat
        db.session.flush()

        # Products
        products = [
            ("Coffee", "DRK-001", 4.50, 2.00, 100, "Drinks"),
            ("Espresso", "DRK-002", 3.50, 1.50, 100, "Drinks"),
            ("Latte", "DRK-003", 5.00, 2.25, 100, "Drinks"),
            ("Tea", "DRK-004", 3.00, 1.00, 100, "Drinks"),
            ("Orange Juice", "DRK-005", 4.00, 1.75, 50, "Drinks"),
            ("Water", "DRK-006", 1.50, 0.50, 200, "Drinks"),
            ("Sandwich", "FOD-001", 8.50, 4.00, 30, "Food"),
            ("Salad", "FOD-002", 9.00, 3.50, 20, "Food"),
            ("Soup", "FOD-003", 6.50, 2.50, 25, "Food"),
            ("Wrap", "FOD-004", 7.50, 3.25, 25, "Food"),
            ("Chips", "SNK-001", 2.50, 1.00, 50, "Snacks"),
            ("Cookie", "SNK-002", 3.00, 1.25, 40, "Snacks"),
            ("Granola Bar", "SNK-003", 2.75, 1.10, 60, "Snacks"),
            ("Muffin", "DST-001", 4.00, 1.75, 30, "Desserts"),
            ("Brownie", "DST-002", 3.50, 1.50, 25, "Desserts"),
            ("Cheesecake Slice", "DST-003", 5.50, 2.50, 15, "Desserts"),
            ("Gift Card $25", "OTH-001", 25.00, 25.00, 50, "Other"),
        ]
        for name, sku, price, cost, stock, cat_name in products:
            p = Product(
                name=name,
                sku=sku,
                price=price,
                cost=cost,
                stock=stock,
                track_stock=True,
                category_id=cat_objs[cat_name].id,
                is_active=True,
            )
            db.session.add(p)

        # Cashier user
        cashier = User(
            username="cashier",
            display_name="Front Register",
            role="cashier",
        )
        cashier.set_password("cashier")
        db.session.add(cashier)

        db.session.commit()
        print("Database seeded successfully!")
        print("  - 5 categories")
        print(f"  - {len(products)} products")
        print("  - Users: admin/admin, cashier/cashier")


if __name__ == "__main__":
    seed()
