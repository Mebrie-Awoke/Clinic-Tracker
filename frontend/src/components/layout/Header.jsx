import React from 'react'
import { Sun, Moon, Search } from 'lucide-react'

export default function Header({dark, setDark}){
  return (
    <header className="h-16 bg-white dark:bg-gray-800 shadow-sm flex items-center px-4 md:px-6">
      <div className="flex-1 flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search" className="pl-10 pr-3 py-2 rounded-md border bg-gray-50 dark:bg-gray-700 border-transparent focus:border-primary focus:ring focus:ring-primary/20" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={()=>setDark(!dark)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
          {dark? <Sun />: <Moon />}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">A</div>
          <div className="hidden md:block text-sm">Admin</div>
        </div>
      </div>
    </header>
  )
}
