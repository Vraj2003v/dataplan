import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { plansApi } from '../services/api'
import { useAuthStore } from '../store'
import { Navigate } from 'react-router-dom'
import { Trash2, Edit2, RefreshCw, Plus, X, Save, ShieldAlert } from 'lucide-react'

const EMPTY = { name: '', carrier: 'BELL', price: 0, dataGb: 0, networkType: '5G', features: '', speed: '', planUrl: '', isFeatured: false }
const CARRIERS = ['BELL', 'ROGERS', 'FREEDOM', 'FIDO', 'TELUS']
const NETWORKS = ['5G', '4G LTE', '4G']

export default function AdminPage() {
  const { isAdmin } = useAuthStore()
  const qc = useQueryClient()
  const [form, setForm]     = useState<any>(null)
  const [showForm, setSF]   = useState(false)

  if (!isAdmin()) return (
    <div style={{ maxWidth: 500, margin: '80px auto', padding: '0 22px', textAlign: 'center' }}>
      <ShieldAlert size={48} color="#ef4444" style={{ marginBottom: 16 }} />
      <h2 style={{ color: 'white', marginBottom: 10 }}>Admin access required</h2>
      <p style={{ color: 'var(--muted)' }}>Login with admin@dataplan.com / admin123</p>
      <Navigate to="/login" />
    </div>
  )

  const { data: plans = [], isLoading } = useQuery({ queryKey: ['plans'], queryFn: () => plansApi.getAll().then(r => r.data) })
  const { data: searches = [] }         = useQuery({ queryKey: ['searchFreq'], queryFn: () => plansApi.frequency().then(r => r.data) })
  const { data: stats = {} }            = useQuery({ queryKey: ['stats'], queryFn: () => plansApi.stats().then(r => r.data), retry: false })

  const delMut = useMutation({ mutationFn: (id: number) => plansApi.remove(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['plans'] }) })
  const saveMut = useMutation({
    mutationFn: (p: any) => p.id ? plansApi.update(p.id, p) : plansApi.create(p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['plans'] }); setSF(false); setForm(null) },
  })
  const scrapeMut = useMutation({
    mutationFn: plansApi.scrapeAll,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['plans'] }); alert('All 5 carriers scraped!') },
  })

  const openEdit = (p: any) => { setForm({ ...p }); setSF(true) }
  const openNew  = ()       => { setForm({ ...EMPTY }); setSF(true) }

  const sc = stats as any
  const statCards = [
    { label: 'Total Plans', val: plans.length },
    ...CARRIERS.map(c => ({ label: c, val: plans.filter((p: any) => p.carrier === c).length })),
  ]

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '44px 22px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', letterSpacing: '-1px' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--muted)', marginTop: 5, fontSize: 14 }}>Manage plans, trigger scrapes, view analytics</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => scrapeMut.mutate()} disabled={scrapeMut.isPending} className="btn btn-ghost">
            <RefreshCw size={13} className={scrapeMut.isPending ? 'spin' : ''} />
            {scrapeMut.isPending ? 'Scraping all…' : 'Scrape All 5 Carriers'}
          </button>
          <button onClick={openNew} className="btn btn-primary">
            <Plus size={13} /> Add Plan
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: 12, marginBottom: 28 }}>
        {statCards.map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 5, letterSpacing: '0.04em' }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'white', fontFamily: 'JetBrains Mono,monospace' }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20 }}>
        {/* Plans Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontWeight: 700, color: 'white', fontSize: 14 }}>
            All Plans ({plans.length})
          </div>
          {isLoading ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>Loading…</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Carrier', 'Plan Name', 'Price', 'Data', 'Network', '★', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '9px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {plans.map((p: any) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '9px 12px' }}>
                        <span className={`badge badge-${p.carrier.toLowerCase()}`} style={{ fontSize: 10 }}>{p.carrier}</span>
                      </td>
                      <td style={{ padding: '9px 12px', color: 'white', maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</td>
                      <td style={{ padding: '9px 12px', fontFamily: 'JetBrains Mono,monospace', color: '#86efac' }}>${p.price}</td>
                      <td style={{ padding: '9px 12px', fontFamily: 'JetBrains Mono,monospace' }}>{p.dataGb === -1 ? '∞' : `${p.dataGb}GB`}</td>
                      <td style={{ padding: '9px 12px' }}>
                        <span className={`badge ${p.networkType?.includes('5G') ? 'badge-5g' : 'badge-4g'}`} style={{ fontSize: 10 }}>{p.networkType}</span>
                      </td>
                      <td style={{ padding: '9px 12px', color: p.isFeatured ? '#fde047' : 'var(--border2)' }}>{p.isFeatured ? '★' : '☆'}</td>
                      <td style={{ padding: '9px 12px' }}>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button onClick={() => openEdit(p)} style={{
                            padding: '4px 7px', borderRadius: 6, border: '1px solid var(--border2)',
                            background: 'transparent', color: 'var(--muted)', cursor: 'pointer',
                          }}><Edit2 size={11} /></button>
                          <button onClick={() => { if (confirm(`Delete "${p.name}"?`)) delMut.mutate(p.id) }} style={{
                            padding: '4px 7px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)',
                            background: 'rgba(239,68,68,0.08)', color: '#fca5a5', cursor: 'pointer',
                          }}><Trash2 size={11} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Searches Sidebar */}
        <div className="card" style={{ padding: 18, alignSelf: 'start' }}>
          <div style={{ fontWeight: 700, color: 'white', fontSize: 14, marginBottom: 14 }}>Top Searches</div>
          {(searches as any[]).length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>No searches yet</p>
          ) : (searches as any[]).map((s: any, i: number) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 13,
            }}>
              <span style={{ color: 'var(--text)' }}>{s.query}</span>
              <span style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono,monospace', fontSize: 12 }}>{s.searchCount}×</span>
            </div>
          ))}
        </div>
      </div>

      {/* Plan Form Modal */}
      {showForm && form && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }} onClick={e => e.target === e.currentTarget && setSF(false)}>
          <div className="card" style={{ width: '100%', maxWidth: 500, padding: 26, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'white' }}>{form.id ? 'Edit Plan' : 'New Plan'}</h2>
              <button onClick={() => setSF(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                <X size={17} />
              </button>
            </div>

            {/* Form fields */}
            {[
              { label: 'Plan Name *', key: 'name', type: 'text', placeholder: 'e.g. Bell Unlimited 5G' },
              { label: 'Monthly Price ($)', key: 'price', type: 'number', placeholder: '65' },
              { label: 'Data GB (-1 = unlimited)', key: 'dataGb', type: 'number', placeholder: '50' },
              { label: 'Speed', key: 'speed', type: 'text', placeholder: 'e.g. Up to 1Gbps' },
              { label: 'Plan URL', key: 'planUrl', type: 'text', placeholder: 'https://...' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 13 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 5, fontWeight: 600 }}>{f.label}</label>
                <input
                  type={f.type} value={form[f.key] ?? ''} placeholder={f.placeholder}
                  onChange={e => setForm({ ...form, [f.key]: f.type === 'number' ? +e.target.value : e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', fontSize: 13 }}
                />
              </div>
            ))}

            {/* Carrier select */}
            <div style={{ marginBottom: 13 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 5, fontWeight: 600 }}>Carrier</label>
              <select value={form.carrier} onChange={e => setForm({ ...form, carrier: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', fontSize: 13, cursor: 'pointer' }}>
                {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Network select */}
            <div style={{ marginBottom: 13 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 5, fontWeight: 600 }}>Network Type</label>
              <select value={form.networkType} onChange={e => setForm({ ...form, networkType: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', fontSize: 13, cursor: 'pointer' }}>
                {NETWORKS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            {/* Features textarea */}
            <div style={{ marginBottom: 13 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 5, fontWeight: 600 }}>Features</label>
              <textarea value={form.features ?? ''} onChange={e => setForm({ ...form, features: e.target.value })}
                rows={3} placeholder="Unlimited calls, voicemail, Wi-Fi calling…"
                style={{ width: '100%', padding: '9px 12px', fontSize: 13, resize: 'vertical' }} />
            </div>

            {/* Featured toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 20, cursor: 'pointer', fontSize: 13, color: 'var(--text)' }}>
              <input type="checkbox" checked={!!form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} />
              Show on homepage as featured plan
            </label>

            {saveMut.isError && (
              <div style={{ marginBottom: 14, padding: '9px 13px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                Save failed. Check all required fields.
              </div>
            )}

            <button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending || !form.name}
              className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: 14 }}>
              <Save size={14} /> {saveMut.isPending ? 'Saving…' : 'Save Plan'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
