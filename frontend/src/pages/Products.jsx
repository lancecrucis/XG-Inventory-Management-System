import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pencil, Trash2, Plus, X, PackageOpen, Search } from 'lucide-react'
import companyLogo from '../assets/companyLogo.png'

function Products() {
  const [products, setProducts] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    sku: '',
    name: '',
    supplier: '',
    unitCost: '',
    unitPrice: '',
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
    setForm({ sku: '', name: '', supplier: '', unitCost: '', unitPrice: '' })
    setIsEditing(false)
    setSelectedProduct(null)
    setError('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (product) => {
    setForm({
    sku: product.sku || '',
    name: product.name,
    supplier: product.supplier || '',
    unitCost: product.unitCost || '',
    unitPrice: product.unitPrice,
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
    if (!form.sku || !form.name || !form.unitPrice || !form.unitCost) { 
      setError('Please fill in all required fields')
      return
    }
    if (Number(form.unitCost) >= Number(form.unitPrice)) {
      setError('Unit cost must be lower than unit price!')
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
          sku: form.sku,
          name: form.name,
          supplier: form.supplier,
          unitCost: Number(form.unitCost),
          unitPrice: Number(form.unitPrice),
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

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase()) ||
    p.supplier?.toLowerCase().includes(search.toLowerCase())
  )

  const getMargin = (product) => {
    if (!product.unitCost || !product.unitPrice) return null
    const margin = ((product.unitPrice - product.unitCost) / product.unitPrice * 100).toFixed(1)
    return margin
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav style={{ borderBottom: '1px solid var(--border)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--background)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={companyLogo} alt="XG Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          <div>
            <p style={{ fontSize: '14px', fontWeight: '600', lineHeight: 1, color: 'var(--foreground)' }}>XG Inventory</p>
            <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '2px' }}>Your Xtra ordinary Global Partner</p>
          </div>
        </div>
      </nav>

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

        {/* Search */}
        <div className="relative flex-1 max-w-sm mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, SKU, supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
        <div className="border border-border/60 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">SKU</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Product Name</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Supplier</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Unit Cost</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Unit Price</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Margin</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-muted-foreground">
                    <PackageOpen className="size-10 mx-auto mb-3 opacity-30" />
                    <p>{search ? 'No products match your search' : 'No products yet — add your first one!'}</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, index) => {
                  const margin = getMargin(product)
                  return (
                    <tr
                      key={product._id}
                      className={`border-b border-border/40 hover:bg-muted/30 transition-colors ${index % 2 === 0 ? '' : 'bg-muted/10'}`}
                    >
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{product.sku}</td>
                      <td className="px-6 py-4 font-medium">{product.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{product.supplier || '—'}</td>
                      <td className="px-6 py-4 text-muted-foreground">₱{Number(product.unitCost || 0).toLocaleString()}</td>
                      <td className="px-6 py-4">₱{Number(product.unitPrice).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        {margin !== null ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${Number(margin) >= 30 ? 'bg-green-100 text-green-700' : Number(margin) >= 15 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {margin}%
                          </span>
                        ) : '—'}
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
          <div className="rounded-xl p-6 w-full max-w-md" style={{ background: 'white', border: '1px solid #e5e7eb', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
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
                <div className="space-y-2">

                <Label htmlFor="sku">SKU <span className="text-red-500">*</span></Label>
                <Input
                  id="sku"
                  placeholder="e.g. PRD-001"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                />
                <p className="text-xs text-muted-foreground">Unique product code</p>
              </div>


                <Label htmlFor="name">Product Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  placeholder="e.g. Medical Gloves"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  placeholder="e.g. Laguna Supplies"
                  value={form.supplier}
                  onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="unitCost">Unit Cost (₱) <span className="text-red-500">*</span></Label>
                  <Input
                    id="unitCost"
                    type="number"
                    placeholder="e.g. 500"
                    value={form.unitCost}
                    onChange={(e) => setForm({ ...form, unitCost: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Unit Price (₱) <span className="text-red-500">*</span></Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    placeholder="e.g. 800"
                    value={form.unitPrice}
                    onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                  />
                </div>
              </div>

              {/* Live margin preview */}
              {form.unitCost && form.unitPrice && Number(form.unitPrice) > Number(form.unitCost) && (
                <div className="p-3 rounded-lg text-center" style={{ background: '#222222', border: '1px solid #696969' }}>
                  <p className="text-xs text-green-300 font-medium ">
                     Profit per unit: ₱{(Number(form.unitPrice) - Number(form.unitCost)).toLocaleString()}
                    {' '}({((Number(form.unitPrice) - Number(form.unitCost)) / Number(form.unitPrice) * 100).toFixed(1)}% margin)
                  </p>
                </div>
              )}

              {form.unitCost && form.unitPrice && Number(form.unitCost) >= Number(form.unitPrice) && (
                <div className="p-3 rounded-lg" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                  <p className="text-xs text-red-600 font-medium">
                    ⚠️ Unit cost must be lower than unit price!
                  </p>
                </div>
              )}

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