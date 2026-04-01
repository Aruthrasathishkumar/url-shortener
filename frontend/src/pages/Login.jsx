import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', res.data.access_token)
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#faf9f7]">
      {/* Brand panel — warm light */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden items-center justify-center bg-[#f5f0eb]">
        <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] bg-amber-200/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] bg-indigo-200/20 rounded-full blur-[80px]" />
        <div className="relative z-10 max-w-[440px] px-12">
          <div className="flex items-center gap-2.5 mb-14">
            <div className="w-8 h-8 bg-[#1c1917] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" /></svg>
            </div>
            <span className="text-[16px] font-bold text-[#1c1917] tracking-[-0.01em]">Pathly</span>
          </div>
          <h1 className="text-[40px] font-extrabold text-[#1c1917] leading-[1.08] tracking-[-0.035em] mb-5">
            Every link<br />tells a story.
          </h1>
          <p className="text-stone-500 text-[16px] leading-[1.65] mb-12">
            Shorten any URL, track every click, and understand exactly where your audience comes from.
          </p>
          <div className="space-y-4">
            {['Real-time click & geo analytics', 'Custom aliases & auto-expiry', 'Shareable link-in-bio profiles'].map(t => (
              <div key={t} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0"><svg className="w-3 h-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                <span className="text-stone-600 text-[13px] font-medium">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[380px] fade-in">
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-[#1c1917] rounded-lg flex items-center justify-center"><svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" /></svg></div>
            <span className="text-[16px] font-bold text-[#1c1917]">Pathly</span>
          </div>
          <h2 className="text-[28px] font-extrabold text-[#1c1917] tracking-[-0.02em]">Welcome back</h2>
          <p className="text-stone-400 mt-2 text-[15px]">Sign in to your account</p>
          {error && <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mt-6 text-sm font-medium"><svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 110 18 9 9 0 010-18z" /></svg>{error}</div>}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-[13px] font-semibold text-stone-600 mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white border border-stone-200 text-[#1c1917] rounded-xl px-4 py-3.5 text-[15px] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all duration-150 shadow-sm hover:border-stone-300" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-stone-600 mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white border border-stone-200 text-[#1c1917] rounded-xl px-4 py-3.5 text-[15px] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all duration-150 shadow-sm hover:border-stone-300" placeholder="Enter your password" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#1c1917] hover:bg-[#292524] text-white font-semibold py-3.5 rounded-xl transition-all duration-150 disabled:opacity-50 text-[15px] shadow-sm hover:shadow-md active:scale-[0.98]">
              {loading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>Signing in...</span> : 'Sign in'}
            </button>
          </form>
          <p className="text-stone-400 text-sm text-center mt-8">Don't have an account? <Link to="/register" className="text-amber-600 hover:text-amber-700 font-semibold transition-colors">Create one</Link></p>
        </div>
      </div>
    </div>
  )
}
