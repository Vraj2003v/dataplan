import { useCompareStore, Plan } from '../store'
import { Link } from 'react-router-dom'
import { Trash2, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, Legend } from 'recharts'

const COL: Record<string,string> = { BELL:'#3b82f6', ROGERS:'#ef4444', FREEDOM:'#22c55e', FIDO:'#f97316', TELUS:'#a855f7' }
const tt = { contentStyle:{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,color:'white' } }

export default function ComparePage() {
  const { plans, remove, clear } = useCompareStore()

  if (plans.length === 0) return (
    <div style={{ maxWidth: 700, margin: '80px auto', padding: '0 22px', textAlign: 'center' }}>
      <div style={{ fontSize: 56, marginBottom: 18 }}>📊</div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 10 }}>Nothing to compare yet</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 26 }}>Click "Compare" on any plan card — up to 4 at once.</p>
      <Link to="/plans" className="btn btn-primary" style={{ textDecoration: 'none' }}>Browse Plans</Link>
    </div>
  )

  const minPrice = Math.min(...plans.map(p => p.price))
  const maxData  = Math.max(...plans.map(p => p.dataGb === -1 ? 9999 : p.dataGb))

  const rows = [
    { label:'Monthly Price',   key:'price',       fmt:(v:any)=>`$${v}/mo`,       win:(p:Plan)=>p.price===minPrice },
    { label:'Data Allowance',  key:'dataGb',      fmt:(v:any)=>v===-1?'Unlimited':`${v}GB`, win:(p:Plan)=>(p.dataGb===-1?9999:p.dataGb)===maxData },
    { label:'Network',         key:'networkType', fmt:(v:any)=>v||'—',            win:(p:Plan)=>!!p.networkType?.includes('5G') },
    { label:'Features',        key:'features',    fmt:(v:any)=>v||'—',            win:()=>false },
  ]

  const barData = plans.map(p => ({ name:p.carrier, Price:p.price, Data:p.dataGb===-1?100:p.dataGb }))
  const radarData = [
    { subject:'Value',   ...Object.fromEntries(plans.map(p=>[p.carrier, Math.max(0, 120-p.price)])) },
    { subject:'Data',    ...Object.fromEntries(plans.map(p=>[p.carrier, p.dataGb===-1?100:Math.min(100,p.dataGb*2)])) },
    { subject:'5G',      ...Object.fromEntries(plans.map(p=>[p.carrier, p.networkType?.includes('5G')?100:35])) },
  ]

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '44px 22px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:30 }}>
        <div>
          <h1 style={{ fontSize:28, fontWeight:800, color:'white', letterSpacing:'-1px' }}>Compare Plans</h1>
          <p style={{ color:'var(--muted)', marginTop:5, fontSize:14 }}>{plans.length} plans selected (max 4)</p>
        </div>
        <button onClick={clear} className="btn btn-ghost" style={{ color:'#f87171', borderColor:'rgba(239,68,68,0.3)' }}>
          <Trash2 size={13} /> Clear all
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow:'auto', marginBottom:24 }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ borderBottom:'1px solid var(--border)' }}>
              <th style={{ padding:'14px 18px', textAlign:'left', color:'var(--muted)', fontWeight:500, width:140 }}>Feature</th>
              {plans.map(p => (
                <th key={p.id} style={{ padding:'14px 18px', textAlign:'center' }}>
                  <span style={{
                    display:'inline-block', padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:700,
                    background:`${COL[p.carrier]||'var(--accent)'}22`, color:COL[p.carrier]||'var(--accent)',
                    border:`1px solid ${COL[p.carrier]||'var(--accent)'}44`, marginBottom:5,
                  }}>{p.carrier}</span>
                  <div style={{ fontWeight:700, color:'white', fontSize:13 }}>{p.name}</div>
                  <button onClick={()=>remove(p.id)} style={{ marginTop:5, background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:11, fontFamily:'Syne,sans-serif', display:'flex', alignItems:'center', gap:3, margin:'4px auto 0' }}>
                    <XCircle size={10} /> Remove
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.key} style={{ borderBottom:'1px solid var(--border)' }}>
                <td style={{ padding:'12px 18px', color:'var(--muted)', fontWeight:500 }}>{row.label}</td>
                {plans.map(p => {
                  const val = (p as any)[row.key]
                  const isWin = row.win(p)
                  return (
                    <td key={p.id} style={{ padding:'12px 18px', textAlign:'center', background:isWin?'rgba(34,197,94,0.05)':'transparent' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                        {isWin && <CheckCircle size={12} color="#22c55e" />}
                        <span style={{
                          color:isWin?'#22c55e':'var(--text)', fontWeight:isWin?700:400,
                          fontFamily:row.key==='price'||row.key==='dataGb'?'JetBrains Mono,monospace':'Syne,sans-serif',
                          fontSize:row.key==='features'?11:13, maxWidth:row.key==='features'?180:undefined,
                          display:'block', textAlign:'center',
                          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:row.key==='features'?'normal':'nowrap',
                        }}>{row.fmt(val)}</span>
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
            <tr>
              <td style={{ padding:'12px 18px', color:'var(--muted)' }}>Link</td>
              {plans.map(p => (
                <td key={p.id} style={{ padding:'12px 18px', textAlign:'center' }}>
                  {p.planUrl
                    ? <a href={p.planUrl} target="_blank" rel="noopener noreferrer" style={{ color:'var(--accent)', fontSize:12, display:'inline-flex', alignItems:'center', gap:4 }}><ExternalLink size={11}/> View</a>
                    : '—'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Charts */}
      {plans.length >= 2 && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div className="card" style={{ padding:22 }}>
            <h3 style={{ fontWeight:700, color:'white', marginBottom:18, fontSize:14 }}>Price vs Data</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fill:'#7b82a8', fontSize:11 }} />
                <YAxis tick={{ fill:'#7b82a8', fontSize:11 }} />
                <Tooltip {...tt} />
                <Legend wrapperStyle={{ color:'#7b82a8', fontSize:11 }} />
                <Bar dataKey="Price" fill="#4f6ef7" radius={[4,4,0,0]} />
                <Bar dataKey="Data"  fill="#22c55e" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card" style={{ padding:22 }}>
            <h3 style={{ fontWeight:700, color:'white', marginBottom:18, fontSize:14 }}>Overall Score</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill:'#7b82a8', fontSize:11 }} />
                {plans.map(p => (
                  <Radar key={p.id} name={p.carrier} dataKey={p.carrier}
                    stroke={COL[p.carrier]||'#4f6ef7'} fill={COL[p.carrier]||'#4f6ef7'} fillOpacity={0.13} />
                ))}
                <Legend wrapperStyle={{ color:'#7b82a8', fontSize:11 }} />
                <Tooltip {...tt} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
