const Expense = require("../models/expenseModel");
const { Op } = require('sequelize');

const getDataForToday = async (date, userId) => {
  try {
    const expenses = await Expense.findAll({
      where: { date: date, userId: userId },
      raw: true,
    });
    return expenses || [];
  } catch (error) {
    console.error("Error fetching today's data:", error);
    return [];
  }
};

const getDataForMonth = async (month, userId) => {
  try {
    let monthStr;
    
    // Handle both "YYYY-MM" format and "MM" format
    if (month && month.includes('-')) {
      // Format is "YYYY-MM", extract the month part
      const parts = month.split('-');
      monthStr = parts[1] ? parts[1].padStart(2, '0') : month.toString().padStart(2, '0');
    } else {
      // Format is just "MM", ensure 2 digits
      monthStr = month ? month.toString().padStart(2, '0') : '01';
    }
    
    const expenses = await Expense.findAll({
      where: {
        date: {
          [Op.like]: `%-${monthStr}-%`
        },
        userId: userId,
      },
      raw: true,
    });
    return expenses || [];
  } catch (error) {
    console.error("Error fetching month's data:", error);
    return [];
  }
};

module.exports = {
  getDataForToday,
  getDataForMonth,
};