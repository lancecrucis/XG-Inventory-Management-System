import mongoose from 'mongoose'

const inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
  },
}, { timestamps: true })

export default mongoose.model('Inventory', inventorySchema)