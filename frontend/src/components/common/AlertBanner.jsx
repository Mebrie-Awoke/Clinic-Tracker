import React from 'react'

export default function AlertBanner({children, type='info'}){
  const colors = {
    info: 'bg-blue-50 text-primary',
    warn: 'bg-yellow-50 text-yellow-700',
    danger: 'bg-red-50 text-red-700'
  }
  return (
    <div className={`p-3 rounded-md ${colors[type]}`}>
      {children}
    </div>
  )
}
