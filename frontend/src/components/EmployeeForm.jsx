import { useState } from 'react'
import { DEPARTMENTS, CURRENCIES, EMP_TYPES } from '../lib/utils'

const REQUIRED = ['first_name', 'last_name', 'email', 'job_title', 'department', 'country', 'salary', 'hire_date']

function validate(d) {
  const errs = {}
  REQUIRED.forEach(k => { if (!d[k] || d[k] === '') errs[k] = 'Required' })
  if (d.email && !/\S+@\S+\.\S+/.test(d.email)) errs.email = 'Invalid email'
  if (d.salary && Number(d.salary) <= 0)          errs.salary = 'Must be > 0'
  return errs
}

const DEFAULTS = { currency: 'USD', employment_type: 'Full-time' }

export function EmployeeForm({ initial = {}, onSubmit, onCancel, loading, apiError }) {
  const [values, setValues]  = useState({ ...DEFAULTS, ...initial })
  const [errors, setErrors]  = useState({})

  function set(k, v) { setValues(p => ({ ...p, [k]: v })) }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(values)
    setErrors(errs)
    if (Object.keys(errs).length) return
    onSubmit(values)
  }

  function field(key, label, type = 'text', opts = {}) {
    return (
      <div className="field">
        <label>{label}{REQUIRED.includes(key) ? ' *' : ''}</label>
        <input
          className={`input${errors[key] ? ' has-error' : ''}`}
          type={type}
          value={values[key] || ''}
          onChange={e => set(key, e.target.value)}
          {...opts}
        />
        {errors[key] && <div className="field-error">{errors[key]}</div>}
      </div>
    )
  }

  function select(key, label, options) {
    return (
      <div className="field">
        <label>{label}{REQUIRED.includes(key) ? ' *' : ''}</label>
        <select
          className={`input${errors[key] ? ' has-error' : ''}`}
          value={values[key] || ''}
          onChange={e => set(key, e.target.value)}
        >
          <option value="">Select…</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        {errors[key] && <div className="field-error">{errors[key]}</div>}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {apiError && <div className="error-banner">{apiError}</div>}

      <div className="form-grid">
        <div className="form-row-2">
          {field('first_name', 'First Name')}
          {field('last_name',  'Last Name')}
        </div>
        <div className="form-row-2">
          {field('email', 'Email', 'email')}
          {field('phone', 'Phone')}
        </div>
        <div className="form-row-2">
          {field('job_title', 'Job Title')}
          {select('department', 'Department', DEPARTMENTS)}
        </div>
        <div className="form-row-2">
          {field('country', 'Country')}
          {field('city',    'City')}
        </div>
        <div className="form-row-3">
          {field('salary', 'Salary', 'number', { min: 1, step: '0.01' })}
          {select('currency',        'Currency',        CURRENCIES)}
          {select('employment_type', 'Employment Type', EMP_TYPES)}
        </div>
        {field('hire_date', 'Hire Date', 'date')}
      </div>

      <div className="modal-footer" style={{ padding: '14px 0 0' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : initial.id ? 'Save Changes' : 'Add Employee'}
        </button>
      </div>
    </form>
  )
}