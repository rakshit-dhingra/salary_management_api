const BASE = '/api/v1'

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const json = await res.json()
  if (!res.ok) {
    const msg = json.errors?.join(', ') || json.error || 'Request failed'
    throw new Error(msg)
  }
  return json
}

// ── Employees ─────────────────────────────────────────────────────────────────
export const listEmployees   = (params = {}) => req('GET', '/employees?' + new URLSearchParams(params))
export const getEmployee     = (id)           => req('GET', `/employees/${id}`)
export const createEmployee  = (data)         => req('POST', '/employees', { employee: data })
export const updateEmployee  = (id, data)     => req('PUT', `/employees/${id}`, { employee: data })
export const deleteEmployee  = (id)           => req('DELETE', `/employees/${id}`)

// ── Insights ──────────────────────────────────────────────────────────────────
export const getSalaryByCountry    = ()        => req('GET', '/insights/salary_by_country')
export const getSalaryByJobTitle   = (country) => req('GET', '/insights/salary_by_job_title' + (country ? `?country=${encodeURIComponent(country)}` : ''))
export const getDepartmentBreakdown= ()        => req('GET', '/insights/department_breakdown')
export const getHeadcountByCountry = ()        => req('GET', '/insights/headcount_by_country')
export const getSalaryDistribution = (country) => req('GET', '/insights/salary_distribution'  + (country ? `?country=${encodeURIComponent(country)}` : ''))
export const getTopEarners         = (n = 10)  => req('GET', `/insights/top_earners?limit=${n}`)

// ── Meta ──────────────────────────────────────────────────────────────────────
export const getCountries   = () => req('GET', '/meta/countries')
export const getDepartments = () => req('GET', '/meta/departments')