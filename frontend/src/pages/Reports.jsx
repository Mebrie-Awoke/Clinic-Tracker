import React, { useState } from 'react'
import { useDailyLogs } from '../hooks/useClinicData'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { format } from 'date-fns'

export default function Reports(){
  const {data, isLoading, error} = useDailyLogs()
  const [from, setFrom] = useState(format(new Date(Date.now() - 1000*60*60*24*30),'yyyy-MM-dd'))
  const [to, setTo] = useState(format(new Date(),'yyyy-MM-dd'))

  if(isLoading) return <LoadingSpinner />
  if(error) return <div className="text-red-600">{error.message}</div>

  const filtered = (data||[]).filter(d=>d.date >= from && d.date <= to)

  const exportJson = (type)=>{
    // simple export
    const payload = JSON.stringify(filtered, null, 2)
    const blob = new Blob([payload], {type: type==='pdf' ? 'application/pdf' : 'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reports.${type==='pdf'?'pdf':'json'}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center gap-3">
        <label className="text-sm">From</label>
        <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md" />
        <label className="text-sm">To</label>
        <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md" />
        <div className="flex-1" />
        <button onClick={()=>exportJson('json')} className="px-3 py-2 bg-primary text-white rounded-md">Download JSON</button>
        <button onClick={()=>exportJson('pdf')} className="px-3 py-2 bg-secondary text-white rounded-md">Download PDF</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">Summary card 1</div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">Summary card 2</div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">Summary card 3</div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-400"><tr><th>Date</th><th>Patients</th><th>Revenue</th><th>Expenses</th></tr></thead>
          <tbody>
            {filtered.map(r=> (
              <tr key={r.id} className="border-t"><td>{r.date}</td><td>{r.patients}</td><td>{r.revenue}</td><td>{r.expenses}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
