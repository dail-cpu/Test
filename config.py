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
