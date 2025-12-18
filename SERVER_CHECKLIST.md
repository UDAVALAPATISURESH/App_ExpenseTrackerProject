# AWS EC2 Server Configuration Checklist

## Your Server Details
- **Public IP**: `13.201.42.99` ✅
- **Public DNS**: `ec2-13-201-42-99.ap-south-1.compute.amazonaws.com`
- **Instance State**: Running ✅
- **Instance Type**: t3.micro
- **Region**: ap-south-1 (Mumbai)
- **Private IP**: 172.31.40.147

## ✅ Server Status Check

### 1. Security Group Configuration (CRITICAL)
Your EC2 security group must allow inbound traffic on port 3000:

**Required Inbound Rules:**
- **Type**: Custom TCP
- **Port**: 3000
- **Source**: 0.0.0.0/0 (or your specific IP for security)
- **Description**: Allow Node.js application

**To Check/Update:**
1. Go to EC2 Console → Your Instance → Security tab
2. Click on Security Group
3. Click "Edit inbound rules"
4. Add rule if missing:
   - Type: Custom TCP
   - Port: 3000
   - Source: 0.0.0.0/0
   - Save rules

### 2. Application URLs (After Security Group is Configured)

**Main Application URLs:**
- Login Page: `http://13.201.42.99:3000/`
- Home Page: `http://13.201.42.99:3000/homePage` (after login)
- API Base: `http://13.201.42.99:3000`

**Alternative DNS URL:**
- Login Page: `http://ec2-13-201-42-99.ap-south-1.compute.amazonaws.com:3000/`

### 3. Server-Side Configuration Checklist

#### On Your EC2 Instance, Verify:

**A. Node.js Application is Running**
```bash
# SSH into your EC2 instance, then check:
ps aux | grep node
# or
pm2 list  # if using PM2
```

**B. Port 3000 is Listening**
```bash
netstat -tuln | grep 3000
# or
sudo lsof -i :3000
```

**C. Application is Accessible**
```bash
curl http://localhost:3000
# Should return HTML content
```

**D. Environment Variables (.env file)**
Verify your `.env` file on the server has:
```env
PORT=3000
NODE_ENV=production
MYSQL_HOST=localhost  # or your RDS endpoint
MYSQL_USER=root
MYSQL_PASSWORD=your_actual_password
MYSQL_DATABASE=expense_tracker
SECRET_KEY=your-secret-key-here
APP_URL=http://13.201.42.99:3000
```

**E. Database Connection**
```bash
# Test MySQL connection
mysql -h localhost -u root -p
# Enter password and verify database exists
```

### 4. Common Issues & Solutions

#### Issue 1: Cannot Access `http://13.201.42.99:3000`
**Solution:**
- ✅ Check Security Group allows port 3000
- ✅ Verify application is running: `ps aux | grep node`
- ✅ Check firewall: `sudo ufw status` (if enabled, allow port 3000)
- ✅ Verify app listens on 0.0.0.0, not just localhost

#### Issue 2: Application Not Starting
**Solution:**
- Check logs: `pm2 logs` or `node app.js` (run directly to see errors)
- Verify all dependencies: `npm install`
- Check database connection in `.env`
- Verify SECRET_KEY is set

#### Issue 3: Database Connection Error
**Solution:**
- Verify MySQL is running: `sudo systemctl status mysql`
- Check database credentials in `.env`
- Ensure database exists: `mysql -u root -p -e "SHOW DATABASES;"`
- Check MySQL bind-address (should allow connections)

### 5. Recommended Server Setup Commands

**Start Application with PM2 (Recommended for Production):**
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start app.js --name expense-tracker

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

**Or Start Manually:**
```bash
node app.js
# or
npm start
```

### 6. Firewall Configuration (if using UFW)
```bash
# Allow port 3000
sudo ufw allow 3000/tcp

# Check status
sudo ufw status
```

### 7. Testing Your Server

**From Your Local Machine:**
```bash
# Test if port is open
telnet 13.201.42.99 3000

# Or use curl
curl http://13.201.42.99:3000

# Or open in browser
# http://13.201.42.99:3000/
```

**From EC2 Instance (SSH):**
```bash
# Test locally
curl http://localhost:3000

# Test from outside (if curl is available)
curl http://13.201.42.99:3000
```

### 8. Application Binding Configuration

**Important:** Your Express app should listen on `0.0.0.0`, not `127.0.0.1`:

Current code in `app.js`:
```javascript
app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}.....`);
});
```

This should work, but if you have issues, explicitly bind to 0.0.0.0:
```javascript
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on ${PORT}.....`);
});
```

## Quick Verification Steps

1. ✅ **EC2 Instance**: Running (Confirmed from your screenshot)
2. ⚠️ **Security Group**: Check if port 3000 is open
3. ⚠️ **Application**: Verify it's running on the server
4. ⚠️ **Database**: Verify MySQL connection
5. ⚠️ **Environment**: Verify `.env` file is configured

## Next Steps

1. **Check Security Group** - Most common issue!
2. **SSH into server** and verify application is running
3. **Test URL**: `http://13.201.42.99:3000/`
4. **Check server logs** for any errors

## Support URLs

- **Login Page**: `http://13.201.42.99:3000/`
- **API Endpoint**: `http://13.201.42.99:3000/user/login` (POST)
- **Health Check**: `http://13.201.42.99:3000/` (should return login page HTML)

