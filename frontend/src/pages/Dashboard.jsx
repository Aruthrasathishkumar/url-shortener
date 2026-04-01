import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import CreateLink from '../components/CreateLink'
import LinkCard from '../components/LinkCard'
import BioEditor from './BioEditor'

export default function Dashboard() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showProfile, setShowProfile] = useState(false)
  const navigate = useNavigate()

  const fetchLinks = async () => {
    try {
      const res = await api.get('/links')
      setLinks(res.data)
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token')
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login')
      return
    }
    fetchLinks()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const totalClicks = links.reduce((sum, l) => sum + l.click_count, 0)
  const activeLinks = links.filter((l) => l.is_active).length

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/70 backdrop-blur-2xl border-b border-stone-200/50">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-[56px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-[28px] h-[28px] bg-[#1c1917] rounded-[8px] flex items-center justify-center">
              <svg className="w-[14px] h-[14px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" /></svg>
            </div>
            <span className="text-[15px] font-bold text-[#1c1917] tracking-[-0.01em]">Pathly</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowProfile(true)} className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-200 active:scale-95" title="Profile & Bio">
              <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </button>
            <button onClick={handleLogout} className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all duration-150" title="Sign out">
              <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ HERO — Light, warm, split ═══ */}
      <section className="relative overflow-hidden bg-[#f5f0eb]">
        <div className="absolute top-[-20%] right-[-5%] w-[500px] h-[500px] bg-amber-200/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-30%] left-[5%] w-[400px] h-[400px] bg-orange-200/20 rounded-full blur-[80px]" />

        <div className="relative max-w-[1200px] mx-auto px-5 sm:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Copy + Input */}
            <div>
              <h1 className="text-[36px] sm:text-[50px] font-extrabold text-[#1c1917] leading-[1.06] tracking-[-0.035em]">
                Turn links into<br />
                <span className="text-amber-600">insights.</span>
              </h1>
              <p className="text-stone-500 mt-5 text-[16px] sm:text-[17px] leading-[1.65] max-w-[420px]">
                Shorten any URL, track every click in real time, see where your audience lives, and control exactly how your links behave.
              </p>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {['Click analytics', 'Geo tracking', 'Auto-expiry', 'Custom aliases'].map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <div className="w-[18px] h-[18px] rounded-full bg-amber-100 flex items-center justify-center"><svg className="w-[10px] h-[10px] text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                    <span className="text-stone-500 text-[13px] font-medium">{f}</span>
                  </div>
                ))}
              </div>
              {/* URL Input */}
              <div className="mt-10">
                <CreateLink onCreated={fetchLinks} />
              </div>
            </div>

            {/* Right: Floating UI preview */}
            <div className="hidden lg:block relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100/40 to-orange-100/20 rounded-3xl blur-2xl scale-110" />
              <div className="relative bg-white rounded-2xl border border-stone-200/80 shadow-xl shadow-stone-200/40 p-5 space-y-3">
                {/* Value card 1: Share smarter */}
                <div className="bg-stone-50 rounded-xl px-4 py-4 border border-stone-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" /></svg>
                    </div>
                    <div>
                      <p className="text-[#1c1917] text-[13px] font-bold">Share smarter</p>
                      <p className="text-stone-400 text-[11px] leading-[1.5] mt-0.5">Create clean short links you can copy, track, and manage in seconds.</p>
                    </div>
                  </div>
                </div>

                {/* Value card 2: See what works */}
                <div className="bg-stone-50 rounded-xl px-4 py-4 border border-stone-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-stone-200/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                    </div>
                    <div>
                      <p className="text-[#1c1917] text-[13px] font-bold">See what works</p>
                      <p className="text-stone-400 text-[11px] leading-[1.5] mt-0.5">Understand clicks, devices, referrers, and locations with clear analytics.</p>
                    </div>
                  </div>
                </div>

                {/* Value card 3: Control every link */}
                <div className="bg-stone-50 rounded-xl px-4 py-4 border border-stone-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100/80 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-[#1c1917] text-[13px] font-bold">Control every link</p>
                      <p className="text-stone-400 text-[11px] leading-[1.5] mt-0.5">Set expiry, click limits, one-time access, and custom aliases with ease.</p>
                    </div>
                  </div>
                </div>

                {/* Clicks today chart (kept) */}
                <div className="bg-stone-50 rounded-xl px-4 py-3 border border-stone-100">
                  <p className="text-stone-400 text-[10px] font-semibold uppercase tracking-wide mb-2">Clicks today</p>
                  <div className="flex items-end gap-[3px] h-[36px]">
                    {[30, 45, 20, 60, 80, 55, 90, 40, 70, 85, 50, 65].map((h, i) => (
                      <div key={i} className="flex-1 bg-amber-400/60 rounded-sm" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PRODUCT STORY ═══ */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>, title: 'Track every click', desc: 'Real-time analytics with device, browser, referrer, and geo location data.', bg: 'bg-amber-50', clr: 'text-amber-600' },
            { icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, title: 'Control link behavior', desc: 'Click limits, auto-expiry, one-time links, and custom aliases.', bg: 'bg-stone-100', clr: 'text-stone-600' },
            { icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>, title: 'Link-in-bio pages', desc: 'Build a shareable profile page with all your important links.', bg: 'bg-orange-50', clr: 'text-orange-600' },
          ].map(f => (
            <div key={f.title} className="group bg-white rounded-2xl p-7 sm:p-8 border border-stone-100 hover:shadow-xl hover:shadow-stone-200/40 hover:-translate-y-0.5 transition-all duration-300">
              <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center ${f.clr} mb-5 group-hover:scale-105 transition-transform duration-300`}>{f.icon}</div>
              <h3 className="text-[17px] font-bold text-[#1c1917] mb-2">{f.title}</h3>
              <p className="text-stone-500 text-[14px] leading-[1.7]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pb-8">
        <h2 className="text-[20px] font-bold text-[#1c1917] tracking-[-0.02em] mb-6">Overview</h2>
        <div className="grid grid-cols-3 gap-4 sm:gap-5">
          {[
            { label: 'Links created', value: links.length, color: '#d97706' },
            { label: 'Total clicks', value: totalClicks, color: '#6366f1' },
            { label: 'Active links', value: activeLinks, color: '#10b981' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 sm:p-7 border border-stone-100 hover:shadow-lg hover:shadow-stone-200/40 transition-all duration-200">
              <div className="w-2 h-2 rounded-full mb-4" style={{ backgroundColor: s.color }} />
              <p className="text-[28px] sm:text-[36px] font-extrabold text-[#1c1917] tracking-[-0.03em] leading-none">{s.value}</p>
              <p className="text-[12px] font-semibold text-stone-400 uppercase tracking-[0.05em] mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ LINKS ═══ */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[20px] font-bold text-[#1c1917] tracking-[-0.02em]">Your links</h2>
            <p className="text-stone-400 text-[13px] mt-0.5">Manage, analyze, and share your shortened URLs</p>
          </div>
          {links.length > 0 && <span className="text-[12px] font-bold text-stone-400 bg-stone-100 px-3 py-1 rounded-full">{links.length}</span>}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-28">
            <svg className="animate-spin h-6 w-6 text-amber-500 mb-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
            <p className="text-stone-400 text-sm">Loading your links...</p>
          </div>
        ) : links.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center py-24 px-8">
            <div className="w-[72px] h-[72px] rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" /></svg>
            </div>
            <p className="text-[#1c1917] font-bold text-[18px] mb-2">No links yet</p>
            <p className="text-stone-400 text-[14px] text-center max-w-[340px] leading-[1.6]">Paste any URL in the shortener above to create your first trackable link.</p>
          </div>
        ) : (
          <div className="space-y-3 fade-in">
            {links.map(link => <LinkCard key={link.id} link={link} onRefresh={fetchLinks} />)}
          </div>
        )}
      </section>

      {/* Profile Drawer */}
      {showProfile && (
        <div className="fixed inset-0 z-50 fade-overlay">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowProfile(false)} />
          <div className="absolute top-0 right-0 h-full w-full max-w-[420px] bg-white shadow-2xl shadow-black/5 slide-in-right overflow-y-auto">
            <div className="sticky top-0 bg-white/90 backdrop-blur-xl z-10 px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[#1c1917]">Profile & Bio</h2>
              <button onClick={() => setShowProfile(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all">
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              <BioEditor isDrawer={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
