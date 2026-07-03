import { useQuery, useMutation, useQueryClient } from 'react-query'
import * as api from '../api/client'

export function useDashboard(){
  return useQuery('dashboardSummary', api.getDashboardSummary, {staleTime: 1000 * 60 * 5})
}

export function useMonthlyTrends(){
  return useQuery('monthlyTrends', api.getMonthlyTrends)
}

export function useDailyLogs(){
  const qc = useQueryClient()
  const q = useQuery('dailyLogs', api.getDailyLogs)
  const add = useMutation(api.postDailyLog, {onSuccess: ()=>qc.invalidateQueries('dailyLogs')})
  const remove = useMutation(api.deleteDailyLog, {onSuccess: ()=>qc.invalidateQueries('dailyLogs')})
  return {...q, add, remove}
}

export function useInventory(){
  const qc = useQueryClient()
  const q = useQuery('inventory', api.getInventory)
  const add = useMutation(api.postInventory, {onSuccess: ()=>qc.invalidateQueries('inventory')})
  const update = useMutation(({id, delta})=>api.putInventoryDelta(id, delta), {onSuccess: ()=>qc.invalidateQueries('inventory')})
  const remove = useMutation(api.deleteInventory, {onSuccess: ()=>qc.invalidateQueries('inventory')})
  return {...q, add, update, remove}
}
