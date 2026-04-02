import mongoose from 'mongoose'

const stockHistorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  type: {
    type: String,
    enum: ['add', 'remove'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  note: {
    type: String,
    default: '',
  },
}, { timestamps: true })

export default mongoose.model('StockHistory', stockHistorySchema)