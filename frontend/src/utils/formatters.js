export const formatCurrency = (v) => {
  if (v == null) return '—'
  return new Intl.NumberFormat('en-US', {style:'currency', currency:'USD', maximumFractionDigits:0}).format(v)
}

export const shortDate = (s) => new Date(s).toLocaleDateString('en-ET')
