import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, LineChart } from 'recharts'

export function RevenueBar({data}){
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-sm text-gray-500 mb-2">Revenue vs Expenses</h3>
      <div style={{width:'100%', height:240}}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#2563eb" />
            <Bar dataKey="expenses" fill="#0d9488" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function ProfitLine({data}){
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mt-4 md:mt-0">
      <h3 className="text-sm text-gray-500 mb-2">Profit Trend</h3>
      <div style={{width:'100%', height:240}}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="profit" stroke="#2563eb" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
