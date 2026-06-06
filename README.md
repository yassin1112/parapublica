# ParaPublic

Parapharmacy store — **HTML + CSS + JavaScript** frontend with **Express + MongoDB** backend.

## Requirements

- [Node.js](https://nodejs.org/) 18+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally, or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string

## Setup

```bash
cd C:\Users\Dell\Downloads\yassin basa
npm install
copy .env.example .env
```

Edit `.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/parapublic
JWT_SECRET=your-secret-key
PORT=3000
```

Seed the database (first time only):

```bash
npm run seed
```

Start the server:

```bash
npm start
```

Open: **http://localhost:3000**

## MongoDB Atlas troubleshooting

| Error | What to do |
|--------|------------|
| `querySrv ECONNREFUSED` | DNS cannot resolve Atlas. Run `npm run seed` again (app uses 8.8.8.8 for SRV), or set Windows DNS to **8.8.8.8** / **8.8.4.4**, or paste Atlas **Standard** `mongodb://…` URI into `.env` |
| `ECONNREFUSED 127.0.0.1:27017` | Local MongoDB is not running — use Atlas or install MongoDB locally |
| Authentication failed | Check username/password in `.env`; URL-encode special characters in the password |

Atlas checklist: **Network Access** (your IP), **Database Access** user, URI ends with **`/parapublic`** (or your DB name).

## Demo accounts

| Role | Email | Password |
|------|--------|----------|
| Admin | admin-para@gmail.com | 23698716 |
| Client | client@parapublic.com | Client@12345 |

Reset admin only: `npm run seed:admin`

## Features

- EN / FR / AR languages + dark mode
- Products, cart, **guest checkout** (no login required)
- Checkout: 8 TND delivery, TND payment, order confirmation page
- **Password reset** via `forgot-password.html` (link shown after request when MongoDB is running)
- Admin: products, stock, orders (refresh + guest badge), users
- **MongoDB** stores users, products, orders, stock movements

## Guest checkout

1. Add products to cart → **Checkout**
2. Fill name, phone, email, address — no account needed
3. After payment confirmation you land on `order-success.html` with order details
4. Admin sees the order under **Admin → Orders** (click refresh if needed)

## Password reset

1. Open **Login** → **Forgot password?** (or `forgot-password.html`)
2. Enter your account email
3. In development, the reset link is shown on screen (valid 1 hour)
4. Set a new password on `reset-password.html`, then log in

## API (prefix `/api`)

- `POST /auth/register` · `POST /auth/login` · `GET /auth/me`
- `POST /auth/forgot-password` · `POST /auth/reset-password`
- `GET /categories` · `GET /products`
- `POST /orders` (guest or logged-in) · `GET /orders/track?orderId&email`
- `GET /orders` · `GET /orders/all` (admin)
- `GET /users` (admin) · `POST /stock/adjust` (admin)

Cart stays in the browser; everything else is in MongoDB.

## Product catalog backup (`data/products-catalog.json`)

Every product add/update/delete in the admin is mirrored to **`data/products-catalog.json`** so products are not lost.

| Command | What it does |
|---------|----------------|
| `npm run catalog:scrape` | Import all products from [parafendri.tn](https://parafendri.tn) (images, prices, promos) |
| `npm run catalog:scrape:desc` | Same + fetch full descriptions (slower) |
| `npm run catalog:import` | Load the JSON file into MongoDB |
| `npm run catalog:export` | Save current MongoDB products back to the JSON file |

After scraping: `npm run catalog:import` then commit `data/products-catalog.json` to GitHub.

## Deploy on Vercel

1. Push to GitHub: `vercel.json`, `package.json`, `api/`, `scripts/vercel-build.js`, `server/`, all `.html`, `assets/`, `admin/`.
2. Vercel → **Framework Preset: Other** (not Next.js).
3. **Do not** override Build/Output in the Vercel UI — `vercel.json` already sets:
   - `buildCommand`: `npm run build`
   - `outputDirectory`: `public`
   - Node **20.x** (`package.json` `engines`)
4. **Environment Variables:** `MONGODB_URI` (required, with DB name e.g. `/parapharmasi`).
5. Deploy. Build copies the site into `public/`; `/api/*` runs serverless functions in `api/`.
6. Import products once from your PC (same Atlas DB): `npm run catalog:import`
6. Seed the **same** Atlas database once from your PC:

```bash
npm install
# .env with the same MONGODB_URI as Vercel
npm run seed
```

5. Open your Vercel URL and log in as admin: `admin-para@gmail.com` / `23698716`

**If the site is blank or 404:** push latest `vercel.json`, remove any custom Output Directory in Vercel UI (let `vercel.json` control it), **Redeploy → Clear build cache**, test `/` and `/api/products`.

**Node warning on Vercel:** use `"node": "20.x"` in `package.json` (not `>=18`).

**If build fails:** run `npm run build` locally — must create `public/index.html`.

**Admin:** Products — add, edit, inline stock update. Stock — movements (in/out/adjustment).
