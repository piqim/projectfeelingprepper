# Deployment Guide - FeelingPrepper

## 🚀 Deploying Backend to Render.com

### Step 1: Prepare Your Repository
1. Push all changes to your GitHub repository
2. Make sure the `.env` file is in `.gitignore` (environment variables will be set in Render dashboard)

### Step 2: Create Web Service on Render

1. Go to [Render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `piqim/projectfeelingprepper`

### Step 3: Configure Service Settings

**Build & Deploy:**
- **Name**: `feelingprepper-backend`
- **Region**: `Oregon (US West)` or closest to you
- **Branch**: `main`
- **Root Directory**: `server`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

**Instance Type:**
- Select **Free** tier to start

### Step 4: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add:

```
ATLAS_URL = mongodb+srv://admin2028:Ikeepforgettingthepassword@feelingprepper-cluster.9fywffi.mongodb.net/?retryWrites=true&w=majority&appName=feelingprepper-cluster
MONGO_DB = main-db
NODE_ENV = production
FRONTEND_URL = https://your-frontend-url.vercel.app
```

**Important Notes:**
- `PORT` is automatically set by Render (don't add it manually)
- Update `FRONTEND_URL` after deploying your frontend
- Keep your MongoDB credentials secure

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will automatically build and deploy
3. Wait for deployment to complete (usually 2-3 minutes)
4. You'll get a URL like: `https://feelingprepper-backend.onrender.com`

### Step 6: Test Your Backend

Visit: `https://your-backend-url.onrender.com/health`

You should see:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

## 🌐 Deploying Frontend

### Option 1: Vercel (Recommended)

1. Go to [Vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add Environment Variable:
   ```
   VITE_API_URL = https://feelingprepper-backend.onrender.com
   ```

5. Click **Deploy**

### Option 2: Netlify

1. Go to [Netlify.com](https://netlify.com)
2. Click **"Add new site"** → **"Import from Git"**
3. Select your repository
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

5. Add Environment Variable:
   ```
   VITE_API_URL = https://feelingprepper-backend.onrender.com
   ```

6. Click **Deploy**

---

## 🔄 Update Backend CORS After Frontend Deployment

1. Go back to your Render dashboard
2. Navigate to your web service
3. Click **"Environment"**
4. Update `FRONTEND_URL` with your actual frontend URL:
   ```
   FRONTEND_URL = https://your-frontend-app.vercel.app
   ```
5. Save changes (this will trigger a redeploy)

---

## 📝 Local Development After Setup

### Backend (.env file in /server):
```env
ATLAS_URL=mongodb+srv://admin2028:Ikeepforgettingthepassword@feelingprepper-cluster.9fywffi.mongodb.net/?retryWrites=true&w=majority&appName=feelingprepper-cluster
MONGO_DB=main-db
PORT=5050
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (.env.local file in /frontend):
```env
VITE_API_URL=http://localhost:5050
```

### Start Development Servers:

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd frontend
npm run dev
```

---

## ✅ Verification Checklist

- [ ] Backend deployed and accessible at `/health` endpoint
- [ ] MongoDB connection working (check Render logs)
- [ ] Frontend deployed and accessible
- [ ] Frontend can connect to backend API
- [ ] Login/Register functionality works
- [ ] CORS configured correctly (no browser console errors)
- [ ] Environment variables properly set in both platforms

---

## 🐛 Troubleshooting

### Backend Issues:

**"Cannot connect to MongoDB"**
- Check your MongoDB Atlas IP whitelist (allow `0.0.0.0/0` for Render)
- Verify `ATLAS_URL` is correct in environment variables

**"CORS errors"**
- Ensure `FRONTEND_URL` matches your actual frontend URL exactly
- Check Render logs for connection attempts

**"Application failed to start"**
- Check Render logs for specific error messages
- Verify `package.json` has correct `start` script
- Ensure all dependencies are in `dependencies`, not `devDependencies`

### Frontend Issues:

**"Failed to fetch" errors**
- Verify `VITE_API_URL` is set correctly
- Check browser console for the exact URL being called
- Test backend health endpoint directly

**"Authentication not working"**
- Clear browser localStorage
- Check that cookies/credentials are being sent (if using auth tokens)

---

## 📱 Free Tier Limitations

### Render Free Tier:
- ⚠️ **Services spin down after 15 minutes of inactivity**
- First request after spin-down takes ~30-60 seconds
- 750 hours/month free (sufficient for personal projects)

### Solutions:
- Upgrade to paid tier ($7/month) for always-on service
- Use a service like [UptimeRobot](https://uptimerobot.com) to ping your API every 14 minutes
- Accept the cold-start delay for free tier

---

## 🔐 Security Recommendations

1. **Never commit `.env` files to Git**
2. **Rotate MongoDB credentials** after testing
3. **Use environment variables** for all sensitive data
4. **Enable MongoDB IP whitelist** (currently allows all for Render)
5. **Add rate limiting** to your API endpoints (consider express-rate-limit)
6. **Use HTTPS only** in production

---

## 📞 Support

If you encounter issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check browser console for frontend errors
3. Verify environment variables are set correctly
4. Test API endpoints with Postman or curl

---

**Last Updated**: February 14, 2026
**Project**: FeelingPrepper - Mental Health Tracker
