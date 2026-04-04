import dotenv from 'dotenv'
dotenv.config({ path: '.env', override: false })

import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import authRoutes from './src/routes/authRoutes.js'
import productRoutes from './src/routes/productRoutes.js'
import inventoryRoutes from './src/routes/inventoryRoutes.js'
import supplierRoutes from './src/routes/supplierRoutes.js'
import saleRoutes from './src/routes/saleRoutes.js'
import expenseRoutes from './src/routes/expenseRoutes.js'
import reportRoutes from './src/routes/reportRoutes.js'



const app = express()

app.use(cors({
  origin: '*',
  credentials: false
}))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/suppliers', supplierRoutes)
app.use('/api/sales', saleRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/reports', reportRoutes)

const PORT = process.env.PORT || 5000

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected!')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
  .catch((err) => console.log(err))