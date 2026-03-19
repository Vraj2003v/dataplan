import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'
import { useAuthStore } from '../store'
import { Wifi, Eye, EyeOff } from 'lucide-react'

function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow]         = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { setAuth }             = useAuthStore()
  const nav                     = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const fn = mode === 'login' ? authApi.login : authApi.register
      const res = await fn(email, password)
      setAuth(res.data.token, res.data.email, res.data.role)
      nav('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Check your credentials.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 13,
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
          }}>
            <Wifi size={22} color="white" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 6, fontSize: 13 }}>
            {mode === 'login' ? 'Sign in to DataPlanCA' : 'Start comparing plans for free'}
          </p>
        </div>

        <div className="card" style={{ padding: 26 }}>
          <form onSubmit={submit}>
            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 5 }}>
                Email address
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="you@example.com"
                style={{ width: '100%', padding: '10px 13px', fontSize: 14 }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 5 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={show ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  required placeholder="••••••••" minLength={6}
                  style={{ width: '100%', padding: '10px 40px 10px 13px', fontSize: 14 }}
                />
                <button type="button" onClick={() => setShow(!show)} style={{
                  position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 0,
                }}>
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginBottom: 14, padding: '9px 13px', borderRadius: 8, fontSize: 13,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5',
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '11px', fontSize: 14, justifyContent: 'center' }}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{ marginTop: 18, textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
            {mode === 'login'
              ? <>No account? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign up free</Link></>
              : <>Already registered? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link></>}
          </div>

          {mode === 'login' && (
            <div style={{
              marginTop: 18, padding: '11px 13px', borderRadius: 8, fontSize: 12,
              background: 'rgba(79,110,247,0.07)', border: '1px solid rgba(79,110,247,0.2)', color: 'var(--muted)',
              lineHeight: 1.7,
            }}>
              <strong style={{ color: 'var(--accent)' }}>Demo accounts:</strong><br />
              Admin: <code style={{ fontFamily: 'JetBrains Mono,monospace' }}>admin@dataplan.com</code> / <code style={{ fontFamily: 'JetBrains Mono,monospace' }}>admin123</code><br />
              User: <code style={{ fontFamily: 'JetBrains Mono,monospace' }}>user@dataplan.com</code> / <code style={{ fontFamily: 'JetBrains Mono,monospace' }}>user123</code>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function LoginPage()    { return <AuthForm mode="login" /> }
export function RegisterPage() { return <AuthForm mode="register" /> }
