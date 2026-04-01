import { useState } from 'react'
import api from '../api'

export default function CreateLink({ onCreated }) {
  const [url, setUrl] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [maxClicks, setMaxClicks] = useState('')
  const [expireDays, setExpireDays] = useState('')
  const [isOneTime, setIsOneTime] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const payload = {
        original_url: url,
        is_one_time: isOneTime,
        ...(customCode && { custom_code: customCode }),
        ...(maxClicks && { max_clicks: parseInt(maxClicks) }),
        ...(expireDays && { expire_days: parseInt(expireDays) }),
      }
      const res = await api.post('/links', payload)
      setResult(res.data)
      setUrl('')
      setCustomCode('')
      setMaxClicks('')
      setExpireDays('')
      setIsOneTime(false)
      onCreated()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create link')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const inputCls = "w-full bg-white border border-stone-200 text-[#1c1917] rounded-xl px-4 py-2.5 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all duration-150 shadow-sm hover:border-stone-300"

  return (
    <div>
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm font-medium fade-in">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 110 18 9 9 0 010-18z" /></svg>
          {error}
        </div>
      )}

      {result && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 sm:p-5 mb-4 fade-in">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center"><svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
            <p className="text-emerald-800 text-sm font-semibold">Your short link is ready</p>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-[#1c1917] text-sm font-mono bg-white px-4 py-3 rounded-xl border border-stone-200 truncate shadow-sm">{result.short_url}</code>
            <button onClick={() => copyToClipboard(result.short_url)} className="flex items-center gap-1.5 bg-[#1c1917] hover:bg-[#292524] text-white text-xs font-semibold px-4 py-3 rounded-xl transition-all duration-150 flex-shrink-0 active:scale-95">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              Copy
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 group-focus-within:text-amber-500 transition-colors duration-150">
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" /></svg>
            </div>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-white border border-stone-200 text-[#1c1917] rounded-2xl pl-11 pr-4 py-4 text-[15px] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all duration-150 shadow-sm hover:border-stone-300 hover:shadow-md"
              placeholder="Paste any URL to shorten it..." required />
          </div>
          <button type="submit" disabled={loading}
            className="bg-[#1c1917] hover:bg-[#292524] text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-150 disabled:opacity-50 text-[15px] whitespace-nowrap shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.97]">
            {loading ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>Shortening...</> : 'Shorten URL'}
          </button>
        </div>

        <div className="mt-4 flex justify-center">
          <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-[12px] font-medium text-stone-400 hover:text-stone-600 transition-colors duration-150">
            <svg className={`w-3 h-3 transition-transform duration-200 ${showAdvanced ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            Advanced options
          </button>
        </div>

        {showAdvanced && (
          <div className="mt-4 p-5 bg-white rounded-2xl border border-stone-200/80 shadow-sm space-y-4 fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Custom alias</label>
                <div className="flex items-center bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-400 transition-all shadow-sm hover:border-stone-300">
                  <span className="text-stone-400 text-sm mr-0.5">/</span>
                  <input type="text" value={customCode} onChange={(e) => setCustomCode(e.target.value)} className="flex-1 bg-transparent text-[#1c1917] text-sm focus:outline-none placeholder:text-stone-400 min-w-0" placeholder="my-link" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Click limit</label>
                <input type="number" value={maxClicks} onChange={(e) => setMaxClicks(e.target.value)} className={inputCls} placeholder="Unlimited" min="1" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Expires after (days)</label>
                <input type="number" value={expireDays} onChange={(e) => setExpireDays(e.target.value)} className={inputCls} placeholder="Never" min="1" />
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input type="checkbox" checked={isOneTime} onChange={(e) => setIsOneTime(e.target.checked)} className="peer sr-only" />
                <div className="w-9 h-5 bg-stone-200 peer-checked:bg-amber-500 rounded-full transition-colors duration-200" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform duration-200" />
              </div>
              <div>
                <span className="text-sm text-stone-700 font-medium">One-time link</span>
                <p className="text-xs text-stone-400">Self-destructs after the first click</p>
              </div>
            </label>
          </div>
        )}
      </form>
    </div>
  )
}
