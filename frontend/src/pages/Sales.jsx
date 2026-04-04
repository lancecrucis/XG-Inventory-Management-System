import API_URL from '../config'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, X, ShoppingCart, Search, Eye } from 'lucide-react'
import companyLogo from '../assets/companyLogo.png'

function Sales() {
  const [sales, setSales] = useState([])
  const [inventory, setInventory] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [cartItems, setCartItems] = useState([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedQuantity, setSelectedQuantity] = useState(1)

  const fetchSales = async () => {
    try {
      const res = await fetch(`${API_URL}/api/sales`)
      const data = await res.json()
      setSales(data)
    } catch (error) {
      console.log(error)
    }
  }

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${API_URL}/api/inventory`)
      const data = await res.json()
      setInventory(data.filter(inv => inv.quantity > 0))
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchSales()
    fetchInventory()
  }, [])

  const handleOpenModal = () => {
    setCartItems([])
    setNote('')
    setError('')
    setSelectedProductId('')
    setSelectedQuantity(1)
    setIsModalOpen(true)
  }

  const handleAddToCart = () => {
    if (!selectedProductId) {
      setError('Please select a product')
      return
    }

    const invItem = inventory.find(inv => inv.product._id === selectedProductId)
    if (!invItem) return

    const existing = cartItems.find(item => item.productId === selectedProductId)
    const currentQty = existing ? existing.quantity : 0

    if (currentQty + Number(selectedQuantity) > invItem.quantity) {
      setError(`Only ${invItem.quantity} units available in stock`)
      return
    }

    if (existing) {
      setCartItems(cartItems.map(item =>
        item.productId === selectedProductId
          ? { ...item, quantity: item.quantity + Number(selectedQuantity), totalPrice: (item.quantity + Number(selectedQuantity)) * item.unitPrice }
          : item
      ))
    } else {
      setCartItems([...cartItems, {
        productId: selectedProductId,
        name: invItem.product.name,
        sku: invItem.product.sku,
        unitPrice: invItem.product.unitPrice,
        quantity: Number(selectedQuantity),
        totalPrice: Number(selectedQuantity) * invItem.product.unitPrice,
        availableStock: invItem.quantity,
      }])
    }

    setSelectedProductId('')
    setSelectedQuantity(1)
    setError('')
  }

  const handleRemoveFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.productId !== productId))
  }

  const handleSubmit = async () => {
    if (cartItems.length === 0) {
      setError('Please add at least one product')
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
          note,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message)
        setIsLoading(false)
        return
      }
      await fetchSales()
      await fetchInventory()
      setIsModalOpen(false)
    } catch (error) {
      setError('Something went wrong. Please try again.')
    }
    setIsLoading(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sale?')) return
    try {
      await fetch(`${API_URL}/api/sales/${id}`, { method: 'DELETE' })
      await fetchSales()
    } catch (error) {
      console.log(error)
    }
  }

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)

  const filteredSales = sales.filter(sale =>
    sale.saleNumber?.toLowerCase().includes(search.toLowerCase()) ||
    sale.note?.toLowerCase().includes(search.toLowerCase())
  )

  const cartTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0)

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
            <h2 className="text-2xl font-bold">Sales</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {sales.length} {sales.length === 1 ? 'sale' : 'sales'} total
            </p>
          </div>
          <Button onClick={handleOpenModal} className="gap-2">
            <Plus className="size-4" />
            New Sale
          </Button>
        </div>

        {/* Summary Card */}
        <div className="grid grid-cols-3 gap-4 mb-6 ">
          <div className="border border-border/60 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold mt-1">₱{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="border border-border/60 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Sales</p>
            <p className="text-2xl font-bold mt-1">{sales.length}</p>
          </div>
          <div className="border border-border/60 rounded-lg p-4 text-[#159644]">
            <p className="text-sm text-muted-foreground">Average Sale</p>
            <p className="text-2xl font-bold mt-1">₱{sales.length > 0 ? Math.round(totalRevenue / sales.length).toLocaleString() : 0}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by sale number or note..."
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
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Sale #</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Items</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Total Amount</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Note</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-muted-foreground">
                    <ShoppingCart className="size-10 mx-auto mb-3 opacity-30" />
                    <p>{search ? 'No sales match your search' : 'No sales yet — record your first sale!'}</p>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale, index) => (
                  <tr
                    key={sale._id}
                    className={`border-b border-border/40 hover:bg-muted/30 transition-colors ${index % 2 === 0 ? '' : 'bg-muted/10'}`}
                  >
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{sale.saleNumber}</td>
                    <td className="px-6 py-4">{sale.items.length} {sale.items.length === 1 ? 'item' : 'items'}</td>
                    <td className="px-6 py-4 font-semibold">₱{sale.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-muted-foreground">{sale.note || '—'}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(sale.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => { setSelectedSale(sale); setIsViewModalOpen(true) }}
                        >
                          <Eye className="size-3" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-red-500 hover:text-red-600 hover:border-red-300"
                          onClick={() => handleDelete(sale._id)}
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

      {/* New Sale Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: 'white', border: '1px solid #e5e7eb', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">New Sale</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            {/* Add product to cart */}
            <div className="p-4 rounded-lg mb-4" style={{ background: '#f0f0f0' }}>
              <p className="text-sm font-medium mb-3">Add Product</p>
              <div className="flex gap-2">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="flex-1 h-10 rounded-md border px-3 text-sm"
                  style={{ borderColor: 'var(--border)', background: 'white' }}
                >
                  <option value="">Choose a product...</option>
                  {inventory.map(inv => (
                    <option key={inv.product._id} value={inv.product._id}>
                      {inv.product.sku} — {inv.product.name} (₱{inv.product.unitPrice.toLocaleString()}) — {inv.quantity} in stock
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  min="1"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(e.target.value)}
                  className="w-20"
                  placeholder="Qty"
                />
                <Button onClick={handleAddToCart} className="gap-1.5">
                  <Plus className="size-4" />
                  Add
                </Button>
              </div>
            </div>

            {/* Cart items */}
            {cartItems.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Cart</p>
                <div className="border border-border/60 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/40">
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground">Product</th>
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground">Unit Price</th>
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground">Qty</th>
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground">Total</th>
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map(item => (
                        <tr key={item.productId} className="border-b border-border/40">
                          <td className="px-4 py-2">{item.name}</td>
                          <td className="px-4 py-2">₱{item.unitPrice.toLocaleString()}</td>
                          <td className="px-4 py-2">{item.quantity}</td>
                          <td className="px-4 py-2 font-medium">₱{item.totalPrice.toLocaleString()}</td>
                          <td className="px-4 py-2">
                            <button onClick={() => handleRemoveFromCart(item.productId)} className="text-red-500 hover:text-red-700">
                              <X className="size-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end mt-2">
                  <p className="text-base font-bold">Total: ₱{cartTotal.toLocaleString()}</p>
                </div>
              </div>
            )}

            <div className="space-y-2 mb-4">
              <Label>Note (optional)</Label>
              <Input
                placeholder="Note or reference no."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Processing...' : `Confirm Sale — ₱${cartTotal.toLocaleString()}`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Sale Modal */}
      {isViewModalOpen && selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="rounded-xl p-6 w-full max-w-lg" style={{ background: 'white', border: '1px solid #e5e7eb', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Sale Details</h3>
                <p className="text-sm text-muted-foreground font-mono">{selectedSale.saleNumber}</p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {selectedSale.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#f0f0f0' }}>
                  <div>
                    <p className="text-sm font-medium">{item.product?.name}</p>
                    <p className="text-xs text-muted-foreground">{item.quantity} × ₱{item.unitPrice.toLocaleString()}</p>
                  </div>
                  <p className="text-sm font-semibold">₱{item.totalPrice.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-border/60 pt-3 flex items-center justify-between">
              <p className="font-semibold">Total Amount</p>
              <p className="text-lg font-bold">₱{selectedSale.totalAmount.toLocaleString()}</p>
            </div>

            {selectedSale.note && (
              <p className="text-sm text-muted-foreground mt-3">Note: {selectedSale.note}</p>
            )}

            <p className="text-xs text-muted-foreground mt-2">
              {new Date(selectedSale.createdAt).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sales