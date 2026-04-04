import API_URL from '../config'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Minus, Search, AlertTriangle, History, X, Download } from 'lucide-react'
import companyLogo from '../assets/companyLogo.png'

function Inventory() {
  const [inventory, setInventory] = useState([])
  const [products, setProducts] = useState([])
  const [history, setHistory] = useState([])
  const [search, setSearch] = useState('')
  const [stockFilter, setStockFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [modalType, setModalType] = useState('add')
  const [selectedInventory, setSelectedInventory] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({ quantity: '', note: '', lowStockThreshold: '10' })
  const [error, setError] = useState('')
  const [isAddProductModal, setIsAddProductModal] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState('')

  const fetchInventory = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/inventory')
      const data = await res.json()
      setInventory(data)
    } catch (error) {
      console.log(error)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products')
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.log(error)
    }
  }

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/inventory/history')
      const data = await res.json()
      setHistory(data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchInventory()
    fetchProducts()
    fetchHistory()
  }, [])

  const handleOpenAdd = (inv) => {
    setSelectedInventory(inv)
    setModalType('add')
    setForm({ quantity: '', note: '', lowStockThreshold: inv.lowStockThreshold })
    setError('')
    setIsModalOpen(true)
  }

  const handleOpenRemove = (inv) => {
    setSelectedInventory(inv)
    setModalType('remove')
    setForm({ quantity: '', note: '', lowStockThreshold: inv.lowStockThreshold })
    setError('')
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.quantity || Number(form.quantity) <= 0) {
      setError('Please enter a valid quantity')
      return
    }
    setIsLoading(true)
    try {
      const endpoint = modalType === 'add' ? 'add' : 'remove'
      const res = await fetch(`http://localhost:5000/api/inventory/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedInventory.product._id,
          quantity: Number(form.quantity),
          note: form.note,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message)
        setIsLoading(false)
        return
      }
      await fetchInventory()
      await fetchHistory()
      setIsModalOpen(false)
    } catch (error) {
      setError('Something went wrong. Please try again.')
    }
    setIsLoading(false)
  }

  const handleAddToInventory = async () => {
    if (!selectedProductId) {
      setError('Please select a product')
      return
    }
    if (!form.quantity || Number(form.quantity) <= 0) {
      setError('Please enter a valid quantity')
      return
    }
    setIsLoading(true)
    try {
      await fetch('http://localhost:5000/api/inventory/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductId,
          quantity: Number(form.quantity),
          lowStockThreshold: Number(form.lowStockThreshold),
          note: form.note,
        }),
      })
      await fetchInventory()
      await fetchHistory()
      setIsAddProductModal(false)
      setSelectedProductId('')
      setForm({ quantity: '', note: '', lowStockThreshold: '10' })
    } catch (error) {
      setError('Something went wrong. Please try again.')
    }
    setIsLoading(false)
  }

  const handleExportCSV = () => {
    const headers = ['SKU', 'Product Name', 'Supplier', 'Unit Price', 'Quantity', 'Total Value', 'Low Stock Threshold', 'Status']
    const rows = filteredInventory.map(inv => {
      const status = getStockStatus(inv)
      return [
        inv.product?.sku,
        inv.product?.name,
        inv.product?.supplier || 'N/A',
        inv.product?.unitPrice,
        inv.quantity,
        (inv.product?.unitPrice * inv.quantity).toFixed(2),
        inv.lowStockThreshold,
        status.label,
      ]
    })
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'xg-inventory.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStockStatus = (inv) => {
    if (inv.quantity === 0) return { label: 'No Stock', color: ' text-red-700' }
    if (inv.quantity <= inv.lowStockThreshold) return { label: 'Low Stock', color: ' text-yellow-700' }
    return { label: 'In Stock', color: ' text-green-700' }
  }

  const filteredInventory = inventory.filter(inv => {
    const matchesSearch =
      inv.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      inv.product?.sku?.toLowerCase().includes(search.toLowerCase()) ||
      inv.product?.supplier?.toLowerCase().includes(search.toLowerCase())

    const matchesStock =
      stockFilter === 'all' ? true :
      stockFilter === 'low' ? inv.quantity > 0 && inv.quantity <= inv.lowStockThreshold :
      stockFilter === 'none' ? inv.quantity === 0 : true

    return matchesSearch && matchesStock
  })

  const lowStockCount = inventory.filter(inv => inv.quantity > 0 && inv.quantity <= inv.lowStockThreshold).length
  const noStockCount = inventory.filter(inv => inv.quantity === 0).length

  // Products not yet in inventory
  const productsNotInInventory = products.filter(p =>
    !inventory.find(inv => inv.product?._id === p._id)
  )

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
            <h2 className="text-2xl font-bold">Inventory</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {inventory.length} {inventory.length === 1 ? 'item' : 'items'} tracked
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2" onClick={() => { fetchHistory(); setIsHistoryOpen(true) }}>
              <History className="size-4" />
              Stock History
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
              <Download className="size-4" />
              Export CSV
            </Button>
            {productsNotInInventory.length > 0 && (
              <Button className="gap-2" onClick={() => { setIsAddProductModal(true); setError(''); setForm({ quantity: '', note: '', lowStockThreshold: '10' }) }}>
                <Plus className="size-4" />
                Add to Inventory
              </Button>
            )}
          </div>
        </div>

        {/* Alerts */}
        {(lowStockCount > 0 || noStockCount > 0) && (
          <div className="flex gap-3 mb-6">
            {lowStockCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-200 text-zinc-700 text-sm border border-yellow-500">
                <AlertTriangle className="size-4" />
                <span><strong>{lowStockCount}</strong> {lowStockCount === 1 ? 'item is' : 'items are'} low on stock</span>
              </div>
            )}
            {noStockCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-200 text-rose-800 text-sm border border-red-400">
                <AlertTriangle className="size-4" />
                <span><strong>{noStockCount}</strong> {noStockCount === 1 ? 'item is' : 'items are'} out of stock</span>
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
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-muted-foreground">
                    <p>{search || stockFilter !== 'all' ? 'No items match your search' : 'No inventory yet — add products to inventory first!'}</p>
                  </td>
                </tr>
              ) : (
                filteredInventory.map((inv, index) => {
                  const status = getStockStatus(inv)
                  const totalValue = (inv.product?.unitPrice || 0) * inv.quantity
                  return (
                    <tr
                      key={inv._id}
                      className={`border-b border-border/40 hover:bg-muted/30 transition-colors ${index % 2 === 0 ? '' : 'bg-muted/10'}`}
                    >
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{inv.product?.sku}</td>
                      <td className="px-6 py-4 font-medium">{inv.product?.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{inv.product?.supplier || '—'}</td>
                      <td className="px-6 py-4">₱{Number(inv.product?.unitPrice).toLocaleString()}</td>
                      <td className="px-6 py-4 font-semibold">{inv.quantity}</td>
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
                            onClick={() => handleOpenAdd(inv)}
                          >
                            <Plus className="size-3" />
                            Add Stock
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-red-500 hover:text-red-600 hover:border-red-300"
                            onClick={() => handleOpenRemove(inv)}
                          >
                            <Minus className="size-3" />
                            Remove
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

      {/* Add/Remove Stock Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="rounded-xl p-6 w-full max-w-md" style={{ background: 'white', border: '1px solid #e5e7eb', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                {modalType === 'add' ? '+ Add Stock' : '- Remove Stock'} — {selectedInventory?.product?.name}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-lg" style={{ background: '#f9fafb' }}>
                <p className="text-sm text-muted-foreground">Current Stock</p>
                <p className="text-2xl font-bold">{selectedInventory?.quantity} units</p>
              </div>

              <div className="space-y-2">
                <Label>Quantity to {modalType === 'add' ? 'Add' : 'Remove'}</Label>
                <Input
                  type="number"
                  placeholder="e.g. 10"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Note (optional)</Label>
                <Input
                  placeholder="e.g. Restocked from supplier"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Saving...' : modalType === 'add' ? 'Add Stock' : 'Remove Stock'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product to Inventory Modal */}
      {isAddProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="rounded-xl p-6 w-full max-w-md" style={{ background: 'white', border: '1px solid #e5e7eb', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Add Product to Inventory</h3>
              <button onClick={() => setIsAddProductModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Product</Label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full h-10 rounded-md border px-3 text-sm"
                  style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
                >
                  <option value="">Choose a product...</option>
                  {productsNotInInventory.map(p => (
                    <option key={p._id} value={p._id}>{p.sku} — {p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Initial Quantity</Label>
                <Input
                  type="number"
                  placeholder="e.g. 50"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Low Stock Warning — warn me when below</Label>
                <Input
                  type="number"
                  placeholder="e.g. 10"
                  value={form.lowStockThreshold}
                  onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Note (optional)</Label>
                <Input
                  placeholder="e.g. Initial stock"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setIsAddProductModal(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleAddToInventory} disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add to Inventory'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stock History Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto" style={{ background: 'white', border: '1px solid #e5e7eb', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Stock History</h3>
              <button onClick={() => setIsHistoryOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            {history.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No stock history yet!</p>
            ) : (
              <div className="space-y-3">
                {history.map((h) => (
                  <div key={h._id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#f9fafb' }}>
                    <div className="flex items-center gap-3">
                      <span className={`size-8 rounded-full flex items-center justify-center text-lg ${h.type === 'add' ? 'border-1 border-green-500 bg-green-100 text-green-700' : ' border-1 border-red-500 bg-[#f9c7c6] text-red-700'}`}>
                        {h.type === 'add' ? (<Plus className="size-4"/>):(
                          <Minus className="size-4" />
                        )}

                      </span>
                      <div>
                        <p className="text-sm font-medium">{h.product?.name}</p>
                        <p className="text-xs text-muted-foreground">{h.note || 'No note'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${h.type === 'add' ? 'text-green-600' : 'text-red-600'}`}>
                        {h.type === 'add' ? '+' : '-'}{h.quantity} units
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(h.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventory