import Sale from '../models/Sale.js'
import Inventory from '../models/Inventory.js'
import StockHistory from '../models/StockHistory.js'

// Get all sales
export const getSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('items.product')
      .sort({ createdAt: -1 })
    res.status(200).json(sales)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Create a sale
export const createSale = async (req, res) => {
  try {
    const { items, note } = req.body

    // Check stock and calculate total
    for (const item of items) {
      const inventory = await Inventory.findOne({ product: item.productId })
      if (!inventory) {
        return res.status(400).json({ message: `Product not found in inventory` })
      }
      if (inventory.quantity < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for one of the products` })
      }
    }

    // Deduct stock and build sale items
    const saleItems = []
    for (const item of items) {
      const inventory = await Inventory.findOne({ product: item.productId })
      inventory.quantity -= item.quantity
      await inventory.save()

      await StockHistory.create({
        product: item.productId,
        type: 'remove',
        quantity: item.quantity,
        note: `Sale`,
      })

      saleItems.push({
        product: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
      })
    }

    const totalAmount = saleItems.reduce((sum, item) => sum + item.totalPrice, 0)

    const sale = new Sale({
      items: saleItems,
      totalAmount,
      note: note || '',
    })
    await sale.save()

    res.status(201).json(sale)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete a sale
export const deleteSale = async (req, res) => {
  try {
    await Sale.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'Sale deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}