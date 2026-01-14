# Full-Stack Deployment Guide: Cloudflare Pages + Vercel

## Architecture
- **Frontend**: Cloudflare Pages (React/Vite)
- **Backend**: Vercel (Node.js/Express)

---

## Part 1: Deploy Backend to Vercel

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy Backend
```bash
vercel --prod
```

**Follow the prompts:**
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? **authai-backend** (or your choice)
- Directory? **./** (press Enter)
- Override settings? **N**

### Step 4: Add Environment Variables in Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project **authai-backend**
3. Go to **Settings** → **Environment Variables**
4. Add these variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   RAZORPAY_KEY_ID=rzp_live_RQuwNOxotGRMaW
   RAZORPAY_KEY_SECRET=your_secret
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=production
   ```

5. Click **Save**
6. Redeploy: `vercel --prod`

### Step 5: Note Your Backend URL
After deployment, Vercel will give you a URL like:
```
https://authai-backend.vercel.app
```
**Save this URL - you'll need it for frontend deployment!**

---

## Part 2: Deploy Frontend to Cloudflare Pages

### Method A: Via Cloudflare Dashboard (Easiest)

1. Go to https://dash.cloudflare.com/
2. Navigate to **Pages** → **Create a project**
3. Click **Connect to Git**
4. Select repository: **syedismail7230/Authai**
5. Configure build:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`

6. **Environment Variables** (CRITICAL):
   ```
   VITE_API_URL=https://authai-backend.vercel.app
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_RAZORPAY_KEY_ID=rzp_live_RQuwNOxotGRMaW
   ```

7. Click **Save and Deploy**

### Method B: Via Wrangler CLI

```bash
# Build the frontend
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=authai-pro
```

---

## Part 3: Post-Deployment Configuration

### Update API URLs
If you used the dashboard method, Cloudflare will automatically inject the environment variables during build.

If deploying via CLI, update `services/geminiService.ts`:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'https://authai-backend.vercel.app';
```

### Test Your Deployment
1. Visit your Cloudflare Pages URL (e.g., `https://authai-pro.pages.dev`)
2. Test login/register
3. Test payment flow
4. Verify WebSocket connections work

---

## Part 4: Custom Domain (Optional)

### For Frontend (Cloudflare Pages):
1. Go to your Pages project
2. Click **Custom domains**
3. Add `authai.pro`
4. Follow DNS configuration instructions

### For Backend (Vercel):
1. Go to your Vercel project
2. Click **Settings** → **Domains**
3. Add `api.authai.pro`
4. Update frontend `VITE_API_URL` to `https://api.authai.pro`

---

## Troubleshooting

### Backend Issues:
- Check Vercel logs: `vercel logs`
- Verify environment variables are set
- Ensure `server/local_database.json` is in `.gitignore` (use Supabase in production)

### Frontend Issues:
- Check build logs in Cloudflare dashboard
- Verify `VITE_API_URL` points to correct Vercel URL
- Clear browser cache

### CORS Issues:
The backend already has CORS configured for all origins. If issues persist, update `server/index.js`:
```javascript
app.use(cors({
  origin: 'https://authai-pro.pages.dev',
  credentials: true
}));
```

---

## Quick Commands Reference

```bash
# Deploy backend
vercel --prod

# Deploy frontend (after build)
npm run build
npx wrangler pages deploy dist --project-name=authai-pro

# View backend logs
vercel logs

# Redeploy after changes
git push origin main  # Auto-deploys both if connected to Git
```

---

## Success Checklist
- [ ] Backend deployed to Vercel
- [ ] Backend environment variables configured
- [ ] Backend URL noted
- [ ] Frontend deployed to Cloudflare Pages
- [ ] Frontend environment variables configured with backend URL
- [ ] Login/Register working
- [ ] Payment flow working
- [ ] WebSocket real-time updates working
- [ ] Custom domain configured (optional)

Your app should now be live! 🚀
