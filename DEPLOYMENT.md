# 🐉 Dragon Catcher - Deployment Guide

## How to Make This a Live Website

Follow these steps to deploy your Dragon Catcher game online:

---

## **Option 1: Deploy on Heroku (Easiest)**

### Step 1: Create a Heroku Account
- Go to [heroku.com](https://www.heroku.com)
- Click "Sign Up" and create a free account

### Step 2: Install Heroku CLI
- Download from [heroku.com/downloads](https://www.heroku.com/downloads)
- Install on your computer

### Step 3: Login and Deploy
```bash
# Login to Heroku
heroku login

# Create a new Heroku app
heroku create your-app-name

# Set up MongoDB Atlas (free database)
# Go to https://www.mongodb.com/cloud/atlas
# Create a free cluster and get your connection string
# Set environment variable:
heroku config:set MONGODB_URI=your_mongodb_connection_string

# Deploy your code
git push heroku main

# Open your website
heroku open
```

Your site will be live at: `https://your-app-name.herokuapp.com`

---

## **Option 2: Deploy on Railway.app (Very Easy)**

### Step 1: Create Railway Account
- Go to [railway.app](https://railway.app)
- Sign up with GitHub

### Step 2: Connect Your Repository
- Click "New Project"
- Select "Deploy from GitHub"
- Choose your `dragon-catcher` repository
- Railway will auto-detect it's a Node.js app

### Step 3: Add MongoDB
- In Railway dashboard, click "Add"
- Select "MongoDB"
- Railway creates the database automatically

### Step 4: Deploy
- Your app auto-deploys on every GitHub push
- Get your live URL from Railway dashboard

Your site will be live at: `https://your-project-name.up.railway.app`

---

## **Option 3: Deploy on Vercel + AWS (Advanced)**

For a more powerful setup:
- Frontend: Deploy on [Vercel](https://vercel.com)
- Backend: Deploy on [AWS EC2](https://aws.amazon.com/ec2/) or [DigitalOcean](https://www.digitalocean.com)
- Database: MongoDB Atlas (free tier available)

---

## **Option 4: Deploy on Your Own Server (Full Control)**

### Requirements:
- A VPS (Virtual Private Server) like DigitalOcean, AWS, or Linode
- Domain name (like `dragoncatcher.com` from Namecheap or GoDaddy)
- Basic Linux knowledge

### Quick Setup:
```bash
# SSH into your server
ssh root@your_server_ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone your repository
git clone https://github.com/carterwoodsisthebest2-dev/dragon-catcher.git
cd dragon-catcher

# Install dependencies
npm install

# Create .env file with your settings
nano .env

# Run with PM2 (keeps app running)
npm install -g pm2
pm2 start server.js
pm2 startup
pm2 save

# Setup Nginx as reverse proxy
sudo apt install nginx
# Configure Nginx to forward to port 5000
```

---

## **Recommended Deployment Path for Beginners**

1. **Best Choice:** Railway.app
   - ✅ Free
   - ✅ Auto-deploys from GitHub
   - ✅ Built-in MongoDB
   - ✅ Easy to use

2. **Alternative:** Heroku
   - ✅ Very popular
   - ✅ Easy setup
   - ⚠️ Free tier has limitations

3. **For Production:** DigitalOcean + Railway
   - ✅ More control
   - ✅ Better performance
   - ✅ Scalable

---

## **Quick Start - Railway (Recommended)**

```bash
# 1. Push to GitHub
git add .
git commit -m "Dragon Catcher Game"
git push origin main

# 2. Go to railway.app and connect your GitHub repo
# 3. Railway auto-detects Node.js and deploys
# 4. Add MongoDB from Railway dashboard
# 5. Your app is LIVE! 🎉
```

---

## **Get Your Own Domain**

1. Buy a domain: [Namecheap](https://www.namecheap.com), [GoDaddy](https://godaddy.com), or [Google Domains](https://domains.google)
2. Point domain to your hosting service
3. Enable HTTPS (most platforms do this automatically)

Example: `dragoncatcher.com` → Points to your Railway app

---

## **Environment Variables You'll Need**

Create a `.env` file with:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dragon-catcher
JWT_SECRET=your_secret_key_here_make_it_long_and_random
PORT=5000
NODE_ENV=production
```

---

## **After Deployment**

1. **Test your game:** Open the live URL in a browser
2. **Register a test account** and play!
3. **Invite friends:** Share the URL with them
4. **Monitor:** Use your platform's dashboard to check logs and performance
5. **Scale:** As you get more players, upgrade your database plan

---

## **Troubleshooting**

**White screen or 502 error?**
- Check server logs in your hosting dashboard
- Verify MongoDB connection string
- Check if `PORT` environment variable is set

**Slow loading?**
- Upgrade your database plan
- Enable caching
- Optimize images for dragons

**Players can't connect?**
- Check if Socket.IO is enabled
- Verify CORS settings in `server.js`
- Check firewall rules

---

## **Next Steps**

1. Choose a platform above
2. Create an account
3. Deploy in 5 minutes
4. Share with friends!

**Your Dragon Catcher game will be live at a real URL everyone can access! 🎉**

---

Questions? Check your platform's documentation:
- Railway: [docs.railway.app](https://docs.railway.app)
- Heroku: [devcenter.heroku.com](https://devcenter.heroku.com)
- DigitalOcean: [docs.digitalocean.com](https://docs.digitalocean.com)
