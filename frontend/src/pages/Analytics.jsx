import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api'

export default function Analytics() {
  const { linkId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return }
    fetchAnalytics()
  }, [linkId])

  const fetchAnalytics = async () => {
    try { const res = await api.get(`/links/${linkId}/analytics`); setData(res.data) }
    catch (err) { setError('Failed to load analytics') }
    finally { setLoading(false) }
  }

  if (loading) return <div className="min-h-screen bg-[#faf9f7] flex flex-col items-center justify-center gap-3"><svg className="animate-spin h-6 w-6 text-amber-500" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg><p className="text-stone-400 text-sm">Loading analytics...</p></div>
  if (error) return <div className="min-h-screen bg-[#faf9f7] flex flex-col items-center justify-center gap-4 px-6"><div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center"><svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 110 18 9 9 0 010-18z" /></svg></div><p className="text-red-600 text-sm font-semibold">{error}</p><Link to="/dashboard" className="text-amber-600 hover:text-amber-700 text-sm font-semibold">Back to dashboard</Link></div>

  const maxHourly = Math.max(...data.hourly.map(h => h.clicks), 1)
  const maxDevice = Math.max(...data.devices.map(d => d.count), 1)
  const locations = data.locations || []
  const cities = data.cities || []

  const Section = ({ title, desc, children }) => (
    <div className="mb-14">
      <h2 className="text-[20px] font-bold text-[#1c1917] tracking-[-0.02em] mb-1">{title}</h2>
      {desc && <p className="text-[13px] text-stone-400 mb-6">{desc}</p>}
      {children}
    </div>
  )

  const Card = ({ title, children, className = '' }) => (
    <div className={`bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-lg hover:shadow-stone-200/40 transition-all duration-300 ${className}`}>
      {title && <div className="px-6 py-4 border-b border-stone-100"><h3 className="text-[14px] font-bold text-[#1c1917]">{title}</h3></div>}
      <div className="p-6">{children}</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-stone-200/50">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-[56px] flex items-center justify-between">
          <div className="flex items-center gap-2.5"><div className="w-[28px] h-[28px] bg-[#1c1917] rounded-[8px] flex items-center justify-center"><svg className="w-[14px] h-[14px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" /></svg></div><span className="text-[15px] font-bold text-[#1c1917]">Pathly</span></div>
          <Link to="/dashboard" className="flex items-center gap-1.5 text-stone-400 hover:text-[#1c1917] text-[13px] font-semibold transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>Dashboard</Link>
        </div>
      </nav>

      {/* Page header */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-10 sm:py-14">
          <h1 className="text-[28px] sm:text-[36px] font-extrabold text-[#1c1917] tracking-[-0.03em]">Link Analytics</h1>
          <p className="text-stone-400 mt-2 text-[15px] sm:text-[16px]">Real-time performance data for your link. Clicks, devices, locations, and referrers.</p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-10 sm:py-14 fade-in">
        {/* KPIs */}
        <Section title="Overview">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total clicks', value: data.total_clicks },
              { label: 'Top device', value: data.devices[0]?.device || '—', cap: true },
              { label: 'Top source', value: data.referrers[0]?.referrer || 'direct' },
              { label: 'Top country', value: locations[0]?.country || '—' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-stone-100 p-5 sm:p-6 hover:shadow-lg hover:shadow-stone-200/40 transition-all duration-200">
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-[0.05em] mb-2">{s.label}</p>
                <p className={`text-[24px] sm:text-[28px] font-extrabold text-[#1c1917] tracking-[-0.02em] truncate ${s.cap ? 'capitalize' : ''}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Traffic */}
        <Section title="Traffic patterns" desc="When and how people click your link">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card title="Clicks by hour">
              {data.total_clicks === 0 ? <p className="text-stone-400 text-sm text-center py-12">No click data yet</p> : (
                <div className="flex items-end gap-[2px] sm:gap-[3px] h-[160px] sm:h-[200px]">
                  {data.hourly.map(h => (
                    <div key={h.hour} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-[#1c1917] text-white text-[11px] px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-10">{h.hour}:00 — {h.clicks} click{h.clicks !== 1 ? 's' : ''}</div>
                      <div className="w-full rounded-[3px] transition-all duration-150 cursor-pointer hover:opacity-80" style={{ height: `${(h.clicks / maxHourly) * 100}%`, minHeight: h.clicks > 0 ? '4px' : '2px', backgroundColor: h.clicks > 0 ? '#d97706' : '#f5f0eb' }} />
                      {h.hour % 6 === 0 && <span className="text-[10px] text-stone-400 font-mono">{String(h.hour).padStart(2, '0')}</span>}
                    </div>
                  ))}
                </div>
              )}
            </Card>
            <Card title="Devices">
              {data.devices.length === 0 ? <p className="text-stone-400 text-sm text-center py-12">No data yet</p> : (
                <div className="space-y-6">
                  {data.devices.map((d, i) => {
                    const pct = ((d.count / data.total_clicks) * 100).toFixed(0)
                    return (<div key={i}><div className="flex justify-between mb-2"><span className="text-[13px] font-semibold text-stone-700 capitalize">{d.device}</span><span className="text-[13px] font-bold text-[#1c1917]">{pct}%</span></div><div className="w-full bg-stone-100 rounded-full h-[8px] overflow-hidden"><div className="h-[8px] rounded-full transition-all duration-700" style={{ width: `${(d.count / maxDevice) * 100}%`, backgroundColor: ['#d97706', '#6366f1', '#8b5cf6'][i] || '#6366f1' }} /></div></div>)
                  })}
                </div>
              )}
            </Card>
          </div>
        </Section>

        {/* Audience */}
        <Section title="Audience signals" desc="Where your visitors come from and what browsers they use">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card title="Referrers">
              {data.referrers.length === 0 ? <p className="text-stone-400 text-sm text-center py-10">No data yet</p> : (
                <div className="space-y-4">{data.referrers.map((r, i) => (
                  <div key={i} className="flex items-center justify-between gap-4"><span className="text-[13px] text-stone-700 truncate min-w-0 font-medium">{r.referrer}</span><div className="flex items-center gap-3 flex-shrink-0"><div className="w-[80px] bg-stone-100 rounded-full h-[5px] overflow-hidden"><div className="bg-amber-500 h-[5px] rounded-full" style={{ width: `${(r.count / data.total_clicks) * 100}%` }} /></div><span className="text-[13px] text-stone-500 font-mono w-7 text-right">{r.count}</span></div></div>
                ))}</div>
              )}
            </Card>
            <Card title="Browsers">
              {data.browsers.length === 0 ? <p className="text-stone-400 text-sm text-center py-10">No data yet</p> : (
                <div className="space-y-4">{data.browsers.map((b, i) => {
                  const browserColors = ['#92400e', '#a16207', '#b45309', '#c2410c', '#78716c']
                  return (
                  <div key={i} className="flex items-center justify-between gap-4"><span className="text-[13px] text-stone-700 truncate min-w-0 font-medium">{b.browser}</span><div className="flex items-center gap-3 flex-shrink-0"><div className="w-[80px] bg-stone-100 rounded-full h-[5px] overflow-hidden"><div className="h-[5px] rounded-full" style={{ width: `${(b.count / data.total_clicks) * 100}%`, backgroundColor: browserColors[i] || '#a8a29e' }} /></div><span className="text-[13px] text-stone-500 font-mono w-7 text-right">{b.count}</span></div></div>
                )})}</div>
              )}
            </Card>
          </div>
        </Section>

        {/* Locations */}
        <Section title="Locations" desc="Where in the world your clicks originate">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card title="Top countries">
              {locations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3"><svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" /></svg></div>
                  <p className="text-stone-400 text-[13px]">Location data appears after clicks from external IPs</p>
                </div>
              ) : (
                <div className="space-y-4">{locations.map((l, i) => {
                  const maxLoc = locations[0]?.count || 1
                  return (<div key={i} className="flex items-center gap-3"><span className="text-[20px] w-8 text-center">{getFlagEmoji(l.country)}</span><div className="flex-1 min-w-0"><div className="flex justify-between mb-1.5"><span className="text-[13px] font-semibold text-stone-700">{l.country}</span><span className="text-[13px] font-bold text-[#1c1917]">{l.count}</span></div><div className="w-full bg-stone-100 rounded-full h-[5px] overflow-hidden"><div className="bg-cyan-500 h-[5px] rounded-full" style={{ width: `${(l.count / maxLoc) * 100}%` }} /></div></div></div>)
                })}</div>
              )}
            </Card>
            <Card title="Top cities">
              {cities.length === 0 ? (
                <div className="text-center py-12"><p className="text-stone-400 text-[13px]">City-level data appears after external clicks</p></div>
              ) : (
                <div className="space-y-4">{cities.map((c, i) => (
                  <div key={i} className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 min-w-0"><span className="text-[14px]">{getFlagEmoji(c.country)}</span><span className="text-[13px] text-stone-700 font-medium truncate">{c.city}</span></div><span className="text-[13px] font-bold text-[#1c1917] flex-shrink-0">{c.count}</span></div>
                ))}</div>
              )}
            </Card>
          </div>
        </Section>
      </div>
    </div>
  )
}

function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '🌍'
  const codePoints = countryCode.toUpperCase().split('').map(c => 127397 + c.charCodeAt())
  return String.fromCodePoint(...codePoints)
}
