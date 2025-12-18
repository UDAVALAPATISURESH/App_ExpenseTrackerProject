# Available URLs for Expense Tracker Application

Base URL: `http://13.201.42.99:3000`

## Public Pages (No Authentication Required)

### Login/Signup Page
- **GET** `http://13.201.42.99:3000/` - Login/Signup page (main entry point)
- **GET** `http://13.201.42.99:3000/user/` - Alternative login page URL

### Forgot Password Page
- **GET** `http://13.201.42.99:3000/password/forgotPasswordPage` - Forgot password page

### Reset Password Page
- **GET** `http://13.201.42.99:3000/password/resetPasswordPage/:requestId` - Reset password page (requires requestId token)

## API Endpoints (Public)

### Authentication APIs
- **POST** `http://13.201.42.99:3000/user/login` - User login API
- **POST** `http://13.201.42.99:3000/user/signUp` - User signup API
- **POST** `http://13.201.42.99:3000/password/sendMail` - Send password reset email
- **POST** `http://13.201.42.99:3000/password/resetPassword` - Reset password

## Protected Pages (Authentication Required)

### Home Page
- **GET** `http://13.201.42.99:3000/homePage` - Expense tracker home page

### Reports Page (Premium Feature)
- **GET** `http://13.201.42.99:3000/reports/getReportsPage` - Reports page (requires authentication)

### Leaderboard Page (Premium Feature)
- **GET** `http://13.201.42.99:3000/premium/getLeaderboardPage` - Leaderboard page (requires authentication & premium)

## Protected API Endpoints (Authentication Required)

### Expense APIs
- **GET** `http://13.201.42.99:3000/expense/getAllExpenses` - Get all expenses
- **POST** `http://13.201.42.99:3000/expense/addExpense` - Add new expense
- **POST** `http://13.201.42.99:3000/expense/editExpense/:id` - Edit expense
- **DELETE** `http://13.201.42.99:3000/expense/deleteExpense/:id` - Delete expense

### Reports APIs (Premium Feature)
- **POST** `http://13.201.42.99:3000/reports/dailyReports` - Get daily reports
- **POST** `http://13.201.42.99:3000/reports/monthlyReports` - Get monthly reports
- **GET** `http://13.201.42.99:3000/reports/dailyReports/download?date=YYYY-MM-DD` - Download daily report
- **GET** `http://13.201.42.99:3000/reports/monthlyReports/download?month=YYYY-MM` - Download monthly report
- **GET** `http://13.201.42.99:3000/reports/downloadedfiles` - Get list of downloaded files

### Premium APIs
- **GET** `http://13.201.42.99:3000/premium/getLeaderboard` - Get leaderboard data
- **GET** `http://13.201.42.99:3000/user/isPremiumUser` - Check if user is premium

### Payment APIs
- Check `router/purchaseMembershipRouter.js` for payment-related endpoints

## Important Notes

1. **Login Page**: The login page is at the root URL `/`, NOT `/login`
   - Correct: `http://13.201.42.99:3000/`
   - Wrong: `http://13.201.42.99:3000/login` (this doesn't exist as a GET route)

2. **Authentication**: Most endpoints require a JWT token in the Authorization header:
   ```
   Authorization: Bearer <your-token>
   ```

3. **Premium Features**: Some features require premium membership:
   - Reports page and APIs
   - Leaderboard page and APIs

4. **Static Files**: Static files (CSS, JS, images) are served from:
   - `http://13.201.42.99:3000/css/` - CSS files
   - `http://13.201.42.99:3000/js/` - JavaScript files
   - `http://13.201.42.99:3000/views/` - HTML views and images

## Quick Access URLs

- **Login Page**: `http://13.201.42.99:3000/`
- **Home Page** (after login): `http://13.201.42.99:3000/homePage`
- **Reports Page** (premium): `http://13.201.42.99:3000/reports/getReportsPage`
- **Leaderboard Page** (premium): `http://13.201.42.99:3000/premium/getLeaderboardPage`

