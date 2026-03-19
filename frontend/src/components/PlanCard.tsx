import { Plus, Minus, ExternalLink } from 'lucide-react'
import { useCompareStore, Plan } from '../store'

const CARRIER_COLORS: Record<string, string> = {
  BELL: '#3b82f6', ROGERS: '#ef4444', FREEDOM: '#22c55e', FIDO: '#f97316', TELUS: '#a855f7'
}

export default function PlanCard({ plan }: { plan: Plan }) {
  const { add, remove, has, plans } = useCompareStore()
  const inCmp = has(plan.id)
  const disabled = !inCmp && plans.length >= 4
  const c = plan.carrier?.toUpperCase() || ''
  const col = CARRIER_COLORS[c] || '#4f6ef7'
  const dataLabel = plan.dataGb === -1 ? '∞ Unlimited' : `${plan.dataGb}GB`

  return (
    <div className="card fade-up" style={{
      padding: 18, display: 'flex', flexDirection: 'column', gap: 12,
      transition: 'border-color 0.2s, transform 0.2s',
      borderColor: inCmp ? 'var(--accent)' : undefined,
    }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = '')}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className={`badge badge-${c.toLowerCase()}`} style={{ marginBottom: 5, display: 'block' }}>{c}</span>
          <h3 style={{ fontWeight: 700, fontSize: 14, color: 'white', lineHeight: 1.3 }}>{plan.name}</h3>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: 'white', fontFamily: 'JetBrains Mono,monospace' }}>
            ${plan.price}
          </span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>/mo</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
        {[
          { label: 'DATA', value: dataLabel },
          { label: 'NETWORK', value: plan.networkType || '4G' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 10px',
          }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2, letterSpacing: '0.06em' }}>{s.label}</div>
            <div style={{ fontWeight: 700, color: s.label === 'DATA' ? col : 'white', fontSize: 13, fontFamily: 'JetBrains Mono,monospace' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Features */}
      {plan.features && (
        <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.55, margin: 0 }}>
          {plan.features.length > 95 ? plan.features.slice(0, 95) + '…' : plan.features}
        </p>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 7, marginTop: 'auto' }}>
        <button
          onClick={() => inCmp ? remove(plan.id) : add(plan)}
          disabled={disabled}
          style={{
            flex: 1, padding: '8px', borderRadius: 8, border: `1px solid ${inCmp ? 'rgba(79,110,247,0.4)' : 'var(--border2)'}`,
            background: inCmp ? 'rgba(79,110,247,0.12)' : 'rgba(255,255,255,0.04)',
            color: inCmp ? 'var(--accent)' : disabled ? 'var(--muted)' : 'var(--text)',
            cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'Syne,sans-serif',
            fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            transition: 'all 0.15s', opacity: disabled ? 0.5 : 1,
          }}>
          {inCmp ? <><Minus size={12} /> Remove</> : <><Plus size={12} /> Compare</>}
        </button>
        {plan.planUrl && (
          <a href={plan.planUrl} target="_blank" rel="noopener noreferrer" style={{
            padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)',
            color: 'var(--muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 12, transition: 'all 0.15s',
          }}>
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  )
}
