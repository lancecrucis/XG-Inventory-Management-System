import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Package, Receipt, ShoppingCart } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid
} from 'recharts'
import companyLogo from '../assets/companyLogo.png'

const COLORS = ['#6C3FF5', '#FF9B6B', '#E8D754', '#2D2D2D', '#10b981', '#f43f5e']

const CATEGORY_COLORS = {
  Electricity: '#facc15',
  Packaging: '#60a5fa',
  Shipping: '#a78bfa',
  Marketing: '#f472b6',
  Maintenance: '#fb923c',
  Other: '#9ca3af',
}

function StatCard({ label, value, sublabel, icon: Icon, iconBg, iconColor, valueColor }) {
  return (
    <div className="border border-border/60 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className={`size-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className={`size-4 ${iconColor}`} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${valueColor || ''}`}>{value}</p>
      {sublabel && <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>}
    </div>
  )
}

function Reports() {
  const [report, setReport] = useState(null)
  const [sales, setSales] = useState([])
  const [expenses, setExpenses] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [reportRes, salesRes, expensesRes] = await Promise.all([
        fetch('http://localhost:5000/api/reports'),
        fetch('http://localhost:5000/api/sales'),
        fetch('http://localhost:5000/api/expenses'),
      ])
      const [reportData, salesData, expensesData] = await Promise.all([
        reportRes.json(),
        salesRes.json(),
        expensesRes.json(),
      ])
      setReport(reportData)
      setSales(salesData)
      setExpenses(expensesData)
    } catch (error) {
      console.log(error)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading reports...</p>
      </div>
    )
  }

  const isProfit = report?.netProfit >= 0

  // Monthly revenue vs expenses
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (5 - i))
    const monthLabel = date.toLocaleDateString('en-PH', { month: 'short', year: '2-digit' })

    const monthRevenue = sales.filter(sale => {
      const d = new Date(sale.createdAt)
      return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear()
    }).reduce((sum, sale) => sum + sale.totalAmount, 0)

    const monthExpenses = expenses.filter(expense => {
      const d = new Date(expense.date)
      return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear()
    }).reduce((sum, expense) => sum + expense.amount, 0)

    return { month: monthLabel, Revenue: monthRevenue, Expenses: monthExpenses }
  })

  // Top products bar chart data
  const topProductsData = report?.topProducts?.map(p => ({
    name: p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name,
    Revenue: p.revenue,
    Units: p.quantity,
  })) || []

  // Expense pie data
  const expensePieData = Object.entries(report?.expensesByCategory || {}).map(([name, value]) => ({ name, value }))

  // P&L steps
  const plSteps = [
    {
      label: 'Total Revenue',
      sublabel: 'Money from all sales',
      value: report?.totalRevenue || 0,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: DollarSign,
      iconColor: 'text-green-600',
      sign: '',
    },
    {
      label: 'Cost of Goods Sold (COGS)',
      sublabel: 'What you paid for the products you sold',
      value: report?.totalCOGS || 0,
      color: 'text-red-500',
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: Package,
      iconColor: 'text-red-500',
      sign: '−',
    },
    {
      label: 'Gross Profit',
      sublabel: 'Revenue minus cost of products',
      value: report?.grossProfit || 0,
      color: report?.grossProfit >= 0 ? 'text-green-600' : 'text-red-500',
      bg: report?.grossProfit >= 0 ? 'bg-green-50' : 'bg-red-50',
      border: report?.grossProfit >= 0 ? 'border-green-200' : 'border-red-200',
      icon: TrendingUp,
      iconColor: report?.grossProfit >= 0 ? 'text-green-600' : 'text-red-500',
      sign: '=',
      isBold: true,
    },
    {
      label: 'Operating Expenses',
      sublabel: 'Electricity, packaging, shipping, etc.',
      value: report?.totalExpenses || 0,
      color: 'text-red-500',
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: Receipt,
      iconColor: 'text-red-500',
      sign: '−',
    },
    {
      label: 'Net Profit',
      sublabel: 'Your actual profit after all costs',
      value: report?.netProfit || 0,
      color: isProfit ? 'text-green-600' : 'text-red-500',
      bg: isProfit ? 'bg-green-50' : 'bg-red-50',
      border: isProfit ? 'border-green-300' : 'border-red-300',
      icon: isProfit ? TrendingUp : TrendingDown,
      iconColor: isProfit ? 'text-green-600' : 'text-red-500',
      sign: '=',
      isBold: true,
      isLast: true,
    },
  ]

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
        <button
          onClick={fetchData}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ border: '1px solid var(--border)', color: 'var(--foreground)', background: 'transparent' }}
        >
          Refresh
        </button>
      </nav>

      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Reports</h2>
          <p className="text-sm text-muted-foreground mt-1">Detailed business performance analysis</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Revenue"
            value={`₱${report?.totalRevenue?.toLocaleString() || 0}`}
            sublabel={`${report?.totalSales || 0} sales recorded`}
            icon={DollarSign}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            valueColor="text-green-600"
          />
          <StatCard
            label="Total COGS"
            value={`₱${report?.totalCOGS?.toLocaleString() || 0}`}
            sublabel="Cost of products sold"
            icon={Package}
            iconBg="bg-red-100"
            iconColor="text-red-500"
            valueColor="text-red-500"
          />
          <StatCard
            label="Total Expenses"
            value={`₱${report?.totalExpenses?.toLocaleString() || 0}`}
            sublabel="Operating expenses"
            icon={Receipt}
            iconBg="bg-orange-100"
            iconColor="text-orange-500"
            valueColor="text-orange-500"
          />
          <StatCard
            label="Net Profit"
            value={`₱${report?.netProfit?.toLocaleString() || 0}`}
            sublabel={isProfit ? 'You are profitable!' : 'You are at a loss!'}
            icon={isProfit ? TrendingUp : TrendingDown}
            iconBg={isProfit ? 'bg-green-100' : 'bg-red-100'}
            iconColor={isProfit ? 'text-green-600' : 'text-red-500'}
            valueColor={isProfit ? 'text-green-600' : 'text-red-500'}
          />
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* P&L Breakdown */}
          <div className="border border-border/60 rounded-xl p-6">
            <h3 className="text-base font-semibold mb-1">Profit & Loss Breakdown</h3>
            <p className="text-xs text-muted-foreground mb-4">Step by step breakdown of your business finances</p>
            <div className="space-y-2">
              {plSteps.map((step, index) => (
                <div key={index}>
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${step.bg} ${step.border} ${step.isLast ? 'mt-2' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {step.sign && (
                          <span className={`text-lg font-bold w-4 ${step.color}`}>{step.sign}</span>
                        )}
                        <step.icon className={`size-4 ${step.iconColor}`} />
                      </div>
                      <div>
                        <p className={`text-sm ${step.isBold ? 'font-bold' : 'font-medium'}`}>{step.label}</p>
                        <p className="text-xs text-muted-foreground">{step.sublabel}</p>
                      </div>
                    </div>
                    <p className={`font-bold ${step.isBold ? 'text-lg' : 'text-sm'} ${step.color}`}>
                      ₱{Math.abs(step.value).toLocaleString()}
                    </p>
                  </div>
                  {(index === 1 || index === 3) && (
                    <div className="border-t border-border/40 my-1" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Revenue vs Expenses Line Chart */}
          <div className="border border-border/60 rounded-xl p-6">
            <h3 className="text-base font-semibold mb-1">Revenue vs Expenses</h3>
            <p className="text-xs text-muted-foreground mb-4">Last 6 months comparison</p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value, name) => [`₱${value.toLocaleString()}`, name]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Legend />
                <Line type="monotone" dataKey="Revenue" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Top Products Bar Chart */}
          <div className="border border-border/60 rounded-xl p-6">
            <h3 className="text-base font-semibold mb-1">Top Selling Products</h3>
            <p className="text-xs text-muted-foreground mb-4">Revenue generated per product</p>
            {topProductsData.length === 0 ? (
              <div className="flex items-center justify-center h-48">
                <p className="text-sm text-muted-foreground">No sales recorded yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topProductsData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip
                    formatter={(value) => [`₱${value.toLocaleString()}`, 'Revenue']}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Bar dataKey="Revenue" fill="#6C3FF5" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Expense Pie Chart */}
          <div className="border border-border/60 rounded-xl p-6">
            <h3 className="text-base font-semibold mb-1">Expense Breakdown</h3>
            <p className="text-xs text-muted-foreground mb-4">Where your money is going</p>
            {expensePieData.length === 0 ? (
              <div className="flex items-center justify-center h-48">
                <p className="text-sm text-muted-foreground">No expenses recorded yet</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={expensePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {expensePieData.map((entry, index) => (
                        <Cell key={index} fill={CATEGORY_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₱${value.toLocaleString()}`, '']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {expensePieData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                      <div className="size-2.5 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[item.name] || COLORS[index % COLORS.length] }} />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-medium ml-auto">₱{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Top Products Table */}
        <div className="border border-border/60 rounded-xl p-6">
          <h3 className="text-base font-semibold mb-1">Product Performance</h3>
          <p className="text-xs text-muted-foreground mb-4">Detailed breakdown of top selling products</p>
          {report?.topProducts?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No sales recorded yet!</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="text-left py-2 font-medium text-muted-foreground">Rank</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">Product</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">SKU</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">Units Sold</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">Revenue</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {report?.topProducts?.map((product, index) => (
                  <tr key={index} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                    <td className="py-3">
                      <div className="size-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: COLORS[index % COLORS.length] }}
                      >
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-3 font-medium">{product.name}</td>
                    <td className="py-3 font-mono text-xs text-muted-foreground">{product.sku}</td>
                    <td className="py-3">{product.quantity} units</td>
                    <td className="py-3 font-semibold text-green-600">₱{product.revenue.toLocaleString()}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.round((product.revenue / report?.totalRevenue) * 100)}%`,
                              background: COLORS[index % COLORS.length]
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8">
                          {Math.round((product.revenue / report?.totalRevenue) * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reports