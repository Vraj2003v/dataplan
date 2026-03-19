import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Zap } from 'lucide-react'
import { plansApi } from '../services/api'

interface Props { onSearch?: (q: string) => void; autoFocus?: boolean; initialValue?: string }

export default function SearchBar({ onSearch, autoFocus, initialValue = '' }: Props) {
  const [query, setQuery]       = useState(initialValue)
  const [completions, setComp]  = useState<string[]>([])
  const [spell, setSpell]       = useState<string | null>(null)
  const [pattern, setPattern]   = useState<string | null>(null)
  const [open, setOpen]         = useState(false)
  const debounce = useRef<any>()
  const nav = useNavigate()

  useEffect(() => {
    if (!query.trim()) { setComp([]); setPattern(null); return }
    clearTimeout(debounce.current)
    debounce.current = setTimeout(async () => {
      const last = query.split(' ').pop() || ''
      if (last.length >= 2) {
        try { setComp((await plansApi.complete(last)).data || []) } catch { setComp([]) }
      }
      if (/\$\d+/.test(query))          setPattern('Price filter')
      else if (/under\s*\$?\d+/i.test(query)) setPattern('Max price filter')
      else if (/\d+\s*gb/i.test(query)) setPattern('Data filter')
      else if (/5g|4g|lte/i.test(query)) setPattern('Network filter')
      else if (/unlimited/i.test(query)) setPattern('Unlimited plans')
      else setPattern(null)
    }, 280)
  }, [query])

  const run = async (q = query) => {
    if (!q.trim()) return
    setOpen(false)
    try {
      const r = await plansApi.search(q)
      setSpell(r.data.spellSuggestion || null)
    } catch {}
    if (onSearch) onSearch(q)
    else nav(`/search?q=${encodeURIComponent(q)}`)
  }

  const pick = (w: string) => {
    const words = query.split(' '); words[words.length - 1] = w
    const nq = words.join(' '); setQuery(nq); run(nq); setOpen(false)
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--card)', border: '1px solid var(--border2)',
        borderRadius: 12, padding: '10px 14px',
      }}>
        <Search size={17} color="var(--muted)" style={{ flexShrink: 0 }} />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onKeyDown={e => e.key === 'Enter' && run()}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          autoFocus={autoFocus}
          placeholder='Try "Bell 5G", "$50", "unlimited", "androd"…'
          style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: 14, fontFamily: 'Syne,sans-serif', outline: 'none' }}
        />
        {query && <button onClick={() => { setQuery(''); setSpell(null); setPattern(null) }}
          style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 0 }}>
          <X size={15} />
        </button>}
        <button onClick={() => run()} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 13 }}>Search</button>
      </div>

      {/* Pattern hint */}
      {pattern && (
        <div style={{ marginTop: 5, fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 5, paddingLeft: 4 }}>
          <Zap size={11} /> {pattern} detected
        </div>
      )}

      {/* Spell suggestion */}
      {spell && (
        <div style={{ marginTop: 5, fontSize: 13, color: 'var(--muted)', paddingLeft: 4 }}>
          Did you mean{' '}
          <button onClick={() => { setQuery(spell); run(spell); setSpell(null) }}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'Syne,sans-serif' }}>
            "{spell}"
          </button>?
        </div>
      )}

      {/* Autocomplete dropdown */}
      {open && completions.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50,
          background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 10,
          overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        }}>
          {completions.map((w, i) => (
            <button key={i} onMouseDown={() => pick(w)} style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px',
              background: 'transparent', border: 'none', color: 'var(--text)', textAlign: 'left',
              cursor: 'pointer', fontSize: 13, fontFamily: 'Syne,sans-serif',
              borderBottom: i < completions.length - 1 ? '1px solid var(--border)' : 'none',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,110,247,0.07)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <Search size={11} color="var(--muted)" /> {w}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
