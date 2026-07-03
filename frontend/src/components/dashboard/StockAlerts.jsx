import React from 'react'

export default function StockAlerts({items}){
  if(!items || items.length===0) return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">No stock alerts</div>
  )
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-sm text-gray-500 mb-2">Critical Stock Alerts</h3>
      <ul>
        {items.map(i=> (
          <li key={i.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
            <div>
              <div className="font-medium">{i.name}</div>
              <div className="text-xs text-gray-400">Stock: {i.stock}</div>
            </div>
            <div className="text-red-600">Reorder</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
