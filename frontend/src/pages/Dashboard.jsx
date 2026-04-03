import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, ArrowRight, AlertTriangle, Package, ShoppingCart } from 'lucide-react'
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import companyLogo from '../assets/companyLogo.png'

const CustomRevenueTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#18181b',
        color: 'white',
        padding: '10px 14px',
        borderRadius: '10px',
        fontSize: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}>
        <div style={{ opacity: 0.6, marginBottom: '4px' }}>{label}</div>
        <div style={{ fontWeight: '600', fontSize: '14px' }}>₱{payload[0]?.value?.toLocaleString()}</div>
      </div>
    )
  }
  return null
}

function Dashboard() {
  const [report, setReport] = useState(null)
  const [sales, setSales] = useState([])
  const [inventory, setInventory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState('7d')
  const navigate = useNavigate()

  const fetchData = async () => {
    try {
      const [reportRes, salesRes, inventoryRes] = await Promise.all([
        fetch('http://localhost:5000/api/reports'),
        fetch('http://localhost:5000/api/sales'),
        fetch('http://localhost:5000/api/inventory'),
      ])
      const [reportData, salesData, inventoryData] = await Promise.all([
        reportRes.json(),
        salesRes.json(),
        inventoryRes.json(),
      ])
      setReport(reportData)
      setSales(salesData)
      setInventory(inventoryData)
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
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  const isProfit = (report?.netProfit || 0) >= 0

  // Revenue chart data based on period
  const getRevenueData = () => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
    return Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      const label = period === '7d'
        ? date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
        : period === '30d'
        ? date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
        : date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })

      const daySales = sales.filter(sale => {
        const saleDate = new Date(sale.createdAt)
        return saleDate.toDateString() === date.toDateString()
      })
      const revenue = daySales.reduce((sum, sale) => sum + sale.totalAmount, 0)
      return { day: label, revenue }
    }).filter((_, i) => {
      if (period === '30d') return i % 3 === 0
      if (period === '90d') return i % 7 === 0
      return true
    })
  }

  const revenueData = getRevenueData()
  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0)
  const lastValue = revenueData[revenueData.length - 1]?.revenue || 0
  const prevValue = revenueData[revenueData.length - 2]?.revenue || 0
  const percentChange = prevValue > 0 ? ((lastValue - prevValue) / prevValue * 100).toFixed(1) : 0

  // Inventory stats
  const lowStockItems = inventory.filter(inv => inv.quantity > 0 && inv.quantity <= inv.lowStockThreshold)
  const noStockItems = inventory.filter(inv => inv.quantity === 0)
  const totalInventoryValue = inventory.reduce((sum, inv) => sum + ((inv.product?.unitPrice || 0) * inv.quantity), 0)
  const totalItems = inventory.reduce((sum, inv) => sum + inv.quantity, 0)

  // Top products for bar chart
  const topProductsChart = (report?.topProducts || []).slice(0, 5).map(p => ({
    name: p.name.length > 10 ? p.name.substring(0, 10) + '...' : p.name,
    revenue: p.revenue,
    units: p.quantity,
  }))

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
        <p className="text-sm text-zinc-900">
          {new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </nav>

      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Welcome to XG Inventory System.</p>
        </div>

        

        {/* Summary Cards — no icons, clean */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Revenue', value: `₱${(report?.totalRevenue || 0).toLocaleString()}`, sub: `${report?.totalSales || 0} sales`, valueColor: '#159644' },
            { label: 'Net Profit', value: `₱${(report?.netProfit || 0).toLocaleString()}`, sub: 'After all costs', valueColor: isProfit ? '#159644' : '#dc2626' },
            { label: 'Inventory Value', value: `₱${totalInventoryValue.toLocaleString()}`, sub: `${totalItems} total units` },
            { label: 'Stock Alerts', 
            value: `${lowStockItems.length + noStockItems.length}`, 
            sub: `${noStockItems.length} out of stock`, 
            valueColor: (lowStockItems.length + noStockItems.length) > 0 ? '#dc2626' : '#16a34a', bgColor: (lowStockItems.length + noStockItems.length) > 0 ? '#fee2e2' : 'transparent' },
          ].map((card, i) => (
            <div key={i} className="border border-border/60 rounded-xl p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">{card.label}</p>
              <p className="text-2xl font-bold mb-1" style={{ color: card.valueColor || 'var(--foreground)' }}>{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Revenue Chart — 21st dev style */}
        <div className="border border-border/60 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                {period === '7d' ? 'Last 7 days' : period === '30d' ? 'Last 30 days' : 'Last 90 days'}
              </p>
              <div className="flex items-center gap-3">
                <p className="text-3xl font-bold">₱{totalRevenue.toLocaleString()}</p>
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${Number(percentChange) >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  <TrendingUp className="size-3" />
                  {Math.abs(Number(percentChange))}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Total revenue for selected period</p>
            </div>
            <div className="flex items-center gap-2">
              {['7d', '30d', '90d'].map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: period === p ? '#18181b' : 'transparent',
                    color: period === p ? '#fff' : 'var(--muted-foreground)',
                    border: '1px solid',
                    borderColor: period === p ? '#18181b' : 'var(--border)',
                  }}
                >
                  {p === '7d' ? '7 days' : p === '30d' ? '30 days' : '90 days'}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#000000" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#000000" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 12" stroke="var(--border)" strokeOpacity={0.6} horizontal={true} vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickMargin={12} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={v => `₱${v >= 1000 ? `${v/1000}K` : v}`} tickMargin={12} />
              <Tooltip content={<CustomRevenueTooltip />} cursor={{ stroke: '#353535', strokeWidth: 1 }} />
              <Area type="linear" dataKey="revenue" stroke="transparent" fill="url(#revenueGradient)" strokeWidth={0} dot={false} />
              <Line
                type="linear"
                dataKey="revenue"
                stroke="#292929"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#444444', stroke: 'white', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          
          {/* Top Products Bar Chart */}
          <div className="border border-border/60 rounded-xl p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-semibold">Top Products</h3>
              <button onClick={() => navigate('/reports')} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                See all <ArrowRight className="size-3" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Best selling by revenue</p>
            {topProductsChart.length === 0 ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-sm text-muted-foreground">No sales yet!</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topProductsChart} layout="vertical" margin={{ left: 0, right: 10 }}>
                  <CartesianGrid strokeDasharray="4 12" stroke="var(--border)" strokeOpacity={0.6} horizontal={false} vertical={true} />
                  <XAxis type="number" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} 
                  tickFormatter={v => `₱${v >= 1000 ? `${v/1000}K` : v}`} />

                  <YAxis dataKey="name" type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} 
                  width={80} />

                  <Tooltip formatter={v => [`₱${v.toLocaleString()}`, 'Revenue']} contentStyle={{ fontSize: 12, borderRadius: 8, background: '#3b3b3b', color: 'white', border: 'none' }} itemStyle={{ color: 'white' }} />
                  <Bar dataKey="revenue" fill="#4b4b4b" radius={[0, 4, 4, 0]}/>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Stock Alerts — main focus */}
          <div className="border border-border/60 rounded-xl p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-semibold">Stock Alerts</h3>
              <button onClick={() => navigate('/inventory')} className="text-xs text-gray-500 hover:text-foreground flex items-center gap-1">
                Go to Inventory <ArrowRight className="size-3" />
              </button>
            </div>
            <p className="text-xs text-gray-600 mb-4">Items that need your attention</p>

            {/* Stock summary pills */}
            <div className="flex gap-2 mb-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5  text-xs font-medium text-red-700">
                {noStockItems.length} Out of Stock
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5  text-xs font-medium text-yellow-600">
                {lowStockItems.length} Low Stock
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5  text-xs font-medium text-green-600">
                {inventory.length - lowStockItems.length - noStockItems.length} On Stock
              </div>
            </div>

            {noStockItems.length === 0 && lowStockItems.length === 0 ? (
              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: '#dbf1d8', border: '1px solid #529e85' }}>
                <span className="text-[#5bad84] text-sm font-medium">All stock levels are good!</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                
                {noStockItems.map(inv => (
                  <div key={inv._id} className="flex items-center justify-between p-2 rounded-lg" style={{ background: '#f9c7c6', border: '1px solid #c17b79' }}>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="size-4 text-red-700 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold font-medium text-red-600">{inv.product?.name}</p>
                        <p className="text-xs text-red-600">{inv.product?.sku}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-red-600 px-2 py-1 ">Out of Stock</span>
                  </div>
                ))}


                {lowStockItems.map(inv => (
                  <div key={inv._id} className="flex items-center justify-between p-2 rounded-lg" style={{ background: '#ffeebb', border: '1.5px solid #b48d0d' }}>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="size-4 text-[#b58200] flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-[#b58200]">{inv.product?.name}</p>
                        <p className="text-xs text-[#b58200]">{inv.product?.sku}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#b58200] 0 px-2 py-1">{inv.quantity} left</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Inventory Overview Table */}
        <div className="border border-border/60 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold">Inventory Overview</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Current stock levels across all products</p>
            </div>
            <button onClick={() => navigate('/inventory')} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              Manage Inventory <ArrowRight className="size-3" />
            </button>
          </div>
          {inventory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No inventory yet!</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="text-left py-2 font-medium text-muted-foreground">Product</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">SKU</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">Stock</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">Value</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.slice(0, 6).map((inv, index) => {
                  const isOut = inv.quantity === 0
                  const isLow = inv.quantity > 0 && inv.quantity <= inv.lowStockThreshold
                  const statusLabel = isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'
                  const statusColor = isOut ? 'text-red-700' : isLow ? 'text-yellow-700' : 'text-green-700'
                  const totalValue = (inv.product?.unitPrice || 0) * inv.quantity
                  return (
                    <tr key={inv._id} className={`border-b border-border/40 hover:bg-muted/30 transition-colors ${index % 2 === 0 ? '' : 'bg-muted/10'}`}>
                      <td className="py-3 font-medium">{inv.product?.name}</td>
                      <td className="py-3 font-mono text-xs text-muted-foreground">{inv.product?.sku}</td>
                      <td className="py-3 font-semibold">{inv.quantity} units</td>
                      <td className="py-3">₱{totalValue.toLocaleString()}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
          {inventory.length > 6 && (
            <button onClick={() => navigate('/inventory')} className="mt-3 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              View all {inventory.length} items <ArrowRight className="size-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard