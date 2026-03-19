import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Auth store ─────────────────────────────────────────
interface AuthState {
  token: string | null; email: string | null; role: string | null
  setAuth: (t: string, e: string, r: string) => void
  logout: () => void
  isAdmin: () => boolean
  isLoggedIn: () => boolean
}
export const useAuthStore = create<AuthState>()(persist((set, get) => ({
  token: null, email: null, role: null,
  setAuth: (token, email, role) => { localStorage.setItem('token', token); set({ token, email, role }) },
  logout:  () => { localStorage.removeItem('token'); set({ token: null, email: null, role: null }) },
  isAdmin:    () => get().role === 'ADMIN',
  isLoggedIn: () => !!get().token,
}), { name: 'auth' }))

// ── Compare store ──────────────────────────────────────
export interface Plan {
  id: number; name: string; carrier: string; price: number; dataGb: number
  networkType: string; features: string; speed: string; planUrl?: string
  isFeatured?: boolean; scrapedAt?: string; recommendationReason?: string
}
interface CompareState {
  plans: Plan[]
  add:    (p: Plan)   => void
  remove: (id: number) => void
  clear:  ()           => void
  has:    (id: number) => boolean
}
export const useCompareStore = create<CompareState>((set, get) => ({
  plans: [],
  add:    p  => { if (get().plans.length < 4 && !get().has(p.id)) set(s => ({ plans: [...s.plans, p] })) },
  remove: id => set(s => ({ plans: s.plans.filter(p => p.id !== id) })),
  clear:  ()  => set({ plans: [] }),
  has:    id => get().plans.some(p => p.id === id),
}))
