import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { plansApi } from '../services/api'
import PlanCard from '../components/PlanCard'
import SearchBar from '../components/SearchBar'
import { TrendingDown, Database, ArrowRight, Zap, Wifi } from 'lucide-react'

const CARRIERS = [
  { name: 'BELL',    col: '#3b82f6', desc: 'Largest national network' },
  { name: 'ROGERS',  col: '#ef4444', desc: 'Coast-to-coast 5G' },
  { name: 'FREEDOM', col: '#22c55e', desc: 'Budget-friendly plans' },
  { name: 'FIDO',    col: '#f97316', desc: 'Flexible prepaid & postpaid' },
  { name: 'TELUS',   col: '#a855f7', desc: 'Award-winning network' },
]

export default function HomePage() {
  const { data: bestPrice } = useQuery({ queryKey: ['best','price'], queryFn: () => plansApi.getBest('price').then(r => r.data) })
  const { data: bestData }  = useQuery({ queryKey: ['best','data'],  queryFn: () => plansApi.getBest('data').then(r => r.data) })
  const { data: featured = [] } = useQuery({ queryKey: ['featured'], queryFn: () => plansApi.getFeatured().then(r => r.data) })

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '44px 22px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(79,110,247,0.1)', border: '1px solid rgba(79,110,247,0.25)',
          borderRadius: 20, padding: '3px 12px', marginBottom: 18, fontSize: 11,
          color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.06em',
        }}>
          <Zap size={10} /> REAL-TIME CANADIAN CARRIER COMPARISON
        </div>
        <h1 style={{
          fontSize: 'clamp(32px,5.5vw,66px)', fontWeight: 800,
          lineHeight: 1.08, color: 'white', marginBottom: 18, letterSpacing: '-2px',
        }}>
          Find your best plan<br />
          <span style={{ background: 'linear-gradient(90deg,var(--accent),var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            across 5 carriers
          </span>
        </h1>
        <p style={{ fontSize: 17, color: 'var(--muted)', maxWidth: 460, margin: '0 auto 32px' }}>
          Compare Bell, Rogers, Freedom, Fido & Telus side-by-side with smart search and live plan data.
        </p>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          <SearchBar />
        </div>
      </div>

      {/* Best Plans */}
      {(bestPrice || bestData) && (
        <section style={{ marginBottom: 52 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 16 }}>Best Plans Right Now</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 14 }}>
            {bestPrice && (
              <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: 14, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(34,197,94,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingDown size={15} color="#22c55e" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'white', fontSize: 13 }}>Most Affordable</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{bestPrice.recommendationReason}</div>
                  </div>
                </div>
                <PlanCard plan={bestPrice} />
              </div>
            )}
            {bestData && (
              <div style={{ background: 'rgba(79,110,247,0.05)', border: '1px solid rgba(79,110,247,0.18)', borderRadius: 14, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(79,110,247,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Database size={15} color="var(--accent)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'white', fontSize: 13 }}>Most Data</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{bestData.recommendationReason}</div>
                  </div>
                </div>
                <PlanCard plan={bestData} />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Carrier Grid */}
      <section style={{ marginBottom: 52 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 16 }}>Browse by Carrier</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 12 }}>
          {CARRIERS.map(c => (
            <Link key={c.name} to={`/carrier/${c.name}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: 20, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = c.col; e.currentTarget.style.background = `${c.col}0d` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--card)' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: `${c.col}22`,
                  border: `1px solid ${c.col}44`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', marginBottom: 10,
                }}>
                  <Wifi size={18} color={c.col} />
                </div>
                <div style={{ fontWeight: 700, color: 'white', marginBottom: 3, fontSize: 14 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>{c.desc}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: c.col, fontSize: 12, fontWeight: 600 }}>
                  View plans <ArrowRight size={12} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 16 }}>Featured Plans</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
            {featured.map((p: any) => <PlanCard key={p.id} plan={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
