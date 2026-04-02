import express from 'express'
import {
  getInventory,
  addStock,
  removeStock,
  updateThreshold,
  getStockHistory,
} from '../controllers/inventoryController.js'

const router = express.Router()

router.get('/', getInventory)
router.post('/add', addStock)
router.post('/remove', removeStock)
router.put('/threshold', updateThreshold)
router.get('/history', getStockHistory)

export default router