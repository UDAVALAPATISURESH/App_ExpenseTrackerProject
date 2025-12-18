const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();

// Prevent Mongoose errors from crashing the app (since we're using Sequelize/MySQL)
// Mongoose models (Expense, Order, etc.) are still defined but not actively used
// They will be converted to Sequelize in future updates
const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);
// Suppress Mongoose connection warnings
mongoose.connection.on('error', () => {
  // Silently ignore Mongoose connection errors since we're using MySQL
});

require("./utils/database"); // Connecting MySQL here
const sequelize = require("./config/config");
const User = require("./models/userModel");
const Expense = require("./models/expenseModel");
const Order = require("./models/ordersModel");
const FileDownloaded = require("./models/filedownloaded");
const ResetPassword = require("./models/resetPasswordModel");

// Sync Sequelize models (creates tables if they don't exist)
sequelize.sync().then(() => {
  console.log("✅ Sequelize models synced");
}).catch((err) => {
  console.log("❌ Sequelize sync error:", err);
});

// app.get('/',(req,res)=>{
//   res.send("hello from the server")
// })

const userRouter = require("./router/userRouter");
const expenseRouter = require("./router/expenseRouter");
const purchaseMembershipRouter = require("./router/purchaseMembershipRouter");
const leaderboardRouter = require("./router/leaderboardRouter");
const resetPasswordRouter = require("./router/resetPasswordRouter");
const reportsRouter = require("./router/reportsRouter");

// Serve static files first (before routes)
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors({ origin: '*' }));

// Routes
app.use("/", userRouter);
app.use("/user", userRouter);
app.use("/homePage", expenseRouter);
app.use("/expense", expenseRouter);
app.use("/purchase", purchaseMembershipRouter);
app.use("/premium", leaderboardRouter);
app.use("/password", resetPasswordRouter);
app.use("/reports", reportsRouter);

// Sequelize models are synced above

const PORT = process.env.PORT || 3000;
// Bind to 0.0.0.0 to accept connections from all network interfaces (required for AWS EC2)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on http://0.0.0.0:${PORT}.....`);
  console.log(`Access your application at: http://13.201.42.99:${PORT}/`);
});