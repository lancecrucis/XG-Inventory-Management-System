import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  ClipboardList,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react'
import logo from '../assets/xgLogo.png'
 
const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Products', icon: Package, path: '/products' },
  { label: 'Suppliers', icon: Truck, path: '/suppliers' },
  { label: 'Customers', icon: Users, path: '/customers' },
  { label: 'User Logs', icon: ClipboardList, path: '/logs' },
]
 
function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
 
  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/'
  }
 
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
 
      {/* Sidebar */}
      <aside
        className="fixed top-0 left-0 h-screen z-30 flex flex-col transition-all duration-300 ease-in-out"
        style={{
          width: isOpen ? '260px' : '68px',
          background: '#111111',
          borderRight: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Logo area */}
        <div className="flex items-center px-4 py-5 border-b border-white/8"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', minHeight: '68px' }}
        >
          <img src={logo} alt="XG Logo" className="size-8 object-contain flex-shrink-0" />
          {isOpen && (
            <div className="ml-3 overflow-hidden">
              <p className="text-white text-sm font-semibold leading-none whitespace-nowrap">XG Inventory</p>
              <p className="text-white/40 text-xs mt-1 whitespace-nowrap">Your Xtra ordinary Global Partner</p>
            </div>
          )}
        </div>
 
        {/* Toggle button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-3 top-16 size-6 rounded-full flex items-center justify-center transition-colors z-40"
          style={{ background: '#333', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          {isOpen
            ? <ChevronLeft className="size-3 text-white/60" />
            : <ChevronRight className="size-3 text-white/60" />
          }
        </button>
 
        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.color = '#ffffff'
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = isActive ? '#ffffff' : 'rgba(255,255,255,0.5)'
                }}
              >
                <Icon className="size-4 flex-shrink-0" />
                {isOpen && (
                  <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                )}
                {isActive && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ background: '#E8D754' }}
                  />
                )}
                {/* Tooltip when collapsed */}
                {!isOpen && (
                  <div className="absolute left-full ml-3 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                    style={{ background: '#333', color: '#fff' }}
                  >
                    {item.label}
                  </div>
                )}
              </button>
            )
          })}
        </nav>
 
        {/* Logout */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(179, 179, 179, 0.1)'
              e.currentTarget.style.color = '#ffffff'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
            }}
          >
            <LogOut className="size-4 flex-shrink-0" />
            {isOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>
 
      {/* Main content offset */}
      <div style={{ marginLeft: isOpen ? '240px' : '68px', transition: 'margin-left 0.3s ease-in-out' }} />
    </>
  )
}
 
export default Sidebar