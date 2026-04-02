import Expense from '../models/Expense.js'

// Get all expenses
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 })
    res.status(200).json(expenses)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Add an expense
export const addExpense = async (req, res) => {
  try {
    const { category, amount, note, date } = req.body
    const expense = await Expense.create({
      category,
      amount: Number(amount),
      note,
      date: new Date(date),
    })
    res.status(201).json(expense)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete an expense
export const deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'Expense deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}