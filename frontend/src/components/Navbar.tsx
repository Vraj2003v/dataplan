import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { useCompareStore } from '../store'
import { Wifi, LogOut, Shield, User, BarChart2 } from 'lucide-react'

const CARRIERS = ['BELL','ROGERS','FREEDOM','FIDO','TELUS']

export default function Navbar() {
  const { email, isLoggedIn, isAdmin, logout } = useAuthStore()
  const { plans: cmp } = useCompareStore()
  const nav = useNavigate()
  const { pathname } = useLocation()

  const link = (to: string, label: string) => {
    const active = pathname === to || pathname.startsWith(to + '/')
    return (
      <Link key={to} to={to} style={{
        color: active ? 'white' : 'var(--muted)', fontWeight: active ? 600 : 400,
        fontSize: 13, textDecoration: 'none', padding: '5px 10px', borderRadius: 7,
        background: active ? 'rgba(79,110,247,0.14)' : 'transparent', transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}>{label}</Link>
    )
  }

  return (
    <nav style={{
      background: 'rgba(11,13,24,0.9)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100,
      padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginRight: 8 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><Wifi size={15} color="white" /></div>
        <span style={{ fontWeight: 800, fontSize: 16, color: 'white', letterSpacing: '-0.5px' }}>
          DataPlan<span style={{ color: 'var(--accent)' }}>CA</span>
        </span>
      </Link>

      {/* Main nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, flexWrap: 'nowrap', overflow: 'auto' }}>
        {link('/plans', 'All Plans')}
        {CARRIERS.map(c => link(`/carrier/${c}`, c.charAt(0) + c.slice(1).toLowerCase()))}
        {link('/search', 'Search')}
        {link('/compare', `Compare${cmp.length > 0 ? ` (${cmp.length})` : ''}`)}
        {link('/crawler', 'Crawler')}
        {link('/algorithms', 'Algorithms')}
        {isLoggedIn() && isAdmin() && link('/admin', 'Admin')}
      </div>

      {/* Auth */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {cmp.length > 0 && (
          <Link to="/compare" style={{
            display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700,
            background: 'rgba(79,110,247,0.15)', border: '1px solid rgba(79,110,247,0.35)',
            color: 'var(--accent)', padding: '5px 10px', borderRadius: 7, textDecoration: 'none',
          }}>
            <BarChart2 size={13} /> Compare ({cmp.length})
          </Link>
        )}
        {isLoggedIn() ? (
          <>
            <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
              {isAdmin() ? <Shield size={13} color="var(--accent)" /> : <User size={13} />}
              {email}
            </div>
            <button onClick={() => { logout(); nav('/') }} className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }}>
              <LogOut size={13} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login"    className="btn btn-ghost"   style={{ padding: '5px 14px', fontSize: 12, textDecoration: 'none' }}>Login</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '5px 14px', fontSize: 12, textDecoration: 'none' }}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  )
}
