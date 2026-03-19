// ═══════════════════════════════════════════
// CarrierPage.tsx
// ═══════════════════════════════════════════
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { plansApi } from '../services/api'
import PlanCard from '../components/PlanCard'
import { RefreshCw, Wifi } from 'lucide-react'
import { useAuthStore } from '../store'

const INFO: Record<string, { col: string; desc: string }> = {
  BELL:    { col: '#3b82f6', desc: "Canada's largest LTE/5G network." },
  ROGERS:  { col: '#ef4444', desc: 'Coast-to-coast 5G in 700+ cities.' },
  FREEDOM: { col: '#22c55e', desc: 'Competitive pricing, solid coverage.' },
  FIDO:    { col: '#f97316', desc: 'Rogers subsidiary with great value.' },
  TELUS:   { col: '#a855f7', desc: 'Award-winning network and service.' },
}

export function CarrierPage() {
  const { carrier = '' } = useParams()
  const upper = carrier.toUpperCase()
  const info  = INFO[upper] || { col: 'var(--accent)', desc: '' }
  const { isAdmin } = useAuthStore()
  const qc = useQueryClient()

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['plans', upper],
    queryFn: () => plansApi.getByCarrier(upper).then(r => r.data),
  })

  const scrape = useMutation({
    mutationFn: () => plansApi.scrape(upper),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['plans', upper] }),
  })

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '44px 22px' }}>
      <div style={{
        background: `linear-gradient(135deg, ${info.col}12, transparent)`,
        border: `1px solid ${info.col}28`, borderRadius: 14,
        padding: '28px 30px', marginBottom: 34,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${info.col}20`, border: `1px solid ${info.col}40`, borderRadius: 7, padding: '3px 10px', marginBottom: 10 }}>
            <Wifi size={12} color={info.col} />
            <span style={{ color: info.col, fontSize: 11, fontWeight: 700, letterSpacing: '0.07em' }}>CARRIER</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: 'white', letterSpacing: '-1px', marginBottom: 6 }}>{upper}</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>{info.desc} · {plans.length} plans available</p>
          {plans[0]?.scrapedAt && <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>Updated {new Date(plans[0].scrapedAt).toLocaleString()}</p>}
        </div>
        {isAdmin() && (
          <button onClick={() => scrape.mutate()} disabled={scrape.isPending} className="btn btn-ghost">
            <RefreshCw size={14} className={scrape.isPending ? 'spin' : ''} />
            {scrape.isPending ? 'Scraping...' : 'Re-scrape Live Data'}
          </button>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
          {[...Array(5)].map((_,i) => <div key={i} className="card skeleton" style={{ height: 200 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
          {plans.map((p: any) => <PlanCard key={p.id} plan={p} />)}
        </div>
      )}
    </div>
  )
}
