import React from 'react'
import { motion } from 'framer-motion'

export default function StatCard({title, value, hint, icon}){
  return (
    <motion.div initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className="text-2xl font-semibold">{value}</div>
        </div>
        {icon && <div className="text-3xl text-primary">{icon}</div>}
      </div>
      {hint && <div className="text-xs text-gray-400 mt-2">{hint}</div>}
    </motion.div>
  )
}
