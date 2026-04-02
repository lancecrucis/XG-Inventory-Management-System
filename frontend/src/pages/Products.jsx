import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pencil, Trash2, Plus, X, PackageOpen, Search, Download, AlertTriangle } from 'lucide-react'
import companyLogo from '../assets/companyLogo.png'

function Products() {
  const [products, setProducts] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [stockFilter, setStockFilter] = useState('all')
  const [form, setForm] = useState({
    name: '',
    supplier: '',
    unitPrice: '',
    quantity: '',
    lowStockThreshold: '',
  })
  const [error, setError] = useState('')

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

  const handleOpenAdd = () => {
    setForm({ name: '', supplier: '', unitPrice: '', quantity: '', lowStockThreshold: '10' })
    setIsEditing(false)
    setSelectedProduct(null)
    setError('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (product) => {
    setForm({
      name: product.name,
      supplier: product.supplier || '',
      unitPrice: product.unitPrice,
      quantity: product.quantity,
      lowStockThreshold: product.lowStockThreshold,
    })
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
    if (!form.name || !form.unitPrice || !form.quantity || !form.lowStockThreshold) {
      setError('Please fill in all required fields')
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
          supplier: form.supplier,
          unitPrice: Number(form.unitPrice),
          quantity: Number(form.quantity),
          lowStockThreshold: Number(form.lowStockThreshold),
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

  const handleExportCSV = () => {
    const headers = ['SKU', 'Name', 'Supplier', 'Unit Price', 'Quantity', 'Total Value', 'Low Stock Threshold', 'Status']
    const rows = filteredProducts.map(p => [
      p.sku,
      p.name,
      p.supplier || 'N/A',
      p.unitPrice,
      p.quantity,
      (p.unitPrice * p.quantity).toFixed(2),
      p.lowStockThreshold,
      p.quantity === 0 ? 'No Stock' : p.quantity <= p.lowStockThreshold ? 'Low Stock' : 'In Stock'
    ])
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'xg-products.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.supplier?.toLowerCase().includes(search.toLowerCase())

    const matchesStock =
      stockFilter === 'all' ? true :
      stockFilter === 'low' ? p.quantity > 0 && p.quantity <= p.lowStockThreshold :
      stockFilter === 'none' ? p.quantity === 0 : true

    return matchesSearch && matchesStock
  })

  const getStockStatus = (product) => {
    if (product.quantity === 0) return { label: 'No Stock', color: 'text-red-700' }
    if (product.quantity <= product.lowStockThreshold) return { label: 'Low Stock', color: 'text-yellow-700' }
    return { label: 'In Stock', color: 'text-green-700' }
  }

  const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity <= p.lowStockThreshold).length
  const noStockCount = products.filter(p => p.quantity === 0).length

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border/60 px-0 py-4 flex items-center justify-between  ">
        <div className="flex items-center gap-3">
          <img src={companyLogo} alt="XG Logo" className="size-9 object-contain" />
          <div>
            <h1 className="text-sm font-semibold leading-none">XG Inventory</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Your <b>X</b>tra ordinary <b>G</b>lobal Partner</p>
          </div>
        </div>
        
      </nav>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">Products</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {products.length} {products.length === 1 ? 'product' : 'products'} total
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
              <Download className="size-4" />
              Export CSV
            </Button>
            <Button onClick={handleOpenAdd} className="gap-2">
              <Plus className="size-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Low stock alerts */}
        {(lowStockCount > 0 || noStockCount > 0) && (
          <div className="flex gap-3 mb-6">
            {lowStockCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm">
                <AlertTriangle className="size-4" />
                <span><strong>{lowStockCount}</strong> {lowStockCount === 1 ? 'product is' : 'products are'} running low on stock</span>
              </div>
            )}
            {noStockCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertTriangle className="size-4" />
                <span><strong>{noStockCount}</strong> {noStockCount === 1 ? 'product is' : 'products are'} out of stock</span>
              </div>
            )}
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, SKU, supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            {['all', 'low', 'none'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStockFilter(filter)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: stockFilter === filter ? '#1a1a1a' : 'transparent',
                  color: stockFilter === filter ? '#fff' : 'var(--muted-foreground)',
                  border: '1px solid',
                  borderColor: stockFilter === filter ? '#1a1a1a' : 'var(--border)',
                }}
              >
                {filter === 'all' ? 'All Stock' : filter === 'low' ? 'Low Stock' : 'No Stock'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="border border-border/60 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">SKU</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Product Name</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Supplier</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Unit Price</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Quantity</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Total Value</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Stock Level</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-muted-foreground">
                    <PackageOpen className="size-10 mx-auto mb-3 opacity-30" />
                    <p>{search || stockFilter !== 'all' ? 'No products match your search' : 'No products yet — add your first one!'}</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, index) => {
                  const status = getStockStatus(product)
                  const totalValue = product.unitPrice * product.quantity
                  return (
                    <tr
                      key={product._id}
                      className={`border-b border-border/40 hover:bg-muted/30 transition-colors ${index % 2 === 0 ? '' : 'bg-muted/10'}`}
                    >
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{product.sku}</td>
                      <td className="px-6 py-4 font-medium">{product.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{product.supplier || '—'}</td>
                      <td className="px-6 py-4">₱{Number(product.unitPrice).toLocaleString()}</td>
                      <td className="px-6 py-4">{product.quantity}</td>
                      <td className="px-6 py-4 font-medium">₱{totalValue.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
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
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border/60 rounded-xl p-6 w-full max-w-md shadow-xl">
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
                <Label htmlFor="name">Product Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  placeholder="e.g. Office Chair"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  placeholder="e.g. ABC Supplies"
                  value={form.supplier}
                  onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Unit Price (₱) <span className="text-red-500">*</span></Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    placeholder="e.g. 1500"
                    value={form.unitPrice}
                    onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity <span className="text-red-500">*</span></Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="e.g. 50"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">
                  Low Stock Warning <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  placeholder="e.g. 10"
                  value={form.lowStockThreshold}
                  onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Warns when quantity falls below this number
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={isLoading}>
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