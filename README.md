# GenPOS - Point of Sale SaaS Platform

A multi-tenant, web-based POS system you can sell to businesses. Each business signs up, gets their own branded POS at a unique URL, and starts selling immediately. You manage everything from a super admin dashboard.

## How It Works

```
Your Platform (yoursite.com)
  |
  +-- /                    Landing page (marketing)
  +-- /signup              Business self-signup
  +-- /superadmin          Your admin dashboard
  |
  +-- /joes-coffee/        Joe's Coffee POS
  +-- /main-st-deli/       Main St Deli POS
  +-- /corner-bakery/      Corner Bakery POS
  ...each business is fully isolated
```

## Features

### For Your Clients (Business Owners)
- **Self-Signup** — Create a POS in 30 seconds, no credit card required
- **POS Terminal** — Product grid, cart, cash/card checkout, receipts
- **Inventory** — Products, categories, SKUs, stock tracking
- **Sales History** — Transaction log with receipt detail view
- **Reports** — Revenue, profit, top products, daily trends
- **Team Management** — Admin and cashier roles
- **Branding** — Custom colors, logo, font, receipt footer via Settings page
- **Configurable** — Tax rate, currency symbol per business

### For You (Platform Owner)
- **Super Admin Dashboard** — See all businesses, their revenue, user counts
- **Suspend/Activate** — Control tenant access with one click
- **Zero Setup Per Client** — They sign up and configure everything themselves
- **Multi-Tenant Isolation** — Each business only sees their own data

## Quick Start

```bash
pip install -r requirements.txt
python app.py
```

Open http://localhost:8080

- **Landing page:** `/`
- **Signup:** `/signup`
- **Super admin:** `/superadmin/login` (superadmin / changeme)

### Load Demo Data (Optional)
```bash
python seed.py
```
Creates a demo tenant at `/demo/` with sample products (login: admin / admin).

## Deploy with Docker

```bash
docker compose up -d
```

Or deploy to any platform that supports Docker (Railway, Render, Fly.io, DigitalOcean App Platform).

## Configuration

| Variable | Default | Description |
|---|---|---|
| `PLATFORM_NAME` | GenPOS | Your SaaS brand name |
| `PLATFORM_TAGLINE` | Point of Sale for Modern Businesses | Landing page headline |
| `SUPERADMIN_USERNAME` | superadmin | Platform admin login |
| `SUPERADMIN_PASSWORD` | changeme | Platform admin password |
| `SECRET_KEY` | (random) | Flask session secret |
| `DATABASE_URL` | sqlite:///pos.db | Database (supports PostgreSQL) |

## Tech Stack

- **Backend:** Python, Flask, SQLAlchemy
- **Database:** SQLite (swap to PostgreSQL via `DATABASE_URL`)
- **Frontend:** Vanilla HTML/CSS/JS (no build step)
- **Auth:** Flask-Login with pbkdf2 password hashing
- **Deploy:** Docker / Gunicorn
