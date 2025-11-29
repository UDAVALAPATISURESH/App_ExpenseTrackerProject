// require('dotenv').config();

// module.exports = {
//   development: {
//     mongoURI: process.env.MONGO_DEV_URI, // e.g. mongodb://username:password@localhost:27017/expense_tracker_dev
//     options: {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     },
//   },
//   test: {
//     mongoURI: process.env.MONGO_TEST_URI,
//     options: {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     },
//   },
//   production: {
//     mongoURI: process.env.MONGO_PROD_URI,
//     options: {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     },
//   },
// };

require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,   // DB Name
  process.env.MYSQL_USER,       // DB User
  process.env.MYSQL_PASSWORD,   // DB Password
  {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql'
  }
);

module.exports = sequelize;
