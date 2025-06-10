# 📋 Render Deployment Checklist for HubTransfer

## Pre-Deployment ✅

- [ ] GitHub repository is public and accessible
- [ ] Code is pushed to the `master` branch
- [ ] Render account created (free tier is fine)
- [ ] All configuration files are in place

## Database Setup ✅

- [ ] PostgreSQL database created on Render
- [ ] Database name: `sendanywhere_clone`
- [ ] Database connection details saved:
  - [ ] Internal Database URL
  - [ ] Host, Username, Password, Port

## Backend Deployment ✅

- [ ] Web Service created with name: `hubtransfer-backend`
- [ ] Repository connected: `haroonishaq1/hubtransfer`
- [ ] Root directory set to: `backend`
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Environment variables configured:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=10000`
  - [ ] `DB_USER=postgres`
  - [ ] `DB_HOST=[from database]`
  - [ ] `DB_NAME=sendanywhere_clone`
  - [ ] `DB_PASSWORD=[from database]`
  - [ ] `DB_PORT=5432`
  - [ ] `JWT_SECRET=[32+ character string]`
  - [ ] `DATABASE_URL=[full database URL]`
- [ ] Service deployed successfully
- [ ] Health check works: `/health` endpoint returns `200 OK`

## Frontend Deployment ✅

- [ ] Static Site created with name: `hubtransfer-frontend`
- [ ] Repository connected: `haroonishaq1/hubtransfer`
- [ ] Root directory set to: `frontend`
- [ ] Build command: `echo "Static files ready"`
- [ ] Publish directory: `.`
- [ ] Auto-deploy enabled
- [ ] Site deployed successfully
- [ ] Frontend loads in browser

## Testing ✅

- [ ] Backend API responds: `https://hubtransfer-backend.onrender.com/health`
- [ ] Frontend loads: `https://hubtransfer-frontend.onrender.com`
- [ ] File upload works (generates 6-digit code)
- [ ] File download works (using 6-digit code)
- [ ] WebRTC peer-to-peer connection establishes
- [ ] Files transfer successfully between browsers
- [ ] Socket.io connection is stable

## Production Checklist ✅

- [ ] CORS configured correctly for production domains
- [ ] SSL/HTTPS working on both services
- [ ] Database SSL connection enabled
- [ ] Error logging and monitoring set up
- [ ] Performance acceptable (cold start under 60 seconds)

## Optional Enhancements ✅

- [ ] Custom domain configured for frontend
- [ ] Custom domain configured for backend API
- [ ] Monitoring/alerting set up
- [ ] Database backups configured
- [ ] CDN for static assets (if needed)

## Service URLs 📋

Fill in your actual deployment URLs:

- **Frontend**: `https://hubtransfer-frontend.onrender.com`
- **Backend**: `https://hubtransfer-backend.onrender.com`
- **Database**: `postgresql://[credentials]@[host]/sendanywhere_clone`
- **Health Check**: `https://hubtransfer-backend.onrender.com/health`

## Common Issues & Solutions 🔧

### Service Won't Start
- Check environment variables are set correctly
- Verify database connection string
- Review build logs in Render dashboard

### Frontend Can't Connect to Backend
- Confirm CORS settings include frontend domain
- Verify backend URL in `frontend/js/config.js`
- Check both services are deployed and running

### Database Connection Fails
- Use Internal Database URL for backend connections
- Ensure SSL is configured for production
- Verify database service is running

### Files Not Uploading/Downloading
- Check file size limits (100MB max on free tier)
- Verify storage permissions
- Review backend logs for specific errors

## Support Resources 📚

- **Render Docs**: https://render.com/docs
- **Repository**: https://github.com/haroonishaq1/hubtransfer
- **Service Logs**: Available in Render dashboard
- **Community**: Render Discord/Community Forums

---

**Deployment Date**: ___________  
**Deployed By**: ___________  
**Version**: v1.0.0  
**Status**: [ ] Development [ ] Staging [ ] Production
