import { useState } from 'react'
import Sidebar from './Sidebar'
 
function Layout({ children }) {
  const [isOpen, setIsOpen] = useState(true)
 
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main
        className="flex-1 transition-all duration-300 ease-in-out"
        style={{ marginLeft: isOpen ? '0px' : '68px' }}
      >
        {children}
      </main>
    </div>
  )
}
 
export default Layout