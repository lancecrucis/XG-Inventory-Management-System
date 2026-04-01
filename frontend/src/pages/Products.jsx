import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pencil, Trash2, Plus, X, PackageOpen } from 'lucide-react'
import logo from '../assets/xgLogo.png'
import companyLogo from '../assets/companyLogo.png'
 
function Products() {
  const [products, setProducts] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({ name: '', price: '', quantity: '' })
  const [error, setError] = useState('')
 
  // Fetch all products
  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products')
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.log(error)
    }
  }
 
  useEffect(() => {
    fetchProducts()
  }, [])
 
  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/'
  }
 
  const handleOpenAdd = () => {
    setForm({ name: '', price: '', quantity: '' })
    setIsEditing(false)
    setSelectedProduct(null)
    setError('')
    setIsModalOpen(true)
  }
 
  const handleOpenEdit = (product) => {
    setForm({ name: product.name, price: product.price, quantity: product.quantity })
    setIsEditing(true)
    setSelectedProduct(product)
    setError('')
    setIsModalOpen(true)
  }
 
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setError('')
  }
 
  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.quantity) {
      setError('Please fill in all fields')
      return
    }
    setIsLoading(true)
    try {
      const url = isEditing
        ? `http://localhost:5000/api/products/${selectedProduct._id}`
        : 'http://localhost:5000/api/products'
      const method = isEditing ? 'PUT' : 'POST'
 
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          price: Number(form.price),
          quantity: Number(form.quantity),
        }),
      })
 
      await fetchProducts()
      setIsModalOpen(false)
    } catch (error) {
      setError('Something went wrong. Please try again.')
    }
    setIsLoading(false)
  }
 
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' })
      await fetchProducts()
    } catch (error) {
      console.log(error)
    }
  }
 
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border/60 px-8 py-4 flex items-center justify-between ">
        <div className="flex items-center gap-3">
          <img src={companyLogo} alt="XG Logo" className="size-8 object-contain" />
          <div>
            <h1 className="text-sm font-semibold leading-none">XG Inventory</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Your Xtra ordinary Global Partner</p>
          </div>
        </div>
        
      </nav>
 
      {/* Main Content */}
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Products</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {products.length} {products.length === 1 ? 'product' : 'products'} total
            </p>
          </div>
          <Button onClick={handleOpenAdd} className="gap-2">
            <Plus className="size-4" />
            Add Product
          </Button>
        </div>
 
        {/* Table */}
        <div className="border border-border/60 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Product Name</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Price</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Quantity</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-muted-foreground">
                    <PackageOpen className="size-10 mx-auto mb-3 opacity-30" />
                    <p>No products yet — add your first one!</p>
                  </td>
                </tr>
              ) : (
                products.map((product, index) => (
                  <tr
                    key={product._id}
                    className={`border-b border-border/40 hover:bg-muted/30 transition-colors ${index % 2 === 0 ? '' : 'bg-muted/10'}`}
                  >
                    <td className="px-6 py-4 font-medium">{product.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">₱{Number(product.price).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.quantity === 0
                          ? 'bg-red-100 text-red-700'
                          : product.quantity < 10
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {product.quantity} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleOpenEdit(product)}
                        >
                          <Pencil className="size-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-red-500 hover:text-red-600 hover:border-red-300"
                          onClick={() => handleDelete(product._id)}
                        >
                          <Trash2 className="size-3" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
 
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 border border-zinc-900 rounded-xl p-6 w-full max-w-md shadow-2xl text-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                {isEditing ? 'Edit Product' : 'Add Product'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
 
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Office Chair"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
 
              <div className="space-y-2">
                <Label htmlFor="price">Price (₱)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="e.g. 1500"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
 
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="e.g. 50"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />
              </div>
 
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>
 
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1 bg-zinc-900 hover:bg-zinc-800"
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-white text-black hover:bg-[#fae792] border-none font-bold"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Product'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
 
export default Products