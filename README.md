# Amazon → Pinterest Board

A Next.js app that lets you import Amazon affiliate products and pin them to Pinterest with one click.

## Features

- Paste Amazon affiliate links (one per line) to import products
- Auto-fetches: title, image, price, rating, description
- Masonry-style product grid
- One-click **Pin to Pinterest** button on every product card
- Products stored in MongoDB (persist across sessions)
- Deploy-ready for **Vercel** + **MongoDB Atlas** (free tiers work great)

---

## Setup

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd amazon-pinterest-board
npm install
```

### 2. Set up MongoDB

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free cluster
2. Create a database user (username + password)
3. Whitelist your IP (or use `0.0.0.0/0` for Vercel)
4. Get your connection string from **Connect → Drivers**

### 3. Configure Environment

Copy the example file and fill in your MongoDB URI:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
MONGODB_URI=mongodb+srv://youruser:yourpassword@yourcluster.mongodb.net/amazon-pinterest?retryWrites=true&w=majority
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. In **Environment Variables**, add:
   - `MONGODB_URI` = your MongoDB Atlas connection string
4. Click **Deploy**

That's it! Vercel auto-detects Next.js and deploys serverless functions for the API routes.

---

## How to Use

1. Click **"Add Products"** in the top-right
2. Paste your Amazon affiliate links, one per line:
   ```
   https://www.amazon.com/dp/B08N5KWB9H?tag=yourtag-20
   https://amzn.to/3xYzAbc
   ```
3. Click **"Fetch and Import"** — the app scrapes each product page
4. Products appear as cards in the grid
5. Click **"Pin It"** on any card to open the Pinterest pin creator with the product image and description pre-filled
6. Hover over a card to see the **delete** button (trash icon)

---

## Notes on Amazon Scraping

Amazon actively blocks scrapers. If products fail to import:
- Try full Amazon URLs with your affiliate tag (e.g., `amazon.com/dp/ASIN?tag=...`)
- Some regions may be blocked — you may need a proxy service
- Consider using the **Amazon Product Advertising API** for production use (requires approval)

---

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **MongoDB + Mongoose**
- **Cheerio** (HTML parsing)
- **Pinterest Pin It API** (standard web share button)

"# amazon-pinterest" 
