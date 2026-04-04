import API_URL from '../config'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, X, Search, Receipt } from 'lucide-react'
import companyLogo from '../assets/companyLogo.png'

const CATEGORIES = ['Electricity', 'Packaging', 'Shipping', 'Marketing', 'Maintenance', 'Other']

const CATEGORY_COLORS = {
  Electricity: 'bg-yellow-100 text-yellow-700 border-1 border-yellow-500',
  Packaging: 'bg-blue-100 text-[#2a54a1] border-1 border-blue-500',
  Shipping: 'bg-sky-100 text-sky-700 border-1 border-sky-500',
  Marketing: 'bg-orange-100 text-orange-700 border-1 border-orange-500',
  Maintenance: 'bg-red-100 text-red-700 border-1 border-red-500',
  Other: 'bg-gray-100 text-gray-700 border-1 border-gray-500',
}

function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [form, setForm] = useState({
    category: 'Electricity',
    amount: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [error, setError] = useState('')

  const fetchExpenses = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/expenses')
      const data = await res.json()
      setExpenses(data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  const handleOpenModal = () => {
    setForm({
      category: 'Electricity',
      amount: '',
      note: '',
      date: new Date().toISOString().split('T')[0],
    })
    setError('')
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.amount || !form.date) {
      setError('Please fill in all required fields')
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message)
        setIsLoading(false)
        return
      }
      await fetchExpenses()
      setIsModalOpen(false)
    } catch (error) {
      setError('Something went wrong. Please try again.')
    }
    setIsLoading(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return
    try {
      await fetch(`http://localhost:5000/api/expenses/${id}`, { method: 'DELETE' })
      await fetchExpenses()
    } catch (error) {
      console.log(error)
    }
  }

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch =
      e.category.toLowerCase().includes(search.toLowerCase()) ||
      e.note?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' ? true : e.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  const expensesByCategory = CATEGORIES.map(cat => ({
    category: cat,
    total: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
  })).filter(c => c.total > 0)

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
            <h2 className="text-2xl font-bold">Expenses</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'} total
            </p>
          </div>
          <Button onClick={handleOpenModal} className="gap-2">
            <Plus className="size-4" />
            Add Expense
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="border border-border/60 rounded-lg p-4 col-span-1">
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <p className="text-2xl font-bold mt-1">₱{totalExpenses.toLocaleString()}</p>
          </div>
          {expensesByCategory.slice(0, 3).map(c => (
            <div key={c.category} className="border border-border/60 rounded-lg p-4 text-red-500">
              <p className="text-sm text-muted-foreground">{c.category}</p>
              <p className="text-2xl font-bold mt-1">₱{c.total.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by category or note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setCategoryFilter('all')}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: categoryFilter === 'all' ? '#1a1a1a' : 'transparent',
                color: categoryFilter === 'all' ? '#fff' : 'var(--muted-foreground)',
                border: '1px solid',
                borderColor: categoryFilter === 'all' ? '#1a1a1a' : 'var(--border)',
              }}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: categoryFilter === cat ? '#1a1a1a' : 'transparent',
                  color: categoryFilter === cat ? '#fff' : 'var(--muted-foreground)',
                  border: '1px solid',
                  borderColor: categoryFilter === cat ? '#1a1a1a' : 'var(--border)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="border border-border/60 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Category</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Note</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-muted-foreground">
                    <Receipt className="size-10 mx-auto mb-3 opacity-30" />
                    <p>{search || categoryFilter !== 'all' ? 'No expenses match your search' : 'No expenses yet — add your first one!'}</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense, index) => (
                  <tr
                    key={expense._id}
                    className={`border-b border-border/40 hover:bg-muted/30 transition-colors ${index % 2 === 0 ? '' : 'bg-muted/10'}`}
                  >
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-5 py-2 rounded-full text-xs font-medium ${CATEGORY_COLORS[expense.category]}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold">₱{expense.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-muted-foreground">{expense.note || '—'}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-red-500 hover:text-red-600 hover:border-red-300"
                        onClick={() => handleDelete(expense._id)}
                      >
                        <Trash2 className="size-3" />
                        Delete
                      </Button>
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
          <div className="rounded-xl p-6 w-full max-w-md" style={{ background: 'white', border: '1px solid #e5e7eb', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Add Expense</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Category <span className="text-red-500">*</span></Label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full h-10 rounded-md border px-3 text-sm"
                  style={{ borderColor: 'var(--border)', background: 'white' }}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Amount (₱) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  placeholder="e.g. 5000"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Date <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Note (optional)</Label>
                <Input
                  placeholder="e.g. Monthly electricity bill"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Add Expense'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Expenses