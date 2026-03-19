import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { plansApi } from '../services/api'
import PlanCard from '../components/PlanCard'
import { SlidersHorizontal } from 'lucide-react'

export default function PlansPage() {
  const [carrier, setCarrier] = useState('ALL')
  const [network, setNetwork] = useState('ALL')
  const [sort, setSort]       = useState('price_asc')
  const [maxPrice, setMax]    = useState(150)

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => plansApi.getAll().then(r => r.data),
  })

  const filtered = plans
    .filter((p: any) => carrier === 'ALL' || p.carrier === carrier)
    .filter((p: any) => network === 'ALL' || (p.networkType || '').includes(network))
    .filter((p: any) => p.price <= maxPrice)
    .sort((a: any, b: any) => {
      if (sort === 'price_asc')  return a.price - b.price
      if (sort === 'price_desc') return b.price - a.price
      if (sort === 'data_desc')  return (b.dataGb === -1 ? 9999 : b.dataGb) - (a.dataGb === -1 ? 9999 : a.dataGb)
      return 0
    })

  const Chip = ({ label, val, cur, set }: any) => (
    <button key={val} onClick={() => set(val)} style={{
      padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: cur === val ? 'var(--accent)' : 'transparent',
      color: cur === val ? 'white' : 'var(--muted)',
      border: `1px solid ${cur === val ? 'var(--accent)' : 'var(--border2)'}`,
      cursor: 'pointer', fontFamily: 'Syne,sans-serif', transition: 'all 0.15s', whiteSpace: 'nowrap',
    }}>{label}</button>
  )

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '44px 22px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 6, letterSpacing: '-1px' }}>All Plans</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 24, fontSize: 14 }}>{filtered.length} plans</p>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: 24, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <SlidersHorizontal size={14} color="var(--muted)" />
          <span style={{ fontSize: 12, color: 'var(--muted)', marginRight: 4 }}>Carrier:</span>
          {['ALL','BELL','ROGERS','FREEDOM','FIDO','TELUS'].map(c => <Chip key={c} label={c} val={c} cur={carrier} set={setCarrier} />)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--muted)', marginRight: 4 }}>Network:</span>
          {[['All','ALL'],['4G','4G'],['5G','5G']].map(([l,v]) => <Chip key={v} label={l} val={v} cur={network} set={setNetwork} />)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Sort:</span>
          <select value={sort} onChange={e => setSort(e.target.value)} style={{
            padding: '5px 10px', fontSize: 12, borderRadius: 8, cursor: 'pointer',
          }}>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
            <option value="data_desc">Most data</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Max:</span>
          <span style={{ fontSize: 12, color: 'white', fontFamily: 'JetBrains Mono,monospace' }}>${maxPrice}</span>
          <input type="range" min={20} max={150} step={5} value={maxPrice} onChange={e => setMax(+e.target.value)} style={{ width: 90 }} />
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
          {[...Array(10)].map((_,i) => <div key={i} className="card skeleton" style={{ height: 200 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--muted)' }}>No plans match your filters</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
          {filtered.map((p: any) => <PlanCard key={p.id} plan={p} />)}
        </div>
      )}
    </div>
  )
}
