# 🚀 Step-by-Step Render Deployment Guide for HubTransfer

## What You'll Deploy
- **Backend**: Node.js API server with file handling and WebRTC signaling
- **Frontend**: Static HTML/CSS/JS file transfer interface  
- **Database**: PostgreSQL for storing transfer metadata

## 📋 Prerequisites
- ✅ GitHub repository: https://github.com/haroonishaq1/hubtransfer.git
- ✅ Render account (sign up at https://render.com - free tier available)

---

## 🗄️ STEP 1: Create PostgreSQL Database

1. **Login to Render Dashboard**: https://dashboard.render.com/
2. **Click "New +"** → **"PostgreSQL"**
3. **Configure Database**:
   - **Name**: `hubtransfer-db`
   - **Database**: `sendanywhere_clone` 
   - **User**: `postgres`
   - **Region**: Choose closest to your users (e.g., US East, EU West)
   - **Plan**: **Free** (for development/testing)
   
4. **Click "Create Database"**
5. **⚠️ IMPORTANT**: Save these connection details:
   - **Internal Database URL** (starts with `postgresql://`)
   - **External Database URL** 
   - **Host**, **Username**, **Password**, **Port**

---

## 🔧 STEP 2: Deploy Backend API Service

1. **In Render Dashboard**: Click **"New +"** → **"Web Service"**
2. **Connect Repository**: 
   - Choose **"Build and deploy from a Git repository"**
   - Connect your GitHub account if needed
   - Select: `haroonishaq1/hubtransfer`
   
3. **Configure Service**:
   - **Name**: `hubtransfer-backend`
   - **Environment**: `Node`
   - **Region**: **Same as database**
   - **Branch**: `master`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: **Free**

4. **Environment Variables** (Click "Advanced"):
   
   **Add these manually:**
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=[Generate 32+ character random string - minimum 32 chars]
   ```
   
   **Then connect database:**
   - Click "Add Database"
   - Select your `hubtransfer-db` database
   - This automatically adds `DATABASE_URL` and other DB variables

5. **Click "Create Web Service"**
6. **Wait for deployment** (5-10 minutes)
7. **Note your backend URL**: `https://hubtransfer-backend.onrender.com`

---

## 🌐 STEP 3: Deploy Frontend Static Site

1. **In Render Dashboard**: Click **"New +"** → **"Static Site"**
2. **Connect Repository**: 
   - Choose same repository: `haroonishaq1/hubtransfer`
   
3. **Configure Static Site**:
   - **Name**: `hubtransfer-frontend`
   - **Branch**: `master`
   - **Root Directory**: `frontend`
   - **Build Command**: `echo "Static files ready"`
   - **Publish Directory**: `.` (current directory)
   - **Auto-Deploy**: `Yes`

4. **Click "Create Static Site"**
5. **Wait for deployment** (2-5 minutes)
6. **Note your frontend URL**: `https://hubtransfer-frontend.onrender.com`

---

## ⚙️ STEP 4: Update Configuration (If Needed)

The app is configured to auto-detect Render URLs, but if you used different service names:

1. **Edit `frontend/js/config.js`**:
   ```javascript
   // Update these URLs if you used different service names
   return 'https://YOUR-BACKEND-NAME.onrender.com';
   ```

2. **Edit `backend/server.js`** CORS settings:
   ```javascript
   origin: ['https://YOUR-FRONTEND-NAME.onrender.com', 'https://YOUR-BACKEND-NAME.onrender.com']
   ```

---

## 🧪 STEP 5: Test Your Deployment

### Backend API Test
1. **Visit**: `https://hubtransfer-backend.onrender.com/health`
2. **Should see**: `{"status":"healthy","timestamp":"...","environment":"production"}`

### Frontend Test
1. **Visit**: `https://hubtransfer-frontend.onrender.com`
2. **Test file upload/download with 6-digit codes**

### Full Integration Test
1. **Upload a file** on frontend
2. **Get 6-digit code**
3. **Use code to download** in another browser/tab
4. **Verify WebRTC connection works**

---

## 🔧 STEP 6: Custom Domain (Optional)

### For Frontend
1. **In Static Site Settings** → **"Custom Domains"**
2. **Add your domain**: `www.yourdomain.com`
3. **Configure DNS** as instructed by Render

### For Backend API
1. **In Web Service Settings** → **"Custom Domains"**  
2. **Add API subdomain**: `api.yourdomain.com`

---

## 📊 STEP 7: Monitor Your App

### Render Dashboard Features
- **📈 Metrics**: CPU, memory, request volume
- **📝 Logs**: Real-time application logs
- **⚡ Auto-deploy**: Pushes to GitHub auto-deploy
- **🔄 Auto-scaling**: Free tier sleeps after 15min inactivity

### Key URLs to Bookmark
- **Frontend**: https://hubtransfer-frontend.onrender.com
- **Backend**: https://hubtransfer-backend.onrender.com  
- **Database**: Manage via Render dashboard
- **Health Check**: https://hubtransfer-backend.onrender.com/health

---

## ⚠️ Important Notes

### Free Tier Limitations
- **Sleep after 15 minutes** of inactivity (30-60 sec cold start)
- **750 hours/month** runtime per service
- **1GB database storage**
- **100GB bandwidth/month**

### Production Considerations
- **Upgrade to paid plans** for always-on services
- **Add monitoring** for uptime/performance
- **Configure backups** for database
- **Set up alerts** for service health

### Security
- **HTTPS enabled** by default
- **Environment variables** are encrypted
- **Database connections** use SSL
- **CORS configured** for your domains

---

## 🚨 Troubleshooting

### Service Won't Start
1. **Check logs** in Render dashboard
2. **Verify environment variables** are set correctly
3. **Check database connection** string

### Database Connection Issues
1. **Use Internal Database URL** for backend connections
2. **Verify SSL settings** in production
3. **Check database is running** in dashboard

### Frontend Can't Connect to Backend
1. **Verify CORS settings** in backend
2. **Check backend URL** in frontend config
3. **Ensure both services** are deployed

### Files Not Uploading
1. **Check file size limits** (Render has 100MB limit)
2. **Verify storage directory** permissions
3. **Check backend logs** for errors

---

## 🎉 Success!

Your HubTransfer app should now be running on Render! 

- **Frontend**: https://hubtransfer-frontend.onrender.com
- **Backend**: https://hubtransfer-backend.onrender.com

The app will auto-deploy when you push changes to GitHub. Monitor the Render dashboard for deployment status and logs.

---

## 📞 Need Help?

- **Render Documentation**: https://render.com/docs
- **GitHub Repository**: https://github.com/haroonishaq1/hubtransfer
- **Check service logs** in Render dashboard for detailed error messages
