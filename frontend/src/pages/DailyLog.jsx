import React, { useState } from 'react'
import { useDailyLogs } from '../hooks/useClinicData'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatCurrency } from '../utils/formatters'
import { format } from 'date-fns'

export default function DailyLog(){
  const {data, isLoading, error, add, remove} = useDailyLogs()
  const [form, setForm] = useState({date: format(new Date(), 'yyyy-MM-dd'), patients:0, revenue:0, expenses:0, notes:'', diseases:[]})
  const [diseaseInput, setDiseaseInput] = useState('')

  const profit = form.revenue - form.expenses

  const submit = async (e)=>{
    e.preventDefault()
    try{
      await add.mutateAsync(form)
      setForm({date: format(new Date(), 'yyyy-MM-dd'), patients:0, revenue:0, expenses:0, notes:'', diseases:[]})
    }catch(err){
      alert(err.message)
    }
  }

  if(isLoading) return <LoadingSpinner />
  if(error) return <div className="text-red-600">{error.message}</div>

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">Date</label>
            <input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} className="mt-1 w-full rounded-md p-2 bg-gray-50 dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm">Patients</label>
            <input type="number" value={form.patients} onChange={e=>setForm({...form, patients: Number(e.target.value)})} className="mt-1 w-full rounded-md p-2 bg-gray-50 dark:bg-gray-700" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm">Revenue</label>
            <input type="number" value={form.revenue} onChange={e=>setForm({...form, revenue: Number(e.target.value)})} className="mt-1 w-full rounded-md p-2 bg-gray-50 dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm">Expenses</label>
            <input type="number" value={form.expenses} onChange={e=>setForm({...form, expenses: Number(e.target.value)})} className="mt-1 w-full rounded-md p-2 bg-gray-50 dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm">Profit</label>
            <div className="mt-1 w-full rounded-md p-2 bg-gray-50 dark:bg-gray-700">{formatCurrency(profit)}</div>
          </div>
        </div>

        <div>
          <label className="block text-sm">Diseases</label>
          <div className="flex gap-2 mt-2">
            <input placeholder="Disease" value={diseaseInput} onChange={e=>setDiseaseInput(e.target.value)} className="flex-1 rounded-md p-2 bg-gray-50 dark:bg-gray-700" />
            <button type="button" onClick={()=>{ if(diseaseInput.trim()){ setForm({...form, diseases:[...form.diseases, diseaseInput.trim()]}); setDiseaseInput('') }}} className="px-3 py-2 bg-primary text-white rounded-md">Add</button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {form.diseases.map((d, idx)=> (
              <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center gap-2">
                {d}
                <button type="button" onClick={()=>setForm({...form, diseases: form.diseases.filter((_,i)=>i!==idx)})} className="text-xs text-red-500">x</button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm">Notes</label>
          <textarea value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} className="mt-1 w-full rounded-md p-2 bg-gray-50 dark:bg-gray-700" />
        </div>

        <div className="flex justify-end">
          <button type="submit" className="px-4 py-2 bg-secondary text-white rounded-md">Save Log</button>
        </div>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 className="text-sm text-gray-500 mb-2">Recent Logs</h3>
        <table className="w-full text-sm">
          <thead className="text-left text-gray-400">
            <tr><th>Date</th><th>Patients</th><th>Revenue</th><th>Expenses</th><th>Profit</th><th></th></tr>
          </thead>
          <tbody>
            {(data || []).map(l=> (
              <tr key={l.id} className="border-t">
                <td>{l.date}</td>
                <td>{l.patients}</td>
                <td>{formatCurrency(l.revenue)}</td>
                <td>{formatCurrency(l.expenses)}</td>
                <td>{formatCurrency(l.revenue - l.expenses)}</td>
                <td><button onClick={()=>remove.mutate(l.id)} className="text-red-600">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
