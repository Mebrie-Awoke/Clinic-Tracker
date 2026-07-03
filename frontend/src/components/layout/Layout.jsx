import React from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout({children, dark, setDark}){
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header dark={dark} setDark={setDark} />
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
