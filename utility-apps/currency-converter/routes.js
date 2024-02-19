const express = require("express");
const router = express.Router();
const Expense = require("../models/expense");
const currencyConverter = require("../utils/currency");

router.post("/expenses", async (req, res) => {
  try {
    // Get user ID from session
    const userId = req.user.id;

    const { description, category, amount, currency, date } = req.body;
    const newExpense = new Expense({
      description,
      category,
      amount,
      currency,
      date,
      user: userId,
    });

    // Convert amount to user's preferred currency
    if (currency === req.user.preferredCurrency) {
      newExpense.convertedAmount = amount;
    } else {
      const convertedAmount = await currencyConverter.convertCurrency(
        currency,
        req.user.preferredCurrency,
        amount
      );
      newExpense.convertedAmount = convertedAmount;
    }

    await newExpense.save();
    res
      .status(201)
      .send({ message: "Expense successfully created", expense: newExpense });
  } catch (error) {
    res
      .status(500)
      .send({ error: "Failed to create expense", message: error.message });
  }
});

// Other routes to retrieve, update, and delete expense data

module.exports = router;
