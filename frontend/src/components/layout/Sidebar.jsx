import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, FileText, Archive, BarChart2 } from 'lucide-react'

const links = [
  {to: '/', label: 'Dashboard', icon: Home},
  {to: '/daily-logs', label: 'Daily Logs', icon: FileText},
  {to: '/inventory', label: 'Inventory', icon: Archive},
  {to: '/reports', label: 'Reports', icon: BarChart2},
]

export default function Sidebar(){
  return (
    <aside className="w-16 md:w-64 bg-white dark:bg-gray-800 shadow-md">
      <div className="h-16 flex items-center justify-center md:justify-start px-3 font-semibold text-primary">Wereda</div>
      <nav className="mt-4">
        {links.map(l=>{
          const Icon = l.icon
          return (
            <NavLink key={l.to} to={l.to} className={({isActive})=>`flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${isActive? 'bg-gray-100 dark:bg-gray-700':''}`}>
              <Icon />
              <span className="hidden md:inline">{l.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
