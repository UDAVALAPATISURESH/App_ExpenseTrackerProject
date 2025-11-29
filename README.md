
# 💸 Expense Tracker Web Application  

A full-stack web app to track daily expenses, categorize spending, and analyze reports.  
It includes authentication, premium features with payment integration, and AWS cloud deployment.

## Features

- 🔐 **Authentication** – Signup, Login, and Password Reset (JWT secured)  
- 💰 **Expense Management** – Add, Edit, Delete expenses with category & date  
- 📊 **Reports** – Daily, Monthly analysis  
- 📑 **Pagination** – Dynamic pagination with customizable page size  
- 🌟 **Premium Features** – Leaderboard & advanced reports (via Cashfree payment)  
- 📱 **Responsive UI** – Works seamlessly on desktop & mobile  


## Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

### Setup Steps

1. **Clone the repository:**
```bash
git clone https://github.com/ExpenseTrackerProject.git
cd ExpenseTrackerProject
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up the database:**
```sql
CREATE DATABASE expense_tracker;
```

4. **Configure environment variables:**
   - Copy `ENV_TEMPLATE.txt` to `.env`
   - Update the MySQL credentials and other variables

5. **Start the application:**
```bash
npm start
# Or for development with auto-reload:
npm run dev
```

The server will start on `http://localhost:3000` (or your configured PORT).

For detailed setup instructions, see [SETUP.md](SETUP.md)
    
## Tech Stack


- **Frontend:** Bootstrap, Vanilla JavaScript, Axios  
- **Backend:** Node.js, Express.js, Sequelize (ORM), MySQL2  
- **Database:** MySQL  
- **Authentication:** JWT (JSON Web Token)  
- **Deployment:** AWS EC2 (server), PM2, Nginx (optional)  
- **Cloud Services:**  
  - **AWS S3** – Static asset storage (screenshots, frontend files)  
  - **AWS IAM** – Role-based secure access  
  - **AWS Billing & Management Console** – Cost monitoring & resource management  
- **Payment Integration:** Cashfree for premium subscriptions  

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file:

**Required Variables:**
- `MYSQL_HOST` - MySQL database host (default: localhost)
- `MYSQL_USER` - MySQL database user (default: root)
- `MYSQL_PASSWORD` - MySQL database password
- `MYSQL_DATABASE` - MySQL database name (default: expense_tracker)
- `PORT` - Server port (default: 3000)
- `SESSION_SECRET` - Secret key for sessions
- `JWT_SECRET` - Secret key for JWT tokens

**Optional Variables:**
- `NODE_ENV` - Environment mode (development/production)
- `APP_URL` - Application URL
- `RESET_PASSWORD_API_KEY` - API key for password reset emails
- `SENDER_EMAIL` - Email address for sending emails
- `AWS_ACCESS_KEY_ID` - AWS access key (if using AWS services)
- `AWS_SECRET_ACCESS_KEY` - AWS secret key (if using AWS services)
- `BUCKET_NAME` - AWS S3 bucket name (if using AWS S3)

**Quick Setup:**
1. Copy `ENV_TEMPLATE.txt` to `.env`
2. Fill in your MySQL database credentials
3. Generate secure random strings for `SESSION_SECRET` and `JWT_SECRET`
## Screenshots

![App Screenshot](https://github.com/alurtaher/photo/blob/master/Screenshot%202025-10-05%20202946.png?raw=true)

![App Screenshot](https://github.com/alurtaher/photo/blob/master/Screenshot%202025-10-05%20203300.png?raw=true)

![App Screenshot](https://github.com/alurtaher/photo/blob/master/Screenshot%202025-10-05%20203509.png?raw=true)

![App Screenshot](https://github.com/alurtaher/photo/blob/master/Screenshot%202025-10-05%20203800.png?raw=true)
## Authors

[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/alur-taher-basha-857937233/)
## Other Common Github Profile Sections
👩‍💻 I'm currently working on a Backend project

🧠 I'm exploring backend technologies in depth# App_ExpenseTrackerProject
