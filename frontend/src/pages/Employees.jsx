import { useState, useEffect, useCallback } from 'react'
import { listEmployees, deleteEmployee, getCountries, getDepartments } from '../lib/api'
import { fmt$, fmtDate, fmtNum, EMP_TYPE_BADGE } from '../lib/utils'
import { useDebounce } from '../hooks/useDebounce'
import { EmployeeModal } from '../components/EmployeeModal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { SkeletonRows } from '../components/SkeletonRows'
import { useToast } from '../components/Toast'

const PER_PAGE = 50

const SORT_COLS = [
  { key: 'last_name',  label: 'Employee' },
  { key: 'job_title',  label: 'Role'     },
  { key: 'country',    label: 'Country'  },
  { key: 'salary',     label: 'Salary'   },
  { key: 'hire_date',  label: 'Hire Date'},
]

export default function Employees() {
  const toast = useToast()

  // ── Data ───────────────────────────────────────────────────────────────────
  const [rows,       setRows]       = useState([])
  const [meta,       setMeta]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [countries,  setCountries]  = useState([])
  const [departments,setDepartments]= useState([])

  // ── Filters / sort / page ──────────────────────────────────────────────────
  const [search,  setSearch]  = useState('')
  const [country, setCountry] = useState('')
  const [dept,    setDept]    = useState('')
  const [type,    setType]    = useState('')
  const [sortBy,  setSortBy]  = useState('last_name')
  const [sortDir, setSortDir] = useState('asc')
  const [page,    setPage]    = useState(1)

  const dSearch = useDebounce(search, 300)

  // ── Modal / confirm state ──────────────────────────────────────────────────
  const [modalOpen,    setModalOpen]    = useState(false)
  const [editEmployee, setEditEmployee] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,     setDeleting]     = useState(false)

  // ── Fetch employees ────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: PER_PAGE, sort_by: sortBy, sort_dir: sortDir }
      if (dSearch) params.search     = dSearch
      if (country) params.country    = country
      if (dept)    params.department = dept
      if (type)    params.employment_type = type

      const res = await listEmployees(params)
      setRows(res.data)
      setMeta(res.meta)
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [page, sortBy, sortDir, dSearch, country, dept, type]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load() }, [load])

  // ── Load meta for dropdowns ────────────────────────────────────────────────
  useEffect(() => {
    getCountries().then(r => setCountries(r.data)).catch(() => {})
    getDepartments().then(r => setDepartments(r.data)).catch(() => {})
  }, [])

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [dSearch, country, dept, type, sortBy, sortDir])

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleSort(col) {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('asc') }
  }

  function openCreate() { setEditEmployee(null); setModalOpen(true) }
  function openEdit(emp){ setEditEmployee(emp);  setModalOpen(true) }

  function clearFilters() {
    setSearch(''); setCountry(''); setDept(''); setType('')
  }

  const hasFilter = search || country || dept || type

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteEmployee(deleteTarget.id)
      toast(`${deleteTarget.full_name} deactivated`)
      setDeleteTarget(null)
      load()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Employees</h1>
          <div className="sub">
            {meta ? `${fmtNum(meta.total_count)} total employees` : 'Loading…'}
          </div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <PlusIcon /> Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="search-box">
          <SearchIcon />
          <input
            className="input"
            placeholder="Search name, email, title…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select className="input" style={{ width: 155 }} value={country} onChange={e => setCountry(e.target.value)}>
          <option value="">All Countries</option>
          {countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select className="input" style={{ width: 155 }} value={dept} onChange={e => setDept(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select className="input" style={{ width: 130 }} value={type} onChange={e => setType(e.target.value)}>
          <option value="">All Types</option>
          <option>Full-time</option>
          <option>Part-time</option>
          <option>Contract</option>
          <option>Intern</option>
        </select>

        {hasFilter && (
          <button className="btn btn-ghost" onClick={clearFilters}>Clear</button>
        )}
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {SORT_COLS.map(({ key, label }) => (
                  <th
                    key={key}
                    className="sortable"
                    onClick={() => handleSort(key)}
                  >
                    {label}
                    <span style={{ marginLeft: 4, opacity: sortBy === key ? 1 : 0.3, color: sortBy === key ? 'var(--accent)' : undefined }}>
                      {sortBy === key ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </th>
                ))}
                <th>Type</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows cols={7} rows={8} />
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty">
                      <div className="icon">👤</div>
                      <p>No employees found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map(emp => (
                  <tr key={emp.id}>
                    <td>
                      <div className="cell-main">{emp.full_name}</div>
                      <div className="cell-sub">{emp.email}</div>
                    </td>
                    <td>
                      <div>{emp.job_title}</div>
                      <div className="cell-sub">{emp.department}</div>
                    </td>
                    <td>{emp.country}</td>
                    <td className="cell-mono">{fmt$(emp.salary)}</td>
                    <td>{fmtDate(emp.hire_date)}</td>
                    <td>
                      <span className={`badge ${EMP_TYPE_BADGE[emp.employment_type] || 'badge-gray'}`}>
                        {emp.employment_type}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-ghost btn-icon"
                          title="Edit"
                          onClick={() => openEdit(emp)}
                        >
                          <EditIcon />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon"
                          title="Deactivate"
                          style={{ color: 'var(--text-3)' }}
                          onClick={() => setDeleteTarget(emp)}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.total_pages > 1 && (
          <div className="pagination">
            <span>
              {fmtNum((meta.page - 1) * meta.per_page + 1)}–{fmtNum(Math.min(meta.page * meta.per_page, meta.total_count))} of {fmtNum(meta.total_count)}
            </span>
            <div className="page-controls">
              <button
                className="btn btn-secondary"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >← Prev</button>
              <span className="page-label">{meta.page} / {meta.total_pages}</span>
              <button
                className="btn btn-secondary"
                disabled={page >= meta.total_pages}
                onClick={() => setPage(p => p + 1)}
              >Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <EmployeeModal
        open={modalOpen}
        employee={editEmployee}
        onClose={() => setModalOpen(false)}
        onSaved={load}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Deactivate Employee"
        description={`This will deactivate ${deleteTarget?.full_name}. Their record is preserved for reporting.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  )
}

// ── Icons ──────────────────────────────────────────────────────────────────────
function PlusIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
}
function SearchIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}
function EditIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
}
function TrashIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
}