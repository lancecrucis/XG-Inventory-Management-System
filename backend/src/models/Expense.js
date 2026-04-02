import mongoose from 'mongoose'

const expenseSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['Electricity', 'Packaging', 'Shipping', 'Marketing', 'Maintenance', 'Other'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  note: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    required: true,
  },
}, { timestamps: true })

export default mongoose.model('Expense', expenseSchema)