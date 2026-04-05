import os

basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", os.urandom(32).hex())
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", f"sqlite:///{os.path.join(basedir, 'instance', 'pos.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Platform branding (your SaaS name)
    PLATFORM_NAME = os.environ.get("PLATFORM_NAME", "GenPOS")
    PLATFORM_TAGLINE = os.environ.get("PLATFORM_TAGLINE", "Point of Sale for Modern Businesses")

    # Super admin credentials (created on first run)
    SUPERADMIN_USERNAME = os.environ.get("SUPERADMIN_USERNAME", "superadmin")
    SUPERADMIN_PASSWORD = os.environ.get("SUPERADMIN_PASSWORD", "changeme")

    # Stripe (set these to enable billing)
    STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "")
    STRIPE_PUBLISHABLE_KEY = os.environ.get("STRIPE_PUBLISHABLE_KEY", "")
    STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

    # Stripe Price IDs for each plan (create these in your Stripe dashboard)
    STRIPE_PRICE_STARTER = os.environ.get("STRIPE_PRICE_STARTER", "")  # e.g. price_xxxxx
    STRIPE_PRICE_PRO = os.environ.get("STRIPE_PRICE_PRO", "")

    # Plan limits
    PLAN_LIMITS = {
        "free": {"products": 15, "users": 1, "custom_branding": False, "label": "Free"},
        "starter": {"products": 100, "users": 5, "custom_branding": True, "label": "Starter - $29/mo"},
        "pro": {"products": 99999, "users": 99999, "custom_branding": True, "label": "Pro - $79/mo"},
    }
