# Render Deployment Guide for HubTransfer

## Prerequisites
1. GitHub repository with your code
2. Render account (free tier available)
3. PostgreSQL database (can be created on Render)

## Deployment Steps

### Step 1: Create PostgreSQL Database on Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "PostgreSQL"
3. Configure database:
   - **Name**: `hubtransfer-db`
   - **Database**: `sendanywhere_clone`
   - **User**: `postgres`
   - **Region**: Choose closest to your users
   - **Plan**: Free (for development)
4. Click "Create Database"
5. **Important**: Save the database connection details (Internal Database URL)

### Step 2: Deploy Backend Service
1. In Render Dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository: `https://github.com/haroonishaq1/hubtransfer.git`
3. Configure service:
   - **Name**: `hubtransfer-backend`
   - **Environment**: `Node`
   - **Region**: Same as database
   - **Branch**: `master`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Environment Variables** (Add these in Environment tab):
   ```
   NODE_ENV=production
   PORT=10000
   DB_USER=postgres
   DB_HOST=[Your DB Host from Step 1]
   DB_NAME=sendanywhere_clone
   DB_PASSWORD=[Your DB Password from Step 1]
   DB_PORT=5432
   JWT_SECRET=[Generate a secure random string]
   DATABASE_URL=[Full database URL from Step 1]
   ```

5. Click "Create Web Service"

### Step 3: Deploy Frontend Service
1. In Render Dashboard, click "New +" → "Static Site"
2. Connect the same GitHub repository
3. Configure:
   - **Name**: `hubtransfer-frontend`
   - **Branch**: `master`
   - **Root Directory**: `frontend`
   - **Build Command**: Leave empty or use `echo "Static files ready"`
   - **Publish Directory**: `.`

4. Click "Create Static Site"

### Step 4: Update Frontend Configuration
After backend deployment, you'll get a backend URL like:
`https://hubtransfer-backend.onrender.com`

Update your frontend JavaScript files to use this URL instead of localhost.

### Step 5: Configure Custom Domain (Optional)
1. In your static site settings, go to "Custom Domains"
2. Add your domain and configure DNS records

## Important Notes

### Database Setup
- Your database will be automatically created when the backend service starts
- The connection will use the DATABASE_URL environment variable
- Make sure your database migration/setup scripts run on first deployment

### Environment Variables Security
- Never commit .env files to Git
- Use Render's environment variables for all sensitive data
- Generate a strong JWT_SECRET (minimum 32 characters)

### Free Tier Limitations
- Services sleep after 15 minutes of inactivity
- 750 hours/month of runtime
- Database storage: 1GB
- Consider upgrading for production use

### Troubleshooting
- Check logs in Render dashboard for deployment issues
- Ensure all environment variables are set correctly
- Verify database connection in backend logs

## Post-Deployment Checklist
- [ ] Backend service is running and accessible
- [ ] Frontend is deployed and loading
- [ ] Database connection is working
- [ ] File upload/download functionality works
- [ ] WebRTC peer-to-peer connections work
- [ ] All environment variables are configured
- [ ] Custom domain configured (if applicable)

## URLs After Deployment
- **Backend API**: `https://hubtransfer-backend.onrender.com`
- **Frontend**: `https://hubtransfer-frontend.onrender.com`
- **Database**: `postgresql://[credentials]@[host]/[database]`
