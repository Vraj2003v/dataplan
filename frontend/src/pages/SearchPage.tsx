import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { plansApi } from '../services/api'
import PlanCard from '../components/PlanCard'
import SearchBar from '../components/SearchBar'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Clock, Search } from 'lucide-react'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [result, setResult]   = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const initQ = searchParams.get('q') || ''

  const { data: trending = [] } = useQuery({
    queryKey: ['searchFreq'],
    queryFn: () => plansApi.frequency().then(r => r.data),
  })

  useEffect(() => { if (initQ) run(initQ) }, [])

  const run = async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setSearchParams({ q })
    try { setResult((await plansApi.search(q)).data) } catch {}
    finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '44px 22px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 6, letterSpacing: '-1px' }}>Search Plans</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 28, fontSize: 14 }}>
        Smart search with spell check, autocomplete, and pattern detection
      </p>

      <SearchBar onSearch={run} autoFocus initialValue={initQ} />

      {result?.spellSuggestion && (
        <div style={{ marginTop: 10, fontSize: 13, color: 'var(--muted)', paddingLeft: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
          Did you mean
          <button onClick={() => run(result.spellSuggestion)} style={{
            background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer',
            fontWeight: 700, fontSize: 13, fontFamily: 'Syne,sans-serif'
          }}>
            &quot;{result.spellSuggestion}&quot;
          </button>?
          <span style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>
            (Damerau-Levenshtein)
          </span>
        </div>
      )}

      {result?.detectedPattern && (
        <div style={{
          marginTop: 14, padding: '9px 14px', borderRadius: 8, fontSize: 13,
          background: 'rgba(79,110,247,0.1)', border: '1px solid rgba(79,110,247,0.25)',
          color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 7, fontWeight: 600,
        }}>
          <Search size={13} /> Pattern: {result.detectedPattern}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 270px', gap: 28, marginTop: 28 }}>
        <div>
          {loading && (
            <div style={{ display: 'grid', gap: 10 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card skeleton" style={{ height: 110 }} />
              ))}
            </div>
          )}

          {!loading && result && (
            <>
              <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 14 }}>
                {result.totalResults} result{result.totalResults !== 1 ? 's' : ''} for{' '}
                <strong style={{ color: 'white' }}>"{result.originalQuery}"</strong>
              </p>
              {result.results.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
                  <Search size={40} style={{ marginBottom: 14, opacity: 0.25 }} />
                  <p>No results found. Try a different search.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 11 }}>
                  {result.results.map((p: any) => <PlanCard key={p.id} plan={p} />)}
                </div>
              )}
            </>
          )}

          {!loading && !result && (
            <div style={{ textAlign: 'center', padding: 80, color: 'var(--muted)' }}>
              <Search size={44} style={{ marginBottom: 14, opacity: 0.18 }} />
              <p>Search above to find plans</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {trending.length > 0 && (
            <div className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
                <TrendingUp size={14} color="var(--accent)" />
                <span style={{ fontWeight: 700, fontSize: 13, color: 'white' }}>Trending</span>
              </div>
              {trending.map((s: any, i: number) => (
                <button key={i} onClick={() => run(s.query)} style={{
                  display: 'flex', justifyContent: 'space-between', width: '100%',
                  padding: '7px 0', background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text)', fontSize: 13, fontFamily: 'Syne,sans-serif',
                  borderBottom: i < trending.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Clock size={10} color="var(--muted)" /> {s.query}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'JetBrains Mono,monospace' }}>
                    {s.searchCount}x
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'white', marginBottom: 12 }}>Search Tips</div>
            {[
              ['$50',       'Plans at that price'],
              ['20GB',      'Plans with 20GB+ data'],
              ['5G',        '5G network plans'],
              ['unlimited', 'Unlimited data'],
              ['fido',      'Filter by carrier'],
              ['under $60', 'Budget filter'],
            ].map(([ex, desc]) => (
              <div key={ex} style={{ marginBottom: 8 }}>
                <button onClick={() => run(ex)} style={{
                  fontFamily: 'JetBrains Mono,monospace', fontSize: 11,
                  background: 'rgba(79,110,247,0.1)', border: '1px solid rgba(79,110,247,0.2)',
                  color: 'var(--accent)', borderRadius: 4, padding: '2px 7px', cursor: 'pointer', marginRight: 7,
                }}>{ex}</button>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
