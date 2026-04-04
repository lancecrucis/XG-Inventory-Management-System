import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  supplier: {
    type: String,
    default: '',
  },
  unitCost: {
    type: Number,
    required: true,
    default: 0,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
}, { timestamps: true })

export default mongoose.model('Product', productSchema)