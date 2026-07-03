import React, { useState } from 'react'
import { useInventory } from '../hooks/useClinicData'
import LoadingSpinner from '../components/common/LoadingSpinner'

function ExportCSV({items}){
  const exportCsv = ()=>{
    const rows = [['Drug','Stock','Reorder Level']]
    items.forEach(i=>rows.push([i.name, i.stock, i.reorder_level]))
    const csv = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], {type:'text/csv'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inventory.csv'
    a.click()
    URL.revokeObjectURL(url)
  }
  return <button onClick={exportCsv} className="px-3 py-2 bg-primary text-white rounded-md">Export CSV</button>
}

export default function Inventory(){
  const {data, isLoading, error, add, update, remove} = useInventory()
  const [q, setQ] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({name:'', stock:0, reorder_level:0})

  if(isLoading) return <LoadingSpinner />
  if(error) return <div className="text-red-600">{error.message}</div>

  const items = (data||[]).filter(i=>i.name.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} className="rounded-md p-2 bg-gray-50 dark:bg-gray-700" />
          <button onClick={()=>setModalOpen(true)} className="px-3 py-2 bg-secondary text-white rounded-md">Add Drug</button>
        </div>
        <ExportCSV items={data||[]} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-400">
            <tr><th>Name</th><th>Stock</th><th>Reorder</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {items.map(i=>{
              const status = i.stock <= 0 ? 'Critical' : (i.stock <= i.reorder_level ? 'Low' : 'Good')
              const badge = status === 'Good' ? 'bg-green-100 text-green-700' : status === 'Low' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
              return (
                <tr key={i.id} className="border-t">
                  <td>{i.name}</td>
                  <td>{i.stock}</td>
                  <td>{i.reorder_level}</td>
                  <td><span className={`px-2 py-1 rounded-md text-xs ${badge}`}>{status}</span></td>
                  <td className="flex gap-2">
                    <button onClick={()=>update.mutate({id:i.id, delta:1})} className="px-2 py-1 bg-gray-100 rounded-md">+1</button>
                    <button onClick={()=>update.mutate({id:i.id, delta:-1})} className="px-2 py-1 bg-gray-100 rounded-md">-1</button>
                    <button onClick={()=>remove.mutate(i.id)} className="px-2 py-1 text-red-600">Delete</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-md">
            <h3 className="mb-3">Add Drug</h3>
            <div className="grid gap-2">
              <input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="p-2 rounded-md bg-gray-50 dark:bg-gray-700" />
              <input type="number" placeholder="Stock" value={form.stock} onChange={e=>setForm({...form, stock: Number(e.target.value)})} className="p-2 rounded-md bg-gray-50 dark:bg-gray-700" />
              <input type="number" placeholder="Reorder Level" value={form.reorder_level} onChange={e=>setForm({...form, reorder_level: Number(e.target.value)})} className="p-2 rounded-md bg-gray-50 dark:bg-gray-700" />
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={()=>setModalOpen(false)} className="px-3 py-2">Cancel</button>
                <button onClick={async ()=>{ try{ await add.mutateAsync(form); setModalOpen(false); setForm({name:'', stock:0, reorder_level:0}) }catch(err){alert(err.message)} }} className="px-3 py-2 bg-primary text-white rounded-md">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
