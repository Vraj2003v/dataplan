import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import PlansPage from './pages/PlansPage'
import { CarrierPage } from './pages/CarrierPage'
import SearchPage from './pages/SearchPage'
import ComparePage from './pages/ComparePage'
import CrawlerPage from './pages/CrawlerPage'
import AdminPage from './pages/AdminPage'
import AlgorithmsPage from './pages/AlgorithmsPage'
import { LoginPage, RegisterPage } from './pages/AuthPages'
import { useCompareStore } from './store'
import { Link, useLocation } from 'react-router-dom'
import { BarChart2, X } from 'lucide-react'

const CARRIER_COLORS: Record<string, string> = {
  BELL: '#3b82f6', ROGERS: '#ef4444', FREEDOM: '#22c55e', FIDO: '#f97316', TELUS: '#a855f7'
}

function CompareBar() {
  const { plans, remove } = useCompareStore()
  const { pathname }      = useLocation()
  if (plans.length === 0 || pathname === '/compare') return null

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(17,20,32,0.97)', backdropFilter: 'blur(14px)',
      border: '1px solid var(--border2)', borderRadius: 14,
      padding: '11px 18px', display: 'flex', alignItems: 'center', gap: 12,
      zIndex: 90, boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
      maxWidth: '92vw',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <BarChart2 size={15} color="var(--accent)" />
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
          Comparing {plans.length}/4:
        </span>
      </div>

      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {plans.map(p => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: `${CARRIER_COLORS[p.carrier] || 'var(--accent)'}18`,
            border: `1px solid ${CARRIER_COLORS[p.carrier] || 'var(--accent)'}35`,
            borderRadius: 7, padding: '4px 9px', fontSize: 12,
            color: CARRIER_COLORS[p.carrier] || 'var(--accent)',
          }}>
            <span style={{ fontWeight: 700 }}>{p.carrier}</span>
            <span style={{ color: 'var(--muted)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {p.name.split(' ').slice(1).join(' ')}
            </span>
            <button onClick={() => remove(p.id)} style={{
              background: 'none', border: 'none', color: 'var(--muted)',
              cursor: 'pointer', padding: 0, lineHeight: 1, display: 'flex',
            }}>
              <X size={10} />
            </button>
          </div>
        ))}
      </div>

      <Link to="/compare" className="btn btn-primary" style={{
        padding: '7px 14px', fontSize: 12, textDecoration: 'none', whiteSpace: 'nowrap',
      }}>
        Compare Now →
      </Link>
    </div>
  )
}

export default function App() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <Routes>
        <Route path="/"                  element={<HomePage />} />
        <Route path="/plans"             element={<PlansPage />} />
        <Route path="/carrier/:carrier"  element={<CarrierPage />} />
        <Route path="/search"            element={<SearchPage />} />
        <Route path="/compare"           element={<ComparePage />} />
        <Route path="/crawler"           element={<CrawlerPage />} />
        <Route path="/algorithms"         element={<AlgorithmsPage />} />
        <Route path="/admin"             element={<AdminPage />} />
        <Route path="/login"             element={<LoginPage />} />
        <Route path="/register"          element={<RegisterPage />} />
      </Routes>
      <CompareBar />
    </div>
  )
}
