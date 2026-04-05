# GenPOS - Generic Point of Sale System

A lightweight, web-based POS system built for small and startup businesses. Runs on Python/Flask with SQLite — no complex infrastructure needed.

## Features

- **POS Terminal** — Fast product grid with category filtering, search, cart management, and keyboard shortcuts
- **Multiple Payment Methods** — Cash (with change calculation) and card support
- **Receipt Generation** — On-screen receipts with print support
- **Inventory Management** — Product catalog with categories, SKUs, stock tracking, and cost/price management
- **Sales History** — Searchable transaction log with receipt detail view
- **Reports Dashboard** — Revenue, profit, top products, payment breakdown, and daily trends
- **User Management** — Admin and cashier roles with secure authentication
- **Discounts & Notes** — Per-sale discount and note support
- **Configurable** — Business name, tax rate, and currency via environment variables
- **Responsive** — Works on desktop and tablet screens

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run the app
python app.py

# (Optional) Seed with sample data
python seed.py
```

Open http://localhost:5000 and log in with `admin` / `admin`.

## Configuration

Set these environment variables to customize:

| Variable | Default | Description |
|---|---|---|
| `BUSINESS_NAME` | My Business | Shown in navbar and receipts |
| `TAX_RATE` | 0.0 | Tax rate as decimal (e.g., 0.08 for 8%) |
| `CURRENCY_SYMBOL` | $ | Currency symbol for display |
| `SECRET_KEY` | (random) | Flask session secret key |
| `DATABASE_URL` | sqlite:///pos.db | Database connection string |

## Keyboard Shortcuts (POS Terminal)

| Key | Action |
|---|---|
| F2 | Cash payment |
| F3 | Card payment |
| F4 | Clear cart |
| Esc | Close modal |

## Default Users

| Username | Password | Role |
|---|---|---|
| admin | admin | Administrator |
| cashier | cashier | Cashier (after seeding) |

> **Important:** Change the default passwords before deploying to production.

## Tech Stack

- **Backend:** Python, Flask, SQLAlchemy
- **Database:** SQLite (swap to PostgreSQL/MySQL via `DATABASE_URL`)
- **Frontend:** Vanilla HTML/CSS/JS (no build step needed)
- **Auth:** Flask-Login with password hashing
