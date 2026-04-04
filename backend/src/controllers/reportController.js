import Sale from '../models/Sale.js'
import Expense from '../models/Expense.js'
import Inventory from '../models/Inventory.js'

export const getReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    // Build date filter
    const dateFilter = {}
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      }
    }

    const expenseDateFilter = {}
    if (startDate && endDate) {
      expenseDateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      }
    }

    const sales = await Sale.find(dateFilter).populate('items.product')
    const expenses = await Expense.find(expenseDateFilter)
    const inventory = await Inventory.find().populate('product')

    // Total Revenue
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)

    // COGS
    const totalCOGS = sales.reduce((sum, sale) => {
      return sum + sale.items.reduce((itemSum, item) => {
        const cost = item.product?.unitCost || 0
        return itemSum + (cost * item.quantity)
      }, 0)
    }, 0)

    // Gross Profit
    const grossProfit = totalRevenue - totalCOGS

    // Total Expenses
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

    // Net Profit
    const netProfit = grossProfit - totalExpenses

    // Expenses by category
    const expensesByCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {})

    // Inventory value
    const inventoryValue = inventory.reduce((sum, inv) => {
      return sum + (inv.product?.unitPrice || 0) * inv.quantity
    }, 0)

    // Top selling products
    const productSales = {}
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const id = item.product?._id?.toString()
        if (id) {
          if (!productSales[id]) {
            productSales[id] = {
              name: item.product?.name,
              sku: item.product?.sku,
              quantity: 0,
              revenue: 0,
            }
          }
          productSales[id].quantity += item.quantity
          productSales[id].revenue += item.totalPrice
        }
      })
    })

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    res.status(200).json({
      totalRevenue,
      totalCOGS,
      grossProfit,
      totalExpenses,
      netProfit,
      expensesByCategory,
      inventoryValue,
      topProducts,
      totalSales: sales.length,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}