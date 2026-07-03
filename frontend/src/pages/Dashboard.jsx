import React, { useEffect } from 'react'
import { useDashboard, useMonthlyTrends } from '../hooks/useClinicData'
import StatCard from '../components/common/StatCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { RevenueBar, ProfitLine } from '../components/dashboard/RevenueChart'
import DiseasePieChart from '../components/dashboard/DiseasePieChart'
import StockAlerts from '../components/dashboard/StockAlerts'
import { formatCurrency } from '../utils/formatters'

export default function Dashboard(){
  const {data, isLoading, error, refetch} = useDashboard()
  const trends = useMonthlyTrends()

  useEffect(()=>{
    const id = setInterval(()=>refetch(), 1000*60*5)
    return ()=>clearInterval(id)
  },[refetch])

  if(isLoading) return <LoadingSpinner />
  if(error) return <div className="text-red-600">{error.message}</div>

  const summary = data || {total_patients:0, revenue:0, profit:0, alerts:0}
  const monthly = trends.data || []
  const topDiseases = (data.top_diseases || []).map(d=>({name:d.name, value:d.count}))
  const critical = data.critical_stock || []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title={`Total Patients\nእንኳን ደህና መጡ`} value={summary.total_patients} />
        <StatCard title="Revenue" value={formatCurrency(summary.revenue)} />
        <StatCard title="Profit" value={formatCurrency(summary.profit)} />
        <StatCard title="Active Alerts" value={summary.alerts} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RevenueBar data={monthly} />
        <ProfitLine data={monthly} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <DiseasePieChart data={topDiseases} />
        </div>
        <div className="md:col-span-1">
          <StockAlerts items={critical} />
        </div>
        <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-sm text-gray-500 mb-2">Recent Activity</h3>
          <ul>
            {(data.recent_activity||[]).map((a,i)=> (
              <li key={i} className="py-2 border-b last:border-b-0">
                <div className="text-sm">{a.message}</div>
                <div className="text-xs text-gray-400">{a.time}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
