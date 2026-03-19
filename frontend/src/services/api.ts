import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL + '/api'
    : '/api'
})

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }
  return Promise.reject(err)
})

export const authApi = {
  login:    (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (email: string, password: string) => api.post('/auth/register', { email, password }),
}

export const plansApi = {
  getAll:       ()                           => api.get('/plans'),
  getFeatured:  ()                           => api.get('/plans/featured'),
  getBest:      (c: string)                  => api.get(`/plans/best?criteria=${c}`),
  getByCarrier: (c: string)                  => api.get(`/carriers/${c}/plans`),
  search:       (query: string)              => api.post('/search', { query }),
  complete:     (prefix: string)             => api.get(`/search/complete?prefix=${encodeURIComponent(prefix)}`),
  spellAll:     (word: string)               => api.get(`/search/spell?word=${encodeURIComponent(word)}`),
  frequency:    ()                           => api.get('/search/frequency'),
  scrape:       (c: string)                  => api.post(`/scrape/${c}`),
  scrapeAll:    ()                           => api.post('/scrape/all'),
  create:       (d: any)                     => api.post('/admin/plans', d),
  update:       (id: number, d: any)         => api.put(`/admin/plans/${id}`, d),
  remove:       (id: number)                 => api.delete(`/admin/plans/${id}`),
  stats:        ()                           => api.get('/admin/stats'),
  sortedPlans:  (by: string, minP?: number, maxP?: number) => {
    const params: any = { by }
    if (minP !== undefined) params.minPrice = minP
    if (maxP !== undefined) params.maxPrice = maxP
    return api.get('/plans/sorted', { params })
  },
  rankedPlans:  (criteria: string, top: number) => api.get(`/plans/ranked?criteria=${criteria}&top=${top}`),
  upgradePath:  (fromId: string, toId: string)  => api.get(`/plans/upgrade-path?fromId=${fromId}&toId=${toId}`),
  compress:     (text: string)                  => api.post('/plans/compress', { text }),
}

export const crawlerApi = {
  crawl:      (url: string, maxPages: number) => api.post('/crawler/crawl', { url, maxPages, maxDepth: 2 }),
  frequency:  (word: string)                  => api.get(`/crawler/frequency?word=${encodeURIComponent(word)}`),
  topWords:   (limit = 20)                    => api.get(`/crawler/frequency/top?limit=${limit}`),
  rank:       (keyword: string)               => api.get(`/crawler/rank?keyword=${encodeURIComponent(keyword)}`),
  buildIndex: ()                              => api.post('/crawler/index/build'),
  lookup:     (word: string)                  => api.get(`/crawler/index?word=${encodeURIComponent(word)}`),
}

export default api