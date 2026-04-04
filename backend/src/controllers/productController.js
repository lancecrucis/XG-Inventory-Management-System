import Product from '../models/Product.js'
import Inventory from '../models/Inventory.js'

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
    res.status(200).json(products)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// Add a product
export const addProduct = async (req, res) => {
  try {
    const { sku, name, supplier, unitCost, unitPrice } = req.body
    const product = new Product({
      sku,
      name,
      supplier,
      unitCost: Number(unitCost),
      unitPrice: Number(unitPrice),
    })
    await product.save()
    res.status(201).json(product)
  } catch (error) {
    console.log('ADD PRODUCT ERROR:', error.message)
    res.status(500).json({ message: error.message })
  }
}

// Edit a product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    res.status(200).json(product)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id)
    await Inventory.findOneAndDelete({ product: req.params.id })
    res.status(200).json({ message: 'Product deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
