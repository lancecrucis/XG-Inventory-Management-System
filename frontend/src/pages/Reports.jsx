import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Package, Receipt, ShoppingCart } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
  ComposedChart, Area
} from 'recharts'
import companyLogo from '../assets/companyLogo.png'

const COLORS = ['#3b3b3b']

const CATEGORY_COLORS = {
  Electricity: '#fecf16',
  Packaging: '#2a54a1',
  Shipping: '#438ac9',
  Marketing: '#f6a417',
  Maintenance: '#eb321a',
  Other: '#9ca3af',
}

function StatCard({ label, value, sublabel, iconBg, valueColor }) {
  return (
    <div className="border border-border/60 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className={`size-8 rounded-lg flex items-center justify-center ${iconBg}`}>
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
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [activePeriod, setActivePeriod] = useState('all')

  const fetchData = async () => {
    try {
      const params = startDate && endDate
        ? `?startDate=${startDate}&endDate=${endDate}`
        : ''

      const [reportRes, salesRes, expensesRes] = await Promise.all([
        fetch(`http://localhost:5000/api/reports${params}`),
        fetch(`http://localhost:5000/api/sales`),
        fetch(`http://localhost:5000/api/expenses`),
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
  }, [startDate, endDate])

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
    name: p.name.length > 25 ? p.name.substring(0, 25) + '...' : p.name,
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
      bg: 'bg-gray-50',
      border: '',
      sign: '*',
    },
    {
      label: 'Cost of Goods Sold (COGS)',
      sublabel: 'What you paid for the products you sold',
      value: report?.totalCOGS || 0,
      color: 'text-red-500',
      bg: 'bg-gray-50',
      border: '',
      sign: '−',
    },
    {
      label: 'Gross Profit',
      sublabel: 'Revenue minus cost of products',
      value: report?.grossProfit || 0,
      color: report?.grossProfit >= 0 ? 'text-green-600' : 'text-red-500',
      bg: report?.grossProfit >= 0 ? 'bg-[#dbf1d8]' : 'bg-[#f9c7c6]',
      border: report?.grossProfit >= 0 ? 'border-green-500' : 'border-red-500',
      sign: '=',
      isBold: true,
    },
    {
      label: 'Operating Expenses',
      sublabel: 'Electricity, packaging, shipping, etc.',
      value: report?.totalExpenses || 0,
      color: 'text-red-500',
      bg: 'bg-gray-50',
      border: '',
      sign: '−',
    },
    {
      label: 'Net Profit',
      sublabel: 'Your actual profit after all costs',
      value: report?.netProfit || 0,
      color: isProfit ? 'text-green-600' : 'text-red-600',
      bg: isProfit ? 'bg-green-50' : 'bg-[#f9c7c6]',
      border: isProfit ? 'border-green-300' : 'border-red-500',
      sign: '=',
      isBold: true,
      isLast: true,
    },
  ]

  const handlePeriodSelect = (period) => {
    setActivePeriod(period)
    const now = new Date()
    let start, end

    switch(period) {
      case 'this_month':
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case 'last_month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        end = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case 'last_3_months':
        start = new Date(now.getFullYear(), now.getMonth() - 3, 1)
        end = now
        break
      case 'this_year':
        start = new Date(now.getFullYear(), 0, 1)
        end = now
        break
      case 'all':
        setStartDate('')
        setEndDate('')
        return
      default:
        return
    }

    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
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

  {/* Period Filter */}
  <div className="flex items-center gap-2 mt-4 flex-wrap">
    {[
      { key: 'all', label: 'All Time' },
      { key: 'this_month', label: 'This Month' },
      { key: 'last_month', label: 'Last Month' },
      { key: 'last_3_months', label: 'Last 3 Months' },
      { key: 'this_year', label: 'This Year' },
    ].map(period => (
      <button
        key={period.key}
        onClick={() => handlePeriodSelect(period.key)}
        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
        style={{
          background: activePeriod === period.key ? '#1a1a1a' : 'transparent',
          color: activePeriod === period.key ? '#fff' : 'var(--muted-foreground)',
          border: '1px solid',
          borderColor: activePeriod === period.key ? '#1a1a1a' : 'var(--border)',
        }}
      >
        {period.label}
      </button>
    ))}

    {/* Custom date range */}
    <div className="flex items-center gap-2 ml-2">
      <input
        type="date"
        value={startDate}
        onChange={(e) => { setStartDate(e.target.value); setActivePeriod('custom') }}
        className="h-8 rounded-lg border px-2 text-xs"
        style={{ borderColor: 'var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
      />
      <span className="text-xs text-muted-foreground">to</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => { setEndDate(e.target.value); setActivePeriod('custom') }}
        className="h-8 rounded-lg border px-2 text-xs"
        style={{ borderColor: 'var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
      />
    </div>
  </div>

  {/* Active filter label */}
  {(startDate && endDate) && (
    <p className="text-xs text-muted-foreground mt-2">
      Showing data from <strong>{new Date(startDate).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}</strong> to <strong>{new Date(endDate).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
    </p>
  )}
</div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Revenue"
            value={`₱${report?.totalRevenue?.toLocaleString() || 0}`}
            sublabel={`${report?.totalSales || 0} sales recorded`}
            iconBg=""
            iconColor="text-[#159644]"
            valueColor="text-[#159644]"
          />
          <StatCard
            label="Total COGS"
            value={`₱${report?.totalCOGS?.toLocaleString() || 0}`}
            sublabel="Cost of products sold"
            iconBg=""
            iconColor="text-red-500"
            valueColor="text-red-500"
          />
          <StatCard
            label="Total Expenses"
            value={`₱${report?.totalExpenses?.toLocaleString() || 0}`}
            sublabel="Operating expenses"
            iconBg=""
            iconColor="text-yellow-500"
            valueColor="text-yellow-500"
          />
          <StatCard
            label="Net Profit"
            value={`₱${report?.netProfit?.toLocaleString() || 0}`}
            sublabel={isProfit ? 'Good' : 'Loss'}
            iconBg={""}
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
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${step.bg} ${step.border} ${step.isLast ? 'mt-3' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {step.sign && (
                          <span className={`text-lg font-bold w-4 ${step.color}`}>{step.sign}</span>
                        )}
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
                    <div className="border-t border-border/40 my-1.5" />
                  )}
                </div>
              ))}
            </div>
          </div>
              
          {/* Revenue vs Expenses Line Chart */}
        <div className="border border-border/60 rounded-xl p-6">
          <h3 className="text-base font-semibold mb-1">Revenue vs Expenses</h3>
          <p className="text-xs text-muted-foreground mb-4">Last 6 months comparison</p>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />
              <span className="text-xs text-muted-foreground">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
              <span className="text-xs text-muted-foreground">Expenses</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 12" stroke="var(--border)" strokeOpacity={0.6} horizontal={true} vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickMargin={12} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={v => `₱${v >= 1000 ? `${v/1000}K` : v}`} tickMargin={12} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div style={{ background: '#18181b', color: 'white', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                        <div style={{ opacity: 0.6, marginBottom: '6px' }}>{label}</div>
                        {payload.map((p, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />
                            <span style={{ opacity: 0.7 }}>{p.name}:</span>
                            <span style={{ fontWeight: 600 }}>₱{p.value.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )
                  }
                  return null
                }}
                cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
              />
              <Area type="linear" dataKey="Revenue" stroke="transparent" fill="url(#revenueGradient)" dot={false} />
              <Area type="linear" dataKey="Expenses" stroke="transparent" fill="url(#expenseGradient)" dot={false} />
              <Line type="linear" dataKey="Revenue" stroke="#22c55e" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#22c55e', stroke: 'white', strokeWidth: 2 }} />
              <Line type="linear" dataKey="Expenses" stroke="#ef4444" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#ef4444', stroke: 'white', strokeWidth: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        </div>







        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Top Products Bar Chart */}
          <div className="border border-border/60 rounded-xl p-6">
            <h3 className="text-base font-semibold mb-1">Selling Products</h3>
            <p className="text-xs text-muted-foreground mb-4">Revenue generated per product</p>
            {topProductsData.length === 0 ? (
              <div className="flex items-center justify-center h-48">
                <p className="text-sm text-muted-foreground">No sales recorded yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={topProductsData} layout="vertical" 
                >
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={70} />
                  <Tooltip
                    formatter={(value) => [`₱${value.toLocaleString()}`, 'Revenue']}
                    contentStyle={{ fontSize: 12, borderRadius: 8, background:'#3b3b3b', color:'white' }}
                    itemStyle={{color: 'white'}}
                  />
                  <Bar dataKey="Revenue" fill="#4b4b4b" radius={[0, 4, 4, 0]} barSize={20} />
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
                    <td className="py-3 text-red-600 font-semibold">{product.quantity} units</td>
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