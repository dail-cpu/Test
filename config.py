import os

basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", os.urandom(32).hex())
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", f"sqlite:///{os.path.join(basedir, 'instance', 'pos.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    BUSINESS_NAME = os.environ.get("BUSINESS_NAME", "My Business")
    TAX_RATE = float(os.environ.get("TAX_RATE", "0.0"))
    CURRENCY_SYMBOL = os.environ.get("CURRENCY_SYMBOL", "$")

    # Branding / Theme
    BRAND_PRIMARY = os.environ.get("BRAND_PRIMARY", "#6366f1")
    BRAND_PRIMARY_HOVER = os.environ.get("BRAND_PRIMARY_HOVER", "#4f46e5")
    BRAND_NAVBAR_BG = os.environ.get("BRAND_NAVBAR_BG", "#1e293b")
    BRAND_NAVBAR_TEXT = os.environ.get("BRAND_NAVBAR_TEXT", "#ffffff")
    BRAND_LOGO_URL = os.environ.get("BRAND_LOGO_URL", "")  # URL or path to logo image
    BRAND_FONT = os.environ.get("BRAND_FONT", "")  # Google Font name, e.g. "Inter"
    BRAND_RECEIPT_FOOTER = os.environ.get("BRAND_RECEIPT_FOOTER", "Thank you for your purchase!")
