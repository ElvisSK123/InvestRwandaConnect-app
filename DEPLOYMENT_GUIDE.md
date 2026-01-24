# InvestRwanda Deployment Guide

This guide covers multiple deployment options for the InvestRwanda investment marketplace platform.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Deployment Options](#deployment-options)
3. [Docker Deployment (Recommended)](#docker-deployment)
4. [Cloud Platform Deployments](#cloud-platform-deployments)
5. [Environment Configuration](#environment-configuration)
6. [Post-Deployment Setup](#post-deployment-setup)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- Docker & Docker Compose (recommended)
- Node.js 18+ (for manual deployment)
- PostgreSQL 15+ (for manual deployment)
- Git

### Domain & SSL (Production)
- Domain name configured
- SSL certificate (Let's Encrypt recommended)

---

## Deployment Options

### 1. 🐳 Docker Deployment (Easiest)
Best for: Quick deployment, development, testing

### 2. ☁️ Cloud Platforms
- **Railway** - Fastest, auto-deploys from GitHub
- **Render** - Simple, free tier available
- **DigitalOcean** - Full control, VPS deployment
- **AWS** - Enterprise-grade, scalable
- **Heroku** - Easy, good for startups
- **Vercel/Netlify** - Frontend only (requires separate backend)

---

## Docker Deployment

### Option A: Development (Current Setup)

Already running! Your containers are up at:
- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- Database: localhost:5432

```powershell
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

### Option B: Production Deployment

#### Step 1: Configure Environment

Edit `.env.production`:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=investrwanda
JWT_SECRET=generate-a-strong-secret-key
VITE_API_URL=http://your-domain.com:4000
NODE_ENV=production
```

#### Step 2: Build and Deploy

```powershell
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

#### Step 3: Access Application

- Frontend: http://your-server-ip (port 80)
- Backend API: http://your-server-ip:4000
- Admin Portal: http://your-server-ip/admin/portal

---

## Cloud Platform Deployments

### 🚂 Railway (Recommended for Beginners)

**Easiest deployment - 5 minutes!**

#### Setup Instructions:

1. **Create Railway Account**
   - Visit https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `ElvisSK123/InvestRwandaConnect-app`

3. **Add PostgreSQL Database**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway auto-configures connection

4. **Configure Backend Service**
   - Add service from repo: `/server`
   - Add environment variables:
     ```
     NODE_ENV=production
     PORT=4000
     JWT_SECRET=your-secret-key
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     ```
   - Set build command: `npm install`
   - Set start command: `npm start`

5. **Configure Frontend Service**
   - Add service from repo: `/client`
   - Add environment variables:
     ```
     VITE_API_URL=${{Backend.RAILWAY_PUBLIC_DOMAIN}}
     ```
   - Set build command: `npm install && npm run build`
   - Set start command: `npm run preview`

6. **Deploy**
   - Railway auto-deploys on push
   - Get public URLs from dashboard
   - Update VITE_API_URL with backend URL

**Cost**: Free tier includes 500 hours/month

---

### 🎨 Render

**Great for full-stack apps**

#### Setup Instructions:

1. **Create Render Account**
   - Visit https://render.com
   - Sign up with GitHub

2. **Create PostgreSQL Database**
   - Dashboard → "New" → "PostgreSQL"
   - Name: `investrwanda-db`
   - Plan: Free
   - Note the connection details

3. **Deploy Backend**
   - Dashboard → "New" → "Web Service"
   - Connect GitHub repo
   - Settings:
     - Name: `investrwanda-backend`
     - Root Directory: `server`
     - Build Command: `npm install`
     - Start Command: `npm start`
   - Environment Variables:
     ```
     NODE_ENV=production
     PORT=4000
     JWT_SECRET=your-secret-key
     DB_HOST=<from database>
     DB_PORT=5432
     DB_USER=<from database>
     DB_PASSWORD=<from database>
     DB_NAME=<from database>
     ```

4. **Deploy Frontend**
   - Dashboard → "New" → "Static Site"
   - Connect GitHub repo
   - Settings:
     - Name: `investrwanda-frontend`
     - Root Directory: `client`
     - Build Command: `npm install && npm run build`
     - Publish Directory: `dist`
   - Environment Variables:
     ```
     VITE_API_URL=https://investrwanda-backend.onrender.com
     ```

5. **Run Database Migrations**
   - In backend service shell:
     ```bash
     psql $DATABASE_URL < schema.sql
     psql $DATABASE_URL < migrate.sql
     ```

**Cost**: Free tier available (spins down after inactivity)

---

### 🌊 DigitalOcean Droplet

**Full control, VPS deployment**

#### Setup Instructions:

1. **Create Droplet**
   - OS: Ubuntu 22.04 LTS
   - Size: $12/month (2GB RAM minimum)
   - Enable backups (recommended)

2. **Connect via SSH**
   ```bash
   ssh root@your-droplet-ip
   ```

3. **Install Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Install Docker Compose
   apt install docker-compose -y
   ```

4. **Clone Repository**
   ```bash
   git clone https://github.com/ElvisSK123/InvestRwandaConnect-app.git
   cd InvestRwandaConnect-app
   ```

5. **Configure Environment**
   ```bash
   cp .env.production .env
   nano .env  # Edit with your values
   ```

6. **Deploy with Docker**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

7. **Setup Nginx Reverse Proxy**
   ```bash
   apt install nginx certbot python3-certbot-nginx -y
   ```

   Create `/etc/nginx/sites-available/investrwanda`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:80;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /api {
           proxy_pass http://localhost:4000;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
       }
   }
   ```

   Enable site:
   ```bash
   ln -s /etc/nginx/sites-available/investrwanda /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

8. **Setup SSL**
   ```bash
   certbot --nginx -d your-domain.com
   ```

**Cost**: Starting at $12/month

---

### ☁️ AWS (Enterprise Deployment)

**Scalable, production-ready**

#### Services Used:
- **ECS/Fargate** - Container orchestration
- **RDS PostgreSQL** - Managed database
- **Application Load Balancer** - Traffic distribution
- **CloudFront** - CDN for frontend
- **S3** - Static assets
- **Route 53** - DNS management

#### Quick Setup with ECS:

1. **Create RDS Database**
   - Engine: PostgreSQL 15
   - Instance: db.t3.micro (free tier)
   - Enable automatic backups

2. **Push Images to ECR**
   ```powershell
   # Authenticate
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

   # Build and push backend
   docker build -t investrwanda-backend ./server
   docker tag investrwanda-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/investrwanda-backend:latest
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/investrwanda-backend:latest

   # Build and push frontend
   docker build -t investrwanda-frontend -f ./client/Dockerfile.prod ./client
   docker tag investrwanda-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/investrwanda-frontend:latest
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/investrwanda-frontend:latest
   ```

3. **Create ECS Cluster**
   - Cluster name: `investrwanda-cluster`
   - Infrastructure: AWS Fargate

4. **Create Task Definitions**
   - Backend task with environment variables
   - Frontend task with API URL

5. **Create Services**
   - Deploy tasks behind ALB
   - Configure health checks
   - Enable auto-scaling

6. **Configure ALB**
   - Route `/api/*` to backend
   - Route `/*` to frontend

**Cost**: ~$30-50/month (with free tier), scales with usage

---

### 🟣 Heroku

**Simple platform, good for MVPs**

#### Setup Instructions:

1. **Install Heroku CLI**
   ```powershell
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login**
   ```powershell
   heroku login
   ```

3. **Create Apps**
   ```powershell
   # Backend
   heroku create investrwanda-backend
   
   # Frontend
   heroku create investrwanda-frontend
   ```

4. **Add PostgreSQL**
   ```powershell
   heroku addons:create heroku-postgresql:mini -a investrwanda-backend
   ```

5. **Deploy Backend**
   ```powershell
   # Add heroku remote
   cd server
   git init
   heroku git:remote -a investrwanda-backend
   
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret
   
   # Deploy
   git add .
   git commit -m "Deploy backend"
   git push heroku main
   
   # Run migrations
   heroku run bash
   psql $DATABASE_URL < schema.sql
   psql $DATABASE_URL < migrate.sql
   ```

6. **Deploy Frontend**
   ```powershell
   cd ../client
   git init
   heroku git:remote -a investrwanda-frontend
   
   # Set environment variables
   heroku config:set VITE_API_URL=https://investrwanda-backend.herokuapp.com
   
   # Deploy
   git add .
   git commit -m "Deploy frontend"
   git push heroku main
   ```

**Cost**: $5-7/month per dyno (hobby tier)

---

## Environment Configuration

### Required Environment Variables

#### Backend (.env)
```env
NODE_ENV=production
PORT=4000
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=investrwanda
JWT_SECRET=your-super-secret-jwt-key
```

#### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.com
```

### Generating Secure JWT Secret

```powershell
# PowerShell
$bytes = New-Object Byte[] 32
[Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

---

## Post-Deployment Setup

### 1. Create Admin User

Connect to your database and run:
```sql
-- Register a user first through the UI, then update their role
UPDATE users SET role = 'admin' WHERE email = 'admin@investrwanda.com';
```

Or use the provided script:
```powershell
docker exec -it investrwanda_db_prod psql -U postgres -d investrwanda < server/create-admin.sql
```

### 2. Verify Deployment

- [ ] Frontend loads correctly
- [ ] Can register new users
- [ ] Can login successfully
- [ ] Entrepreneur can submit listings
- [ ] Admin can access admin portal
- [ ] Admin can approve/reject listings
- [ ] Investor can see approved listings
- [ ] API endpoints respond correctly

### 3. Setup Monitoring

**Recommended tools:**
- **Application**: Sentry (error tracking)
- **Infrastructure**: Datadog, New Relic
- **Uptime**: UptimeRobot, Pingdom
- **Logs**: Papertrail, Loggly

### 4. Backup Strategy

**Database backups:**
```bash
# Automated daily backups
docker exec investrwanda_db_prod pg_dump -U postgres investrwanda > backup_$(date +%Y%m%d).sql
```

**Setup cron job:**
```bash
0 2 * * * /path/to/backup-script.sh
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed
**Problem**: Backend can't connect to database
**Solution**: 
- Check DATABASE_URL or DB_* environment variables
- Ensure database is running and accessible
- Verify firewall rules allow connection

#### 2. CORS Errors
**Problem**: Frontend can't call backend API
**Solution**:
- Update VITE_API_URL in frontend
- Check CORS settings in server.js
- Ensure backend is accessible from frontend

#### 3. Build Failures
**Problem**: Docker build fails or deployment errors
**Solution**:
- Check Node.js version compatibility
- Clear Docker cache: `docker system prune -a`
- Check build logs for specific errors

#### 4. Admin Portal Not Accessible
**Problem**: Can't access /admin/portal
**Solution**:
- Ensure user role is set to 'admin' in database
- Check authentication token is valid
- Verify route is configured in frontend

#### 5. Images Not Loading
**Problem**: Listing images don't display
**Solution**:
- Check file upload path configuration
- Verify storage volume is mounted
- Ensure proper permissions on upload directory

### Health Checks

```bash
# Check backend health
curl http://your-domain.com:4000/api/listings

# Check frontend health
curl http://your-domain.com/health

# Check database connection
docker exec investrwanda_db_prod pg_isready -U postgres
```

### Logs

```bash
# View all logs
docker-compose logs -f

# Backend logs only
docker logs investrwanda_backend_prod -f

# Database logs
docker logs investrwanda_db_prod -f
```

---

## Security Checklist

- [ ] Change default passwords
- [ ] Use strong JWT secret
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Enable database encryption
- [ ] Setup automated backups
- [ ] Implement rate limiting
- [ ] Enable security headers
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities

---

## Performance Optimization

### Frontend
- Enable Gzip compression
- Setup CDN (CloudFlare)
- Optimize images
- Lazy load components
- Enable browser caching

### Backend
- Enable connection pooling
- Add Redis caching
- Implement pagination
- Index database queries
- Enable API rate limiting

### Database
- Regular VACUUM operations
- Optimize query performance
- Setup read replicas
- Enable query caching

---

## Scaling Considerations

### Horizontal Scaling
- Load balancer setup
- Multiple backend instances
- Database read replicas
- Distributed file storage

### Vertical Scaling
- Increase server resources
- Optimize database performance
- Enable caching layers

---

## Cost Estimates

| Platform | Monthly Cost | Best For |
|----------|-------------|----------|
| Railway | $5-20 | Startups, MVPs |
| Render | $7-25 | Small teams |
| DigitalOcean | $12-50 | Growing apps |
| AWS | $30-200+ | Enterprise |
| Heroku | $25-50 | Quick deploys |

---

## Support & Resources

### Documentation
- [Docker Docs](https://docs.docker.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [React Docs](https://react.dev/)
- [Express Docs](https://expressjs.com/)

### Getting Help
- GitHub Issues: https://github.com/ElvisSK123/InvestRwandaConnect-app/issues
- Email: support@investrwanda.com

---

**Last Updated**: January 24, 2026  
**Version**: 1.0  
**Status**: ✅ Production Ready

Happy Deploying! 🚀
