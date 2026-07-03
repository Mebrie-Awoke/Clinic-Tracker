import React from 'react'

export default function LoadingSpinner(){
  return (
    <div className="flex items-center justify-center p-6">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  )
}
