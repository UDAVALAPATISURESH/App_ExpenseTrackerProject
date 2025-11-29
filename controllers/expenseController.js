const path = require("path");
const Expense = require("../models/expenseModel");
const User = require("../models/userModel");
const sequelize = require("../config/config");

exports.getHomePage = (req, res, next) => {
  res.sendFile(path.join(__dirname, "../", "public", "views", "homePage.html"));
};

exports.addExpense = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { date, category, description, amount } = req.body;
    const userId = req.user.id;

    const createdExpense = await Expense.create({
      date,
      category,
      description,
      amount: parseFloat(amount),
      userId,
    }, { transaction });

    // Update user's total expenses
    const user = await User.findByPk(userId, { transaction });
    if (user) {
      const currentTotal = parseFloat(user.totalExpenses) || 0;
      await user.update({
        totalExpenses: currentTotal + parseFloat(amount)
      }, { transaction });
    }

    await transaction.commit();
    res.status(200).redirect("/homePage");
  } catch (err) {
    await transaction.rollback();
    console.error("Error adding expense:", err);
    res.status(500).json({ message: "Failed to add expense" });
  }
};

exports.getAllExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const pageNo = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    if (pageNo && limit) {
      const offset = (pageNo - 1) * limit;

      const { count, rows: expenses } = await Expense.findAndCountAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit: limit,
        offset: offset,
        raw: true,
      });

      const totalPages = Math.ceil(count / limit);

      return res.json({ expenses, totalPages });
    }

    const expenses = await Expense.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      raw: true,
    });

    return res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return res.status(500).json({ message: "Error in fetching expenses" });
  }
};

exports.deleteExpense = async (req, res, next) => {
  const expenseId = req.params.id;
  const userId = req.user.id;

  const transaction = await sequelize.transaction();

  try {
    const expense = await Expense.findOne({
      where: { id: expenseId, userId },
      transaction
    });

    if (!expense) {
      await transaction.rollback();
      return res.status(404).json({ message: "Expense not found or unauthorized" });
    }

    const amountToDeduct = parseFloat(expense.amount);

    await Expense.destroy({
      where: { id: expenseId, userId },
      transaction
    });

    // Update user's total expenses
    const user = await User.findByPk(userId, { transaction });
    if (user) {
      const currentTotal = parseFloat(user.totalExpenses) || 0;
      await user.update({
        totalExpenses: Math.max(0, currentTotal - amountToDeduct)
      }, { transaction });
    }

    await transaction.commit();
    res.status(200).json({ message: "Deleted Successfully" });
  } catch (err) {
    await transaction.rollback();
    console.error("Error deleting expense:", err);
    res.status(500).json({ message: "Failed to delete expense" });
  }
};

exports.editExpense = async (req, res) => {
  const { category, description, amount } = req.body;
  const expenseId = req.params.id;
  const userId = req.user.id;

  const transaction = await sequelize.transaction();

  try {
    const oldExpense = await Expense.findOne({
      where: { id: expenseId, userId },
      transaction
    });

    if (!oldExpense) {
      await transaction.rollback();
      return res.status(404).json({ message: "Expense not found or unauthorized" });
    }

    const oldAmount = parseFloat(oldExpense.amount);
    const newAmount = parseFloat(amount);
    const difference = newAmount - oldAmount;

    await Expense.update(
      { category, description, amount: newAmount },
      { where: { id: expenseId, userId }, transaction }
    );

    if (difference !== 0) {
      const user = await User.findByPk(userId, { transaction });
      if (user) {
        const currentTotal = parseFloat(user.totalExpenses) || 0;
        await user.update({
          totalExpenses: Math.max(0, currentTotal + difference)
        }, { transaction });
      }
    }

    await transaction.commit();
    res.status(200).json({ message: "Edited Successfully" });
  } catch (err) {
    await transaction.rollback();
    console.error("Error updating expense:", err);
    res.status(500).json({ message: "Failed to update expense" });
  }
};