import { Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar }      from './components/Sidebar'
import { ToastProvider } from './components/Toast'
import Employees from './pages/Employees'
import Insights  from './pages/Insights'

export default function App() {
  return (
    <ToastProvider>
      <div className="layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/"           element={<Navigate to="/employees" replace />} />
            <Route path="/employees"  element={<Employees />} />
            <Route path="/insights"   element={<Insights />} />
          </Routes>
        </main>
      </div>
    </ToastProvider>
  )
}