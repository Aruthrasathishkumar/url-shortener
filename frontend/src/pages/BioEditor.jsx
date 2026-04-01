import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

export default function BioEditor({ isDrawer = false }) {
  const navigate = useNavigate()
  const [bio, setBio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [bioTitle, setBioTitle] = useState('')
  const [bioDesc, setBioDesc] = useState('')
  const [themeColor, setThemeColor] = useState('#6366f1')
  const [newLinkTitle, setNewLinkTitle] = useState('')
  const [newLinkUrl, setNewLinkUrl] = useState('')
  const [newLinkIcon, setNewLinkIcon] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [shareToast, setShareToast] = useState(false)
  const shareGuard = useRef(false)

  useEffect(() => {
    if (!isDrawer && !localStorage.getItem('token')) { navigate('/login'); return }
    fetchBio()
  }, [])

  const fetchBio = async () => {
    try {
      const res = await api.get('/bio/me')
      if (res.data) { setBio(res.data); setBioTitle(res.data.bio_title || ''); setBioDesc(res.data.bio_description || ''); setThemeColor(res.data.theme_color || '#6366f1') }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try { await api.post('/bio', { username, bio_title: bioTitle, bio_description: bioDesc, theme_color: themeColor }); setSuccess('Bio page created!'); fetchBio() }
    catch (err) { setError(err.response?.data?.detail || 'Failed to create') }
    finally { setSaving(false) }
  }

  const handleUpdate = async (e) => {
    e.preventDefault(); setSaving(true); setError(''); setSuccess('')
    try { await api.put('/bio/me', { bio_title: bioTitle, bio_description: bioDesc, theme_color: themeColor }); setSuccess('Updated!'); fetchBio(); setIsEditing(false) }
    catch (err) { setError(err.response?.data?.detail || 'Failed to update') }
    finally { setSaving(false) }
  }

  const handleAddLink = async (e) => {
    e.preventDefault(); setError('')
    try { await api.post('/bio/links', { title: newLinkTitle, url: newLinkUrl, icon: newLinkIcon || null, display_order: bio?.links?.length || 0 }); setNewLinkTitle(''); setNewLinkUrl(''); setNewLinkIcon(''); setSuccess('Link added!'); fetchBio() }
    catch (err) { setError(err.response?.data?.detail || 'Failed to add link') }
  }

  const handleDeleteLink = async (linkId) => {
    try { await api.delete(`/bio/links/${linkId}`); fetchBio() }
    catch (err) { setError('Failed to delete link') }
  }

  const handleShareProfile = () => {
    if (!bio || shareGuard.current) return
    shareGuard.current = true
    navigator.clipboard.writeText(`http://localhost:8000/@${bio.username}`)
    setShareToast(true)
    setTimeout(() => { setShareToast(false); shareGuard.current = false }, 3000)
  }

  const handlePreviewProfile = () => {
    if (!bio) return
    window.open(`http://localhost:8000/@${bio.username}`, '_blank')
  }

  const presetColors = ['#6366f1', '#8b5cf6', '#d97706', '#ea580c', '#f43f5e', '#06b6d4', '#10b981', '#1c1917']
  const inputCls = "w-full bg-white border border-stone-200 text-[#1c1917] rounded-xl px-4 py-3 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all duration-150 shadow-sm hover:border-stone-300"

  if (loading) return <div className="flex items-center justify-center py-20"><svg className="animate-spin h-6 w-6 text-amber-500" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg></div>

  const Wrapper = ({ children }) => isDrawer ? <div className="fade-in">{children}</div> : (
    <div className="min-h-screen bg-[#faf9f7]">
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-stone-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5"><div className="w-[28px] h-[28px] bg-[#1c1917] rounded-lg flex items-center justify-center"><svg className="w-[14px] h-[14px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" /></svg></div><span className="text-[15px] font-bold text-[#1c1917]">Pathly</span></div>
          <Link to="/dashboard" className="text-stone-400 hover:text-stone-700 text-sm font-medium transition-colors">Dashboard</Link>
        </div>
      </nav>
      <div className="max-w-md mx-auto px-4 sm:px-6 py-10 fade-in">{children}</div>
    </div>
  )

  if (!bio) return (
    <Wrapper>
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center mx-auto mb-4"><svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>
        <h2 className="text-xl font-bold text-[#1c1917]">Create your bio page</h2>
        <p className="text-stone-400 text-sm mt-1">Build a shareable profile with all your links</p>
      </div>
      {error && <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm font-medium fade-in"><svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 110 18 9 9 0 010-18z" /></svg>{error}</div>}
      {success && <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium fade-in"><svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{success}</div>}
      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="block text-[13px] font-semibold text-stone-600 mb-1.5">Username</label>
          <div className="flex items-center bg-white border border-stone-200 rounded-xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-amber-500/20 transition-all hover:border-stone-300">
            <span className="text-stone-400 text-sm font-medium mr-0.5">@</span>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} className="flex-1 bg-transparent text-[#1c1917] text-sm focus:outline-none placeholder:text-stone-400" placeholder="yourname" required />
          </div>
        </div>
        <div><label className="block text-[13px] font-semibold text-stone-600 mb-1.5">Display name</label><input type="text" value={bioTitle} onChange={(e) => setBioTitle(e.target.value)} className={inputCls} placeholder="Your Name" /></div>
        <div><label className="block text-[13px] font-semibold text-stone-600 mb-1.5">Bio</label><textarea value={bioDesc} onChange={(e) => setBioDesc(e.target.value)} className={inputCls + ' resize-none'} placeholder="Designer, developer, builder..." rows={3} /></div>
        <div>
          <label className="block text-[13px] font-semibold text-stone-600 mb-1.5">Theme</label>
          <div className="flex flex-wrap gap-2">{presetColors.map(c => <button key={c} type="button" onClick={() => setThemeColor(c)} className={`w-8 h-8 rounded-full transition-all duration-200 ${themeColor === c ? 'ring-2 ring-[#1c1917] ring-offset-2 scale-110' : 'hover:scale-110'}`} style={{ backgroundColor: c }} />)}</div>
        </div>
        <button type="submit" disabled={saving} className="w-full bg-[#1c1917] hover:bg-[#292524] text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 text-sm active:scale-[0.98]">{saving ? 'Creating...' : 'Create bio page'}</button>
      </form>
    </Wrapper>
  )

  const initials = (bio.bio_title || bio.username || '?')[0].toUpperCase()

  return (
    <Wrapper>
      {/* Share toast — single global toast, guarded by ref to prevent duplicates */}
      {shareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] toast-in pointer-events-none">
          <div className="bg-[#1c1917] text-white text-sm font-medium px-5 py-3 rounded-xl shadow-xl flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            Profile URL copied!
          </div>
        </div>
      )}

      {!isEditing ? (
        <div>
          <div className="flex items-center justify-between mb-6 gap-2">
            <div className="flex gap-2">
              <button onClick={handleShareProfile} className="flex items-center gap-1.5 text-stone-500 hover:text-[#1c1917] bg-white hover:bg-stone-50 border border-stone-200 px-3 py-2 rounded-xl text-[13px] font-medium transition-all shadow-sm active:scale-95">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                Share
              </button>
              <button onClick={handlePreviewProfile} className="flex items-center gap-1.5 text-stone-500 hover:text-[#1c1917] bg-white hover:bg-stone-50 border border-stone-200 px-3 py-2 rounded-xl text-[13px] font-medium transition-all shadow-sm active:scale-95">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                Preview
              </button>
            </div>
            <button onClick={() => { setIsEditing(true); setError(''); setSuccess('') }} className="flex items-center gap-1.5 text-stone-500 hover:text-[#1c1917] bg-white hover:bg-stone-50 border border-stone-200 px-3 py-2 rounded-xl text-[13px] font-medium transition-all shadow-sm active:scale-95">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              Edit
            </button>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-lg" style={{ backgroundColor: bio.theme_color || '#6366f1' }}>{initials}</div>
            <h2 className="text-lg font-bold text-[#1c1917]">{bio.bio_title || bio.username}</h2>
            <p className="text-stone-400 text-sm">@{bio.username}</p>
            {bio.bio_description && <p className="text-stone-500 text-sm text-center mt-2 max-w-xs leading-relaxed">{bio.bio_description}</p>}
          </div>

          <div className="mt-6 space-y-2.5">
            {bio.links.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-stone-400 text-sm">No links on your page yet</p>
                <button onClick={() => setIsEditing(true)} className="text-amber-600 hover:text-amber-700 text-sm font-semibold mt-1.5 transition-colors">Add your first link</button>
              </div>
            ) : bio.links.map(l => (
              <a key={l.id} href={l.url} target="_blank" rel="noreferrer" className="block w-full text-center py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm" style={{ backgroundColor: `${bio.theme_color}08`, border: `1.5px solid ${bio.theme_color}25`, color: bio.theme_color }}>{l.title}</a>
            ))}
          </div>
          {!isDrawer && <p className="text-center text-stone-300 text-xs mt-10">Powered by <span className="text-stone-400 font-semibold">Pathly</span></p>}
        </div>
      ) : (
        <div>
          {error && <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm font-medium fade-in"><svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 110 18 9 9 0 010-18z" /></svg>{error}</div>}
          {success && <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium fade-in"><svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{success}</div>}
          <div className="flex items-center justify-between mb-5">
            <div><h3 className="text-base font-bold text-[#1c1917]">Edit profile</h3><p className="text-stone-400 text-xs">@{bio.username}</p></div>
            <button onClick={() => { setIsEditing(false); setError(''); setSuccess(''); setBioTitle(bio.bio_title || ''); setBioDesc(bio.bio_description || ''); setThemeColor(bio.theme_color || '#6366f1') }} className="text-stone-400 hover:text-stone-700 text-sm font-medium transition-colors">Cancel</button>
          </div>
          <form onSubmit={handleUpdate} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-4 mb-5">
            <div><label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Display name</label><input type="text" value={bioTitle} onChange={(e) => setBioTitle(e.target.value)} className={inputCls} placeholder="Your Name" /></div>
            <div><label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Bio</label><textarea value={bioDesc} onChange={(e) => setBioDesc(e.target.value)} className={inputCls + ' resize-none'} rows={3} /></div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Theme</label>
              <div className="flex flex-wrap gap-2">{presetColors.map(c => <button key={c} type="button" onClick={() => setThemeColor(c)} className={`w-7 h-7 rounded-full transition-all ${themeColor === c ? 'ring-2 ring-[#1c1917] ring-offset-2 scale-110' : 'hover:scale-110'}`} style={{ backgroundColor: c }} />)}</div>
            </div>
            <button type="submit" disabled={saving} className="w-full bg-[#1c1917] hover:bg-[#292524] text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 text-sm">{saving ? 'Saving...' : 'Save changes'}</button>
          </form>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between"><h4 className="text-sm font-bold text-[#1c1917]">Bio links</h4><span className="text-[11px] font-semibold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">{bio.links.length}</span></div>
            <div className="p-5">
              {bio.links.length > 0 && <div className="space-y-2 mb-4">{bio.links.map(l => (
                <div key={l.id} className="flex items-center justify-between bg-stone-50 rounded-xl px-4 py-3 hover:bg-stone-100 transition-all">
                  <div className="min-w-0 flex-1"><p className="text-sm font-medium text-[#1c1917] truncate">{l.title}</p><p className="text-xs text-stone-400 truncate">{l.url}</p></div>
                  <button onClick={() => handleDeleteLink(l.id)} className="ml-3 p-1.5 text-stone-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
              ))}</div>}
              <form onSubmit={handleAddLink} className="space-y-2">
                <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide mb-2">Add link</p>
                <input type="text" value={newLinkTitle} onChange={(e) => setNewLinkTitle(e.target.value)} className={inputCls} placeholder="Title" required />
                <input type="url" value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} className={inputCls} placeholder="https://..." required />
                <input type="text" value={newLinkIcon} onChange={(e) => setNewLinkIcon(e.target.value)} className={inputCls} placeholder="Icon (optional)" />
                <button type="submit" className="w-full bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-600 hover:text-[#1c1917] font-medium py-2.5 rounded-xl transition-all text-sm active:scale-[0.98]">+ Add link</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </Wrapper>
  )
}
