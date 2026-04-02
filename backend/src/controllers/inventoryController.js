import Inventory from '../models/Inventory.js'
import StockHistory from '../models/StockHistory.js'
import Product from '../models/Product.js'

// Get all inventory
export const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find().populate('product')
    res.status(200).json(inventory)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Add stock
export const addStock = async (req, res) => {
  try {
    const { productId, quantity, note } = req.body

    let inventory = await Inventory.findOne({ product: productId })

    if (!inventory) {
      inventory = await Inventory.create({
        product: productId,
        quantity: Number(quantity),
        lowStockThreshold: req.body.lowStockThreshold || 10,
      })
    } else {
      inventory.quantity += Number(quantity)
      await inventory.save()
    }

    await StockHistory.create({
      product: productId,
      type: 'add',
      quantity: Number(quantity),
      note: note || '',
    })

    res.status(200).json(inventory)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Remove stock
export const removeStock = async (req, res) => {
  try {
    const { productId, quantity, note } = req.body

    let inventory = await Inventory.findOne({ product: productId })

    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' })
    }

    if (inventory.quantity < Number(quantity)) {
      return res.status(400).json({ message: 'Not enough stock' })
    }

    inventory.quantity -= Number(quantity)
    await inventory.save()

    await StockHistory.create({
      product: productId,
      type: 'remove',
      quantity: Number(quantity),
      note: note || '',
    })

    res.status(200).json(inventory)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update low stock threshold
export const updateThreshold = async (req, res) => {
  try {
    const { productId, lowStockThreshold } = req.body
    const inventory = await Inventory.findOneAndUpdate(
      { product: productId },
      { lowStockThreshold: Number(lowStockThreshold) },
      { new: true }
    )
    res.status(200).json(inventory)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get stock history
export const getStockHistory = async (req, res) => {
  try {
    const history = await StockHistory.find()
      .populate('product')
      .sort({ createdAt: -1 })
    res.status(200).json(history)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}