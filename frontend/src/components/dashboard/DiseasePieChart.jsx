import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const COLORS = ['#2563eb', '#0d9488', '#f59e0b', '#ef4444', '#7c3aed']

export default function DiseasePieChart({data}){
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-sm text-gray-500 mb-2">Top Diseases</h3>
      <div style={{width:'100%', height:220}}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} fill="#8884d8">
              {data.map((entry, index)=> <Cell key={index} fill={COLORS[index%COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
