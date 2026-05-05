export function fmt$(n, compact = false) {
  if (n == null) return '—'
  if (compact && n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (compact && n >= 1_000)     return `$${Math.round(n / 1_000)}k`
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export function fmtNum(n) {
  return new Intl.NumberFormat('en-US').format(n)
}

export function fmtDate(s) {
  if (!s) return '—'
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(s))
}

export const EMP_TYPE_BADGE = {
  'Full-time': 'badge-green',
  'Part-time':  'badge-yellow',
  'Contract':   'badge-blue',
  'Intern':     'badge-gray',
}

export const DEPARTMENTS = [
  'Engineering','Product','Design','Sales','Marketing',
  'HR','Finance','Operations','Data Science','Legal',
]

export const CURRENCIES = ['USD','EUR','GBP','INR','CAD','AUD','SGD','JPY']
export const EMP_TYPES  = ['Full-time','Part-time','Contract','Intern']