import mongoose from 'mongoose'

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
})

const saleSchema = new mongoose.Schema({
  saleNumber: {
    type: String,
    unique: true,
  },
  items: [saleItemSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  note: {
    type: String,
    default: '',
  },
}, { timestamps: true })

saleSchema.pre('save', async function () {
  if (!this.saleNumber) {
    const count = await mongoose.model('Sale').countDocuments()
    this.saleNumber = `SAL-${String(count + 1).padStart(3, '0')}`
  }
})

export default mongoose.model('Sale', saleSchema)