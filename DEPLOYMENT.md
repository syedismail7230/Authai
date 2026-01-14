# Cloudflare Pages Deployment Guide

## Prerequisites
1. Cloudflare account (free tier works)
2. GitHub repository connected

## Option 1: Deploy via Cloudflare Dashboard (Recommended)

### Steps:
1. Go to https://dash.cloudflare.com/
2. Navigate to **Pages** in the left sidebar
3. Click **Create a project**
4. Click **Connect to Git**
5. Select your GitHub repository: `syedismail7230/Authai`
6. Configure build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave as default)

7. Add Environment Variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   VITE_RAZORPAY_KEY_ID=rzp_live_RQuwNOxotGRMaW
   ```

8. Click **Save and Deploy**

## Option 2: Deploy via CLI

### Install Wrangler:
```bash
npm install -g wrangler
```

### Login to Cloudflare:
```bash
wrangler login
```

### Deploy:
```bash
npm run build
wrangler pages deploy dist --project-name=authai-pro
```

## Important Notes:

### Backend Deployment
⚠️ **The Node.js backend (`server/index.js`) cannot run on Cloudflare Pages** (frontend only).

You have 3 options for the backend:

1. **Cloudflare Workers** (Recommended for Cloudflare)
   - Requires rewriting backend as serverless functions
   - Use Cloudflare D1 for database instead of local JSON

2. **Vercel** (Easiest)
   - Deploy backend as Vercel Serverless Functions
   - Keep frontend on Cloudflare Pages
   - Update API_URL in frontend to point to Vercel

3. **Railway/Render** (Traditional)
   - Deploy Node.js backend as-is
   - Update API_URL in frontend

### Recommended Approach:
Deploy **frontend** to Cloudflare Pages and **backend** to Vercel for simplest setup.

## Post-Deployment:
1. Update `VITE_API_URL` environment variable to your backend URL
2. Configure custom domain (optional)
3. Enable HTTPS (automatic)
