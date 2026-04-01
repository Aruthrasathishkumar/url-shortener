import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function LinkCard({ link, onRefresh }) {
  const navigate = useNavigate()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [copied, setCopied] = useState(false)

  const fullShortUrl = link.short_url || `http://localhost:8000/${link.short_code}`
  const displayUrl = fullShortUrl.replace('http://', '')

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullShortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await api.delete(`/links/${link.id}`); onRefresh() }
    catch (err) { console.error('Delete failed:', err) }
    finally { setDeleting(false); setShowDeleteModal(false) }
  }

  const getStatusBadge = () => {
    if (!link.is_active) return { label: 'Inactive', cls: 'text-red-600 bg-red-50' }
    if (link.expires_at && new Date(link.expires_at) < new Date()) return { label: 'Expired', cls: 'text-amber-700 bg-amber-50' }
    return { label: 'Live', cls: 'text-emerald-700 bg-emerald-50' }
  }

  const getExpiryText = () => {
    if (!link.expires_at) return null
    const exp = new Date(link.expires_at)
    const now = new Date()
    if (exp < now) return 'Expired'
    const days = Math.ceil((exp - now) / (1000 * 60 * 60 * 24))
    return days <= 1 ? 'Expires today' : `${days}d left`
  }

  const status = getStatusBadge()
  const expiryText = getExpiryText()

  return (
    <>
      <div className="group bg-white rounded-2xl border border-stone-100 p-5 sm:p-6 hover:shadow-lg hover:shadow-stone-200/50 hover:-translate-y-px transition-all duration-300">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap mb-1">
              <button onClick={copyToClipboard} className="text-[16px] font-bold text-[#1c1917] hover:text-amber-600 transition-colors tracking-[-0.01em] truncate text-left" title="Click to copy">
                {displayUrl}
              </button>
              <span className={`text-[10px] font-bold uppercase tracking-[0.05em] px-2 py-[3px] rounded-md ${status.cls}`}>{status.label}</span>
              {link.is_one_time && <span className="text-[10px] font-bold uppercase tracking-[0.05em] px-2 py-[3px] rounded-md text-violet-700 bg-violet-50">One-time</span>}
              {expiryText && <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-[3px] rounded-md">{expiryText}</span>}
            </div>
            <p className="text-[13px] text-stone-400 truncate max-w-lg">{link.original_url}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity duration-200">
            <button onClick={copyToClipboard} className={`w-[36px] h-[36px] rounded-xl flex items-center justify-center transition-all duration-150 active:scale-90 ${copied ? 'bg-emerald-50 text-emerald-600' : 'text-stone-400 hover:text-[#1c1917] hover:bg-stone-100'}`} title={copied ? 'Copied!' : 'Copy'}>
              {copied ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
            </button>
            <button onClick={() => navigate(`/analytics/${link.id}`)} className="w-[36px] h-[36px] rounded-xl flex items-center justify-center text-stone-400 hover:text-amber-600 hover:bg-amber-50 transition-all duration-150 active:scale-90" title="Analytics">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </button>
            <button onClick={() => setShowDeleteModal(true)} className="w-[36px] h-[36px] rounded-xl flex items-center justify-center text-stone-400 hover:text-red-600 hover:bg-red-50 transition-all duration-150 active:scale-90" title="Delete">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-5 text-[12px] text-stone-400">
          <div className="flex items-center gap-1.5"><svg className="w-[14px] h-[14px] text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" /></svg><span className="font-bold text-[#1c1917]">{link.click_count}</span> click{link.click_count !== 1 ? 's' : ''}</div>
          {link.max_clicks && <span>Limit: {link.max_clicks}</span>}
          <span>{new Date(link.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-overlay">
          <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-[380px] w-full fade-in">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-[18px] font-bold text-[#1c1917] text-center mb-2">Delete this link?</h3>
            <p className="text-[14px] text-stone-500 text-center mb-7 leading-[1.6]">This will permanently remove the short link and all its analytics data.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold py-3 rounded-xl transition-all text-[14px] active:scale-[0.98]">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-all text-[14px] disabled:opacity-50 active:scale-[0.98]">{deleting ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
