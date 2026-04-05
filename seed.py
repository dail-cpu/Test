"""Seed script to create a demo tenant with sample data."""

from app import create_app
from models import Category, Product, Tenant, User, db


def seed():
    app = create_app()
    with app.app_context():
        if Tenant.query.first():
            print("Database already has tenants. Skipping seed.")
            return

        # Demo tenant
        tenant = Tenant(
            slug="demo",
            business_name="Demo Coffee Shop",
            owner_email="demo@example.com",
            tax_rate=0.08,
            currency_symbol="$",
            brand_primary="#b45309",
            brand_primary_hover="#92400e",
            brand_navbar_bg="#451a03",
        )
        db.session.add(tenant)
        db.session.flush()

        # Admin user for demo tenant
        admin = User(
            tenant_id=tenant.id,
            username="admin",
            display_name="Demo Admin",
            role="admin",
        )
        admin.set_password("admin")
        db.session.add(admin)

        # Cashier user
        cashier = User(
            tenant_id=tenant.id,
            username="cashier",
            display_name="Front Register",
            role="cashier",
        )
        cashier.set_password("cashier")
        db.session.add(cashier)

        # Categories
        categories = {
            "Drinks": "#3b82f6",
            "Food": "#f59e0b",
            "Snacks": "#22c55e",
            "Desserts": "#ec4899",
        }
        cat_objs = {}
        for name, color in categories.items():
            cat = Category(tenant_id=tenant.id, name=name, color=color)
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
            ("Muffin", "DST-001", 4.00, 1.75, 30, "Desserts"),
            ("Brownie", "DST-002", 3.50, 1.50, 25, "Desserts"),
            ("Cheesecake Slice", "DST-003", 5.50, 2.50, 15, "Desserts"),
        ]
        for name, sku, price, cost, stock, cat_name in products:
            p = Product(
                tenant_id=tenant.id,
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

        db.session.commit()
        print("Demo tenant seeded successfully!")
        print(f"  - Tenant: demo (Demo Coffee Shop)")
        print(f"  - POS URL: /demo/")
        print(f"  - Tenant login: admin/admin or cashier/cashier")
        print(f"  - Super admin: /superadmin/login (superadmin/changeme)")


if __name__ == "__main__":
    seed()
