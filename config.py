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
