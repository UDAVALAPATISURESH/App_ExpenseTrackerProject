// const mongoose = require('mongoose');
// require('dotenv').config();

// const mongoURI = process.env.MONGO_DEV_URI || 'mongodb://localhost:27017/expense_tracker';

// const options = {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// };

// mongoose.connect(mongoURI, options);

// const db = mongoose.connection;

// db.on('error', (error) => console.error('MongoDB connection error:', error));
// db.once('open', () => console.log('MongoDB connected successfully'));

// module.exports = db;


require('dotenv').config();
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

db.connect((err) => {
  if (err) {
    console.log("❌ MySQL Connection Error:", err);
  } else {
    console.log("✅ MySQL Connected Successfully");
  }
});

module.exports = db;
