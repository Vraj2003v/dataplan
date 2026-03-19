import { useState } from 'react'
import { plansApi } from '../services/api'
import { useQuery } from '@tanstack/react-query'
import {
  GitBranch, BarChart2, Route, FileCode2,
  ChevronRight, Loader, Info, CheckCircle
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const tt = { contentStyle: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, color: 'white' } }

const ACCENT = '#4f6ef7'
const colors = { avl: '#22c55e', heap: '#f59e0b', dijkstra: '#8b5cf6', huffman: '#ec4899' }

const Badge = ({ label, color }: { label: string; color: string }) => (
  <span style={{
    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
    background: `${color}20`, color, border: `1px solid ${color}40`
  }}>{label}</span>
)

const AlgoCard = ({ color, icon, title, complexity, useCase, children }: any) => (
  <div className="card" style={{ padding: 22, marginBottom: 20 }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <div>
          <div style={{ fontWeight: 700, color: 'white', fontSize: 15 }}>{title}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{useCase}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {(Array.isArray(complexity) ? complexity : [complexity]).map((c: string) => (
          <Badge key={c} label={c} color={color} />
        ))}
      </div>
    </div>
    {children}
  </div>
)

// ── 1. AVL Tree ────────────────────────────────────────────────
function AVLSection() {
  const [sortBy, setSortBy]         = useState<'price' | 'data'>('price')
  const [minP, setMinP]             = useState('')
  const [maxP, setMaxP]             = useState('')
  const [rangeMode, setRangeMode]   = useState(false)
  const [loading, setLoading]       = useState(false)
  const [result, setResult]         = useState<any>(null)

  const run = async () => {
    setLoading(true)
    try {
      const resp = await plansApi.sortedPlans(
        rangeMode ? 'price' : sortBy,
        rangeMode && minP ? +minP : undefined,
        rangeMode && maxP ? +maxP : undefined
      )
      setResult(resp.data)
    } catch {}
    setLoading(false)
  }

  return (
    <AlgoCard
      color={colors.avl}
      icon={<GitBranch size={15} color={colors.avl} />}
      title="AVL Self-Balancing BST"
      complexity={['O(log n) insert', 'O(log n) search', 'O(n) traversal']}
      useCase="Sorted plan retrieval by price or data — guaranteed balance via rotations"
    >
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.6 }}>
        Maintains a height-balanced BST. After every insert, the balance factor is checked and
        Left/Right rotations are applied if |BF| &gt; 1. This guarantees O(log n) operations even for sorted input.
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
        <label style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={rangeMode} onChange={e => setRangeMode(e.target.checked)} />
          Price Range Query
        </label>
        {rangeMode ? (
          <>
            <input value={minP} onChange={e => setMinP(e.target.value)} placeholder="Min $"
              style={{ width: 90, padding: '8px 10px', fontSize: 13 }} type="number" />
            <input value={maxP} onChange={e => setMaxP(e.target.value)} placeholder="Max $"
              style={{ width: 90, padding: '8px 10px', fontSize: 13 }} type="number" />
          </>
        ) : (
          <>
            {(['price', 'data'] as const).map(opt => (
              <button key={opt} onClick={() => setSortBy(opt)} className={sortBy === opt ? 'btn btn-primary' : 'btn btn-ghost'}
                style={{ padding: '7px 14px', fontSize: 12 }}>
                Sort by {opt === 'price' ? 'Price ↑' : 'Data ↓'}
              </button>
            ))}
          </>
        )}
        <button onClick={run} disabled={loading} className="btn btn-primary" style={{ marginLeft: 'auto' }}>
          {loading ? <Loader size={13} className="spin" /> : <ChevronRight size={13} />}
          {loading ? 'Loading…' : 'Run AVL'}
        </button>
      </div>

      {result && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
            {result.treeStats && Object.entries(result.treeStats).filter(([k]) => k !== 'algorithm').map(([k, v]) => (
              <div key={k} style={{
                padding: '6px 12px', borderRadius: 8, background: `${colors.avl}12`,
                border: `1px solid ${colors.avl}30`, fontSize: 11, color: colors.avl,
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                <span style={{ color: 'var(--muted)' }}>{k.replace(/([A-Z])/g, ' $1').trim()}: </span>
                <strong>{String(v)}</strong>
              </div>
            ))}
          </div>
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead style={{ position: 'sticky', top: 0, background: 'var(--card)' }}>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['#', 'Name', 'Carrier', 'Price', 'Data', 'Network'].map(h => (
                    <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(result.plans || []).slice(0, 30).map((p: any, i: number) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '6px 10px', color: 'var(--muted)', fontSize: 10 }}>{i + 1}</td>
                    <td style={{ padding: '6px 10px', color: 'white', fontWeight: 500 }}>{p.name}</td>
                    <td style={{ padding: '6px 10px', color: 'var(--accent)', fontSize: 11 }}>{p.carrier}</td>
                    <td style={{ padding: '6px 10px', fontFamily: 'JetBrains Mono,monospace', color: colors.avl }}>${p.price}/mo</td>
                    <td style={{ padding: '6px 10px', fontFamily: 'JetBrains Mono,monospace' }}>{p.dataGb === -1 ? '∞' : `${p.dataGb}GB`}</td>
                    <td style={{ padding: '6px 10px', fontSize: 11, color: 'var(--muted)' }}>{p.networkType || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
            {result.plans?.length} plans sorted in-order via AVL BST traversal
          </p>
        </>
      )}
    </AlgoCard>
  )
}

// ── 2. Heap Ranking ────────────────────────────────────────────
function HeapSection() {
  const [criteria, setCriteria] = useState<'value' | 'data' | 'network'>('value')
  const [top, setTop]           = useState(5)
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState<any>(null)

  const run = async () => {
    setLoading(true)
    try { setResult((await plansApi.rankedPlans(criteria, top)).data) } catch {}
    setLoading(false)
  }

  const barData = result?.results?.map((r: any) => ({
    name: r.plan.carrier + ' ' + r.plan.name.split(' ').slice(-1)[0],
    score: r.score
  })) || []

  return (
    <AlgoCard
      color={colors.heap}
      icon={<BarChart2 size={15} color={colors.heap} />}
      title="Max-Heap Priority Queue Ranking"
      complexity={['O(log n) insert', 'O(1) peek', 'O(k log n) top-K']}
      useCase="Retrieve top-K plans by composite score using a Max-Heap"
    >
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.6 }}>
        Score = weighted sum of normalized price value, data, network type, and features.
        Plans are inserted into a Max-Heap — extraction gives top-K in O(k log n) without full sort.
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
        {(['value', 'data', 'network'] as const).map(opt => (
          <button key={opt} onClick={() => setCriteria(opt)} className={criteria === opt ? 'btn btn-primary' : 'btn btn-ghost'}
            style={{ padding: '7px 14px', fontSize: 12, textTransform: 'capitalize' }}>{opt}</button>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)' }}>
          Top:
          <input type="number" value={top} onChange={e => setTop(+e.target.value)} min={3} max={20}
            style={{ width: 52, padding: '7px 10px', fontSize: 13, textAlign: 'center' }} />
        </div>
        <button onClick={run} disabled={loading} className="btn btn-primary" style={{ marginLeft: 'auto' }}>
          {loading ? <Loader size={13} className="spin" /> : <ChevronRight size={13} />}
          {loading ? 'Ranking…' : 'Run Heap'}
        </button>
      </div>

      {result && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            {result.results.map((r: any, i: number) => (
              <div key={i} style={{
                padding: '10px 12px', borderRadius: 8, marginBottom: 8,
                background: `${colors.heap}0a`, border: `1px solid ${colors.heap}25`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, color: 'var(--muted)' }}>#{i + 1}</span>
                    <span style={{ fontWeight: 700, color: 'white', fontSize: 13 }}>{r.plan.name}</span>
                    <span style={{ fontSize: 10, color: 'var(--muted)' }}>{r.plan.carrier}</span>
                  </div>
                  <span style={{
                    fontFamily: 'JetBrains Mono,monospace', fontSize: 12, fontWeight: 700,
                    color: colors.heap
                  }}>{r.score.toFixed(3)}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                  ${r.plan.price}/mo · {r.plan.dataGb === -1 ? '∞' : `${r.plan.dataGb}GB`} · {r.plan.networkType || 'N/A'}
                </div>
                {r.reasoning && (
                  <div style={{ fontSize: 11, color: colors.heap, marginTop: 4 }}>
                    <CheckCircle size={9} style={{ marginRight: 3 }} />{r.reasoning}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={barData} layout="vertical">
                <XAxis type="number" domain={[0, 1]} tick={{ fill: '#7b82a8', fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#7b82a8', fontSize: 9 }} width={85} />
                <Tooltip {...tt} formatter={(v: any) => [v.toFixed(3), 'Score']} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {barData.map((_: any, i: number) => (
                    <Cell key={i} fill={`hsl(${45 - i * 6}, 90%, ${60 - i * 4}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </AlgoCard>
  )
}

// ── 3. Dijkstra ────────────────────────────────────────────────
function DijkstraSection() {
  const [fromId, setFromId] = useState('')
  const [toId, setToId]     = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<any>(null)

  const { data: plans = [] } = useQuery({
    queryKey: ['allPlans'],
    queryFn: () => plansApi.getAll().then(r => r.data),
  })

  const run = async () => {
    if (!fromId || !toId || fromId === toId) return
    setLoading(true)
    try { setResult((await plansApi.upgradePath(fromId, toId)).data) } catch {}
    setLoading(false)
  }

  const planMap: Record<string, any> = {}
  ;(plans as any[]).forEach((p: any) => { planMap[String(p.id)] = p })

  return (
    <AlgoCard
      color={colors.dijkstra}
      icon={<Route size={15} color={colors.dijkstra} />}
      title="Dijkstra's Shortest Path"
      complexity={['O((V+E) log V)', 'Min-Heap based', 'Weighted directed graph']}
      useCase="Find the cheapest upgrade path between two plans"
    >
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.6 }}>
        Plans are modelled as graph nodes. Directed edges connect cheaper → more expensive plans.
        Edge weight = price difference. Dijkstra finds the least-cost upgrade path using a priority queue.
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
        <select value={fromId} onChange={e => setFromId(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '9px 12px', fontSize: 13, background: 'var(--bg)', color: 'white', border: '1px solid var(--border2)', borderRadius: 8 }}>
          <option value="">From plan…</option>
          {(plans as any[]).map((p: any) => (
            <option key={p.id} value={String(p.id)}>{p.carrier} — {p.name} (${p.price})</option>
          ))}
        </select>
        <span style={{ color: 'var(--muted)' }}>→</span>
        <select value={toId} onChange={e => setToId(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '9px 12px', fontSize: 13, background: 'var(--bg)', color: 'white', border: '1px solid var(--border2)', borderRadius: 8 }}>
          <option value="">To plan…</option>
          {(plans as any[]).map((p: any) => (
            <option key={p.id} value={String(p.id)}>{p.carrier} — {p.name} (${p.price})</option>
          ))}
        </select>
        <button onClick={run} disabled={loading || !fromId || !toId} className="btn btn-primary">
          {loading ? <Loader size={13} className="spin" /> : <ChevronRight size={13} />}
          {loading ? 'Finding…' : 'Find Path'}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: 8 }}>
          {result.totalCost >= 0 ? (
            <>
              <div style={{
                padding: '10px 14px', borderRadius: 8, marginBottom: 12,
                background: `${colors.dijkstra}12`, border: `1px solid ${colors.dijkstra}35`
              }}>
                <span style={{ color: 'var(--muted)', fontSize: 12 }}>Cheapest upgrade cost: </span>
                <span style={{ color: colors.dijkstra, fontWeight: 700, fontFamily: 'JetBrains Mono,monospace' }}>
                  ${result.totalCost.toFixed(2)}
                </span>
                <span style={{ color: 'var(--muted)', fontSize: 11, marginLeft: 10 }}>{result.algorithm}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                {result.path.map((id: string, i: number) => (
                  <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      padding: '6px 12px', borderRadius: 8, fontSize: 12,
                      background: i === 0 ? `${colors.dijkstra}25` : i === result.path.length - 1 ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${i === 0 ? colors.dijkstra : i === result.path.length - 1 ? '#22c55e' : 'var(--border)'}50`,
                      color: i === 0 ? colors.dijkstra : i === result.path.length - 1 ? '#22c55e' : 'var(--text)',
                    }}>
                      {planMap[id] ? `${planMap[id].carrier} ${planMap[id].name}` : id}
                    </div>
                    {i < result.path.length - 1 && <ChevronRight size={12} color="var(--muted)" />}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ color: '#fca5a5', fontSize: 13 }}>No upgrade path found between selected plans.</p>
          )}
        </div>
      )}
    </AlgoCard>
  )
}

// ── 4. Huffman ─────────────────────────────────────────────────
function HuffmanSection() {
  const { data: plans = [] } = useQuery({
    queryKey: ['allPlans'],
    queryFn: () => plansApi.getAll().then(r => r.data),
  })

  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [customText, setCustomText]     = useState('')
  const [loading, setLoading]           = useState(false)
  const [result, setResult]             = useState<any>(null)

  const run = async () => {
    const text = customText || selectedPlan?.features || selectedPlan?.name || ''
    if (!text) return
    setLoading(true)
    try { setResult((await plansApi.compress(text)).data) } catch {}
    setLoading(false)
  }

  const topCodes = result?.codes
    ? Object.entries(result.codes as Record<string, string>)
        .sort(([, a], [, b]) => a.length - b.length)
        .slice(0, 12)
    : []

  return (
    <AlgoCard
      color={colors.huffman}
      icon={<FileCode2 size={15} color={colors.huffman} />}
      title="Huffman Encoding (Greedy)"
      complexity={['O(n log n)', 'Optimal prefix-free code', 'Min-Heap construction']}
      useCase="Compress plan feature descriptions — show bit savings from frequency-based encoding"
    >
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.6 }}>
        Frequent characters get shorter binary codes. A Min-Heap sorts characters by frequency;
        the two lowest are merged until one root remains. The resulting tree defines optimal prefix-free codes.
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12, alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Select a plan (uses its features as input)</label>
          <select onChange={e => { const p = (plans as any[]).find((x: any) => String(x.id) === e.target.value); setSelectedPlan(p || null) }}
            style={{ width: '100%', padding: '9px 12px', fontSize: 13, background: 'var(--bg)', color: 'white', border: '1px solid var(--border2)', borderRadius: 8 }}>
            <option value="">Choose plan…</option>
            {(plans as any[]).map((p: any) => (
              <option key={p.id} value={String(p.id)}>{p.carrier} — {p.name}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 5 }}>Or enter custom text</label>
          <input value={customText} onChange={e => setCustomText(e.target.value)}
            placeholder="Type any text to compress…"
            style={{ width: '100%', padding: '9px 12px', fontSize: 13, boxSizing: 'border-box' }} />
        </div>
        <button onClick={run} disabled={loading || (!selectedPlan && !customText)} className="btn btn-primary">
          {loading ? <Loader size={13} className="spin" /> : <ChevronRight size={13} />}
          {loading ? 'Encoding…' : 'Encode'}
        </button>
      </div>

      {result && (
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            {[
              { label: 'Original bits', value: `${result.originalBits} bits`, color: '#94a3b8' },
              { label: 'Encoded bits', value: `${result.encodedBits} bits`, color: colors.huffman },
              { label: 'Compression', value: `${result.compressionRatio}%`, color: '#22c55e' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                padding: '8px 14px', borderRadius: 8, background: `${color}10`,
                border: `1px solid ${color}25`, textAlign: 'center'
              }}>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>{label}</div>
                <div style={{ fontWeight: 700, fontFamily: 'JetBrains Mono,monospace', color, fontSize: 14 }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>
            Input: <em style={{ color: 'white' }}>{result.originalText}</em>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {topCodes.map(([char, code]) => {
              const freq = result.frequencies?.[char] || 0
              return (
                <div key={char} style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: 11,
                  background: `${colors.huffman}10`, border: `1px solid ${colors.huffman}25`,
                  fontFamily: 'JetBrains Mono, monospace'
                }}>
                  <span style={{ color: 'white' }}>{char === ' ' ? '␣' : char}</span>
                  <span style={{ color: 'var(--muted)', margin: '0 4px' }}>→</span>
                  <span style={{ color: colors.huffman }}>{code}</span>
                  <span style={{ color: 'var(--muted)', marginLeft: 4 }}>({freq}×)</span>
                </div>
              )
            })}
          </div>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10 }}>
            {result.algorithm} · Showing shortest {topCodes.length} codes
          </p>
        </div>
      )}
    </AlgoCard>
  )
}

// ── 5. Spell Check (Damerau-Levenshtein) ──────────────────────
function SpellSection() {
  const [word, setWord]     = useState('androd')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<any>(null)

  const run = async () => {
    if (!word.trim()) return
    setLoading(true)
    try { setResult((await plansApi.spellAll(word.trim())).data) } catch {}
    setLoading(false)
  }

  return (
    <div className="card" style={{ padding: 22, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `${ACCENT}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Info size={15} color={ACCENT} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'white', fontSize: 15 }}>Damerau-Levenshtein Spell Check</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Improved: handles transpositions (e.g. "androd" → "android")</div>
          </div>
        </div>
        <Badge label="O(n·m) DP" color={ACCENT} />
      </div>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.6 }}>
        Standard Levenshtein handles insertions, deletions, and substitutions.
        Damerau-Levenshtein <strong style={{ color: 'white' }}>also handles adjacent transpositions</strong> —
        the most common human typing error. This catches "androd" → "android" and "tlesu" → "telus".
      </p>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
        <input value={word} onChange={e => setWord(e.target.value)} onKeyDown={e => e.key === 'Enter' && run()}
          placeholder="e.g. androd, tlesu, prmium…"
          style={{ flex: 1, padding: '9px 12px', fontSize: 13 }} />
        <button onClick={run} disabled={loading} className="btn btn-primary">
          {loading ? 'Checking…' : 'Check Spelling'}
        </button>
      </div>
      {result && (
        <div>
          <div style={{ fontSize: 13, marginBottom: 8, color: 'var(--muted)' }}>
            Suggestions for <strong style={{ color: 'white' }}>{result.word}</strong>:
          </div>
          {result.suggestions?.length > 0 ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {result.suggestions.map((s: string, i: number) => (
                <button key={s} onClick={() => setWord(s)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                    background: i === 0 ? `${ACCENT}20` : 'transparent',
                    border: `1px solid ${i === 0 ? ACCENT : 'var(--border)'}`,
                    color: i === 0 ? ACCENT : 'var(--text)'
                  }}>{s}</button>
              ))}
            </div>
          ) : (
            <p style={{ color: '#22c55e', fontSize: 13 }}>✓ Word found in dictionary — no corrections needed</p>
          )}
          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>{result.algorithm}</p>
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────
export default function AlgorithmsPage() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '44px 22px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 6, letterSpacing: '-1px' }}>
        ACC Algorithms
      </h1>
      <p style={{ color: 'var(--muted)', marginBottom: 32, fontSize: 14 }}>
        Live demos of data structures and algorithms from ACC applied to the DataPlan search engine.
      </p>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 28,
      }}>
        {[
          { color: colors.avl,      label: 'AVL BST',         sub: 'Sorted retrieval' },
          { color: colors.heap,     label: 'Max-Heap',        sub: 'Top-K ranking' },
          { color: colors.dijkstra, label: "Dijkstra's",      sub: 'Upgrade path' },
          { color: colors.huffman,  label: 'Huffman',         sub: 'Compression' },
        ].map(({ color, label, sub }) => (
          <div key={label} style={{
            padding: '14px 16px', borderRadius: 10, background: `${color}10`,
            border: `1px solid ${color}25`, textAlign: 'center'
          }}>
            <div style={{ fontWeight: 700, color, fontSize: 13 }}>{label}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{sub}</div>
          </div>
        ))}
      </div>

      <AVLSection />
      <HeapSection />
      <DijkstraSection />
      <HuffmanSection />
      <SpellSection />
    </div>
  )
}
