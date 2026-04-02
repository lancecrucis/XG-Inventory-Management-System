import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  supplier: {
    type: String,
    default: '',
  },
  unitPrice: {
    type: Number,
    required: true,
  },
}, { timestamps: true })

productSchema.pre('save', async function () {
  if (!this.sku) {
    const count = await mongoose.model('Product').countDocuments()
    this.sku = `PRD-${String(count + 1).padStart(3, '0')}`
  }
})

export default mongoose.model('Product', productSchema)