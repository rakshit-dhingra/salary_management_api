import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts'
import {
  getSalaryByCountry, getSalaryByJobTitle, getDepartmentBreakdown,
  getHeadcountByCountry, getSalaryDistribution, getTopEarners, getCountries,
} from '../lib/api'
import { fmt$, fmtNum } from '../lib/utils'

const COLORS = ['#f59e0b','#3b82f6','#10b981','#8b5cf6','#ef4444','#06b6d4','#ec4899','#f97316','#84cc16','#a855f7']

// ── Tooltip ───────────────────────────────────────────────────────────────────
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 7, padding: '8px 12px', fontSize: 12 }}>
      <div style={{ color: 'var(--text-2)', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || 'var(--accent)', fontWeight: 500 }}>
          {p.name}: {p.name?.toLowerCase().includes('salary') || p.name?.toLowerCase().includes('sal')
            ? fmt$(p.value)
            : fmtNum(p.value)}
        </div>
      ))}
    </div>
  )
}

// ── KPI card ──────────────────────────────────────────────────────────────────
function KPI({ label, value, sub }) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value || '—'}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  )
}

export default function Insights() {
  const [country, setCountry]    = useState('')
  const [countries, setCountries]= useState([])

  const [countryStats,  setCountryStats]  = useState([])
  const [jobStats,      setJobStats]      = useState([])
  const [deptStats,     setDeptStats]     = useState([])
  const [headcount,     setHeadcount]     = useState([])
  const [distribution,  setDistribution]  = useState([])
  const [topEarners,    setTopEarners]    = useState([])

  // Load static data once
  useEffect(() => {
    getCountries().then(r => setCountries(r.data)).catch(() => {})
    getSalaryByCountry().then(r => setCountryStats(r.data)).catch(() => {})
    getDepartmentBreakdown().then(r => setDeptStats(r.data)).catch(() => {})
    getHeadcountByCountry().then(r => setHeadcount(r.data)).catch(() => {})
    getTopEarners(10).then(r => setTopEarners(r.data)).catch(() => {})
  }, [])

  // Reload when country filter changes
  useEffect(() => {
    getSalaryByJobTitle(country).then(r => setJobStats(r.data)).catch(() => {})
    getSalaryDistribution(country).then(r => setDistribution(r.data)).catch(() => {})
  }, [country])

  // ── KPIs ────────────────────────────────────────────────────────────────────
  const totalEmp     = headcount.reduce((s, r) => s + r.employee_count, 0)
  const globalAvg    = countryStats.length
    ? countryStats.reduce((s, r) => s + r.avg_salary * r.employee_count, 0) / (totalEmp || 1)
    : 0
  const topCountry   = headcount[0]
  const highestAvg   = [...countryStats].sort((a, b) => b.avg_salary - a.avg_salary)[0]

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Salary Insights</h1>
          <div className="sub">Analytics across your workforce</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Country:</span>
          <select
            className="input"
            style={{ width: 175 }}
            value={country}
            onChange={e => setCountry(e.target.value)}
          >
            <option value="">All Countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <KPI label="Total Employees"  value={fmtNum(totalEmp)} />
        <KPI label="Global Avg Salary" value={fmt$(globalAvg, true)} sub="across all countries" />
        <KPI label="Largest Office"    value={topCountry?.country} sub={topCountry ? `${fmtNum(topCountry.employee_count)} employees` : ''} />
        <KPI label="Highest Avg Pay"   value={fmt$(highestAvg?.avg_salary, true)} sub={highestAvg?.country} />
      </div>

      {/* Row 1: Country table + Distribution */}
      <div className="charts-grid" style={{ marginBottom: 14 }}>

        {/* Country salary table */}
        <div className="chart-box">
          <h3>Salary by Country</h3>
          <div style={{ overflowY: 'auto', maxHeight: 280 }}>
            <table className="country-tbl">
              <thead>
                <tr>
                  <th>Country</th>
                  <th>Min</th>
                  <th>Avg</th>
                  <th>Max</th>
                  <th>P50</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {countryStats.map(r => (
                  <tr key={r.country}>
                    <td>{r.country}</td>
                    <td>{fmt$(r.min_salary, true)}</td>
                    <td className="avg">{fmt$(r.avg_salary, true)}</td>
                    <td>{fmt$(r.max_salary, true)}</td>
                    <td>{fmt$(r.p50_salary, true)}</td>
                    <td>{fmtNum(r.employee_count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Salary Distribution histogram */}
        <div className="chart-box">
          <h3>Salary Distribution{country ? ` — ${country}` : ''}</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={distribution} margin={{ top: 0, right: 0, left: -20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="bucket_label"
                tick={{ fontSize: 9, fill: 'var(--text-3)' }}
                angle={-35}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-3)' }} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="count" name="Employees" fill="var(--accent)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Job title bar + Dept pie */}
      <div className="charts-grid" style={{ marginBottom: 14 }}>

        {/* Avg salary by job title */}
        <div className="chart-box">
          <h3>Avg Salary by Job Title{country ? ` — ${country}` : ''}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={jobStats.slice(0, 12)}
              layout="vertical"
              margin={{ top: 0, right: 8, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: 'var(--text-3)' }}
                tickFormatter={v => `$${Math.round(v / 1000)}k`}
              />
              <YAxis
                type="category"
                dataKey="job_title"
                tick={{ fontSize: 10, fill: 'var(--text-2)' }}
                width={135}
              />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="avg_salary" name="Avg Salary" radius={[0, 3, 3, 0]}>
                {jobStats.slice(0, 12).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department donut */}
        <div className="chart-box">
          <h3>Headcount by Department</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={deptStats}
                dataKey="employee_count"
                nameKey="department"
                cx="45%" cy="50%"
                outerRadius={100} innerRadius={52}
                paddingAngle={2}
              >
                {deptStats.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={v => <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Earners */}
      <div className="chart-box">
        <h3 style={{ marginBottom: 12 }}>🏆 Top 10 Earners</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          {topEarners.map((emp, i) => (
            <div key={emp.id} className="top-earner">
              <span className="earner-rank">{i + 1}</span>
              <div className="earner-info">
                <div className="earner-name">{emp.full_name}</div>
                <div className="earner-role">{emp.job_title} · {emp.country}</div>
              </div>
              <span className="earner-sal">{fmt$(emp.salary, true)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}