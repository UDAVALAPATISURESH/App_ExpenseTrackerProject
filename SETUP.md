# Expense Tracker - Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
1. Create a MySQL database:
```sql
CREATE DATABASE expense_tracker;
```

2. Run migrations (if available):
```bash
npm run migrate
```

### 3. Environment Configuration
Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MySQL Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password_here
MYSQL_DATABASE=expense_tracker

# Session Secret (Change this in production!)
SESSION_SECRET=your-secret-key-change-this-in-production-min-32-chars

# JWT Secret (if using JWT authentication)
JWT_SECRET=your-jwt-secret-key-change-this-in-production-min-32-chars

# Application URL
APP_URL=http://localhost:3000
```

**Important:** 
- Replace `your_password_here` with your actual MySQL password
- Generate strong random strings for `SESSION_SECRET` and `JWT_SECRET` in production
- Never commit the `.env` file to version control

### 4. Start the Application
```bash
# Development mode (if nodemon is configured)
npm start

# Or using node directly
node app.js
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check database credentials in `.env`
   - Ensure the database exists

2. **Port Already in Use**
   - Change the `PORT` in `.env` to a different port
   - Or stop the process using port 3000

3. **Module Not Found**
   - Run `npm install` to install all dependencies
   - Check `package.json` for required packages

## Project Structure
```
├── app.js                 # Main application entry point
├── config/                # Configuration files
├── controllers/           # Route controllers
├── middleware/            # Custom middleware
├── models/                # Database models
├── public/                # Static files (CSS, JS, views)
├── router/                # Route definitions
├── services/              # Business logic services
└── utils/                 # Utility functions
```

## Features
- User authentication (Sign up/Login)
- Expense tracking and management
- Category-based expense organization
- Premium membership features
- Leaderboard
- Reports and analytics
- Password reset functionality


