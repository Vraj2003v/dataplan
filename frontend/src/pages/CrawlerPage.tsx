import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { crawlerApi } from '../services/api'
import { Globe, BarChart2, Search, BookOpen, Play, Loader } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const tt = { contentStyle: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, color: 'white' } }

export default function CrawlerPage() {
  const [url, setUrl]           = useState('https://www.freedommobile.ca/en-CA/plans')
  const [maxPages, setMax]      = useState(10)
  const [crawlRes, setCrawlRes] = useState<any>(null)
  const [crawling, setCrawling] = useState(false)

  const [freqWord, setFreqWord] = useState('unlimited')
  const [freqRes, setFreqRes]   = useState<Record<string,number> | null>(null)
  const [freqLoad, setFreqLoad] = useState(false)

  const [rankKw, setRankKw]     = useState('5g')
  const [rankRes, setRankRes]   = useState<any[]>([])
  const [rankLoad, setRankLoad] = useState(false)

  const [idxWord, setIdxWord]   = useState('plan')
  const [idxRes, setIdxRes]     = useState<any[]>([])
  const [idxLoad, setIdxLoad]   = useState(false)
  const [building, setBuilding] = useState(false)

  const { data: topWords = {} } = useQuery({
    queryKey: ['topWords'],
    queryFn: () => crawlerApi.topWords(15).then(r => r.data),
    retry: false,
  })

  const topChart = Object.entries(topWords as Record<string,number>)
    .map(([word, count]) => ({ word, count })).slice(0, 15)

  const runCrawl = async () => {
    setCrawling(true); setCrawlRes(null)
    try { setCrawlRes((await crawlerApi.crawl(url, maxPages)).data) }
    catch (e: any) { setCrawlRes({ error: e.response?.data?.error || e.message }) }
    finally { setCrawling(false) }
  }

  const runFreq = async () => {
    setFreqLoad(true)
    try { setFreqRes((await crawlerApi.frequency(freqWord)).data) }
    catch { setFreqRes({}) }
    finally { setFreqLoad(false) }
  }

  const runRank = async () => {
    setRankLoad(true)
    try { setRankRes((await crawlerApi.rank(rankKw)).data) }
    catch { setRankRes([]) }
    finally { setRankLoad(false) }
  }

  const buildAndLookup = async () => {
    setBuilding(true)
    try { await crawlerApi.buildIndex() } catch {}
    setBuilding(false)
    setIdxLoad(true)
    try { setIdxRes((await crawlerApi.lookup(idxWord)).data) }
    catch { setIdxRes([]) }
    finally { setIdxLoad(false) }
  }

  const Section = ({ icon, color, title, children }: any) => (
    <div className="card" style={{ padding: 22, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'white', fontSize: 15, marginBottom: 16 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        {title}
      </div>
      {children}
    </div>
  )

  const Row = ({ children }: any) => (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>{children}</div>
  )

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '44px 22px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 6, letterSpacing: '-1px' }}>Web Crawler & Analytics</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 32, fontSize: 14 }}>
        Crawl any website, then analyse keyword frequency, rank pages, and build an inverted index.
      </p>

      {/* Top Words Chart */}
      {topChart.length > 0 && (
        <div className="card" style={{ padding: 22, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: 'white', fontSize: 14, marginBottom: 16 }}>Top Keywords in Crawled Data</div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={topChart}>
              <XAxis dataKey="word" tick={{ fill: '#7b82a8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#7b82a8', fontSize: 10 }} />
              <Tooltip {...tt} />
              <Bar dataKey="count" fill="#4f6ef7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 1. Crawler */}
      <Section icon={<Globe size={14} color="#22c55e" />} color="#22c55e" title="1. Web Crawler (BFS)">
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
          Crawls all links from a seed URL using Breadth-First Search and saves each page to a .txt file.
        </p>
        <Row>
          <input value={url} onChange={e => setUrl(e.target.value)}
            style={{ flex: 1, minWidth: 260, padding: '9px 12px', fontSize: 13 }}
            placeholder="https://..." />
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--muted)' }}>
            Pages:
            <input type="number" value={maxPages} onChange={e => setMax(+e.target.value)}
              min={1} max={30} style={{ width: 56, padding: '8px 10px', fontSize: 13, textAlign: 'center' }} />
          </div>
          <button onClick={runCrawl} disabled={crawling} className="btn btn-primary">
            {crawling ? <><Loader size={13} className="spin" /> Crawling…</> : <><Play size={13} /> Start Crawl</>}
          </button>
        </Row>
        {crawlRes && (
          <div style={{
            marginTop: 12, padding: '10px 14px', borderRadius: 8, fontSize: 13,
            background: crawlRes.error ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
            border: `1px solid ${crawlRes.error ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
            color: crawlRes.error ? '#fca5a5' : '#86efac',
          }}>
            {crawlRes.error
              ? `Error: ${crawlRes.error}`
              : `✓ Crawled ${crawlRes.pagesCount} pages → ${crawlRes.outputDir}`}
          </div>
        )}
      </Section>

      {/* 2. Frequency */}
      <Section icon={<BarChart2 size={14} color="#f59e0b" />} color="#f59e0b" title="2. Keyword Frequency Count">
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
          Counts how often a word appears in each crawled file using a HashMap. Results sorted by frequency.
        </p>
        <Row>
          <input value={freqWord} onChange={e => setFreqWord(e.target.value)}
            style={{ width: 200, padding: '9px 12px', fontSize: 13 }}
            placeholder="e.g. unlimited"
            onKeyDown={e => e.key === 'Enter' && runFreq()} />
          <button onClick={runFreq} disabled={freqLoad} className="btn btn-primary">
            {freqLoad ? 'Counting…' : 'Count Frequency'}
          </button>
        </Row>
        {freqRes !== null && (
          <div style={{ marginTop: 14 }}>
            {Object.keys(freqRes).length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: 13 }}>No results. Crawl some pages first, then search.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 8 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '7px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>File</th>
                    <th style={{ padding: '7px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(freqRes).map(([file, count]) => (
                    <tr key={file} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '7px 12px', fontFamily: 'JetBrains Mono,monospace', color: 'var(--accent)', fontSize: 12 }}>{file}</td>
                      <td style={{ padding: '7px 12px', textAlign: 'right', fontWeight: 700, fontFamily: 'JetBrains Mono,monospace' }}>{count as number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Section>

      {/* 3. Page Ranking */}
      <Section icon={<Search size={14} color="#8b5cf6" />} color="#8b5cf6" title="3. Page Ranking (TF-IDF)">
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
          Ranks pages using <strong style={{ color: 'white' }}>TF-IDF scoring</strong>: 
          TF = term_freq / doc_length, IDF = log(total_docs / docs_with_term + 1). 
          Max-Heap extracts top pages in O(n log k).
        </p>
        <Row>
          <input value={rankKw} onChange={e => setRankKw(e.target.value)}
            style={{ width: 200, padding: '9px 12px', fontSize: 13 }}
            placeholder="e.g. 5g"
            onKeyDown={e => e.key === 'Enter' && runRank()} />
          <button onClick={runRank} disabled={rankLoad} className="btn btn-primary">
            {rankLoad ? 'Ranking…' : 'Rank Pages'}
          </button>
        </Row>
        {rankRes.length > 0 && (
          <div style={{ marginTop: 14 }}>
            {rankRes.map((r, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>#{i + 1}</span>
                    <span style={{ fontFamily: 'JetBrains Mono,monospace', color: 'var(--accent)', fontSize: 12 }}>{r.filename}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10,
                      background: 'rgba(139,92,246,0.15)', color: '#d8b4fe', border: '1px solid rgba(139,92,246,0.3)',
                    }}>TF-IDF: {r.score}</span>
                    <span style={{ fontSize: 10, color: 'var(--muted)' }}>TF:{r.tf} · IDF:{r.idf}</span>
                  </div>
                  {r.snippet && (
                    <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, marginLeft: 20, lineHeight: 1.5 }}>{r.snippet}</p>
                  )}
                </div>
                <span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono,monospace', color: 'white', fontSize: 13, flexShrink: 0 }}>{r.frequency}×</span>
              </div>
            ))}
          </div>
        )}
        {rankRes.length === 0 && rankLoad === false && rankKw && (
          <p style={{ marginTop: 12, color: 'var(--muted)', fontSize: 13 }}>No pages ranked. Crawl first.</p>
        )}
      </Section>

      {/* 4. Inverted Index */}
      <Section icon={<BookOpen size={14} color="#ec4899" />} color="#ec4899" title="4. Inverted Index Lookup">
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
          Builds an in-memory HashMap mapping every word → {'{'}file, line, char position{'}'}. Click the button to build the index then search.
        </p>
        <Row>
          <input value={idxWord} onChange={e => setIdxWord(e.target.value)}
            style={{ width: 200, padding: '9px 12px', fontSize: 13 }}
            placeholder="e.g. plan"
            onKeyDown={e => e.key === 'Enter' && buildAndLookup()} />
          <button onClick={buildAndLookup} disabled={building || idxLoad} className="btn btn-primary">
            {building ? <><Loader size={13} className="spin" /> Building…</> : idxLoad ? 'Searching…' : 'Build Index & Lookup'}
          </button>
        </Row>
        {idxRes.length > 0 && (
          <div style={{ marginTop: 14, maxHeight: 300, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead style={{ position: 'sticky', top: 0, background: 'var(--card)' }}>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['File', 'Line', 'Char Pos', 'Snippet'].map(h => (
                    <th key={h} style={{ padding: '7px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {idxRes.slice(0, 60).map((e, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '5px 12px', fontFamily: 'JetBrains Mono,monospace', color: 'var(--accent)', fontSize: 11 }}>{e.filename}</td>
                    <td style={{ padding: '5px 12px', fontFamily: 'JetBrains Mono,monospace', color: '#fde047', fontSize: 11 }}>{e.lineNumber}</td>
                    <td style={{ padding: '5px 12px', fontFamily: 'JetBrains Mono,monospace', color: '#fdba74', fontSize: 11 }}>{e.charPosition}</td>
                    <td style={{ padding: '5px 12px', color: 'var(--muted)', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.snippet}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {idxRes.length > 60 && (
              <p style={{ padding: '8px 12px', color: 'var(--muted)', fontSize: 12 }}>Showing 60 of {idxRes.length} results</p>
            )}
          </div>
        )}
        {idxRes.length === 0 && !idxLoad && !building && (
          <p style={{ marginTop: 12, color: 'var(--muted)', fontSize: 13 }}>Crawl pages first, then build the index.</p>
        )}
      </Section>
    </div>
  )
}
