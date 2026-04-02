import Supplier from '../models/Supplier.js'

// Get all suppliers
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find()
    res.status(200).json(suppliers)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Add a supplier
export const addSupplier = async (req, res) => {
  try {
    const { name, contactPerson, email, phone, address } = req.body
    const supplier = await Supplier.create({
      name,
      contactPerson,
      email,
      phone,
      address,
    })
    res.status(201).json(supplier)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Edit a supplier
export const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    res.status(200).json(supplier)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete a supplier
export const deleteSupplier = async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'Supplier deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}