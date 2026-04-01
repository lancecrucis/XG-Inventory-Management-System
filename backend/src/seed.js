import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import User from './models/User.js'

dotenv.config({ path: './. env' })

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected!')

    const existingUser = await User.findOne({ email: 'admin@xg.com' })
    if (existingUser) {
      console.log('Admin already exists!')
      process.exit()
    }

    const hashedPassword = await bcrypt.hash('admin123', 10)
    await User.create({
      email: 'admin@xg.com',
      password: hashedPassword,
      role: 'admin'
    })

    console.log('Admin user created successfully!')
    process.exit()
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

seedAdmin()