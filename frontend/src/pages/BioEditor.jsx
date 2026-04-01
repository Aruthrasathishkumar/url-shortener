import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

export default function BioEditor() {
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

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return }
    fetchBio()
  }, [])

  const fetchBio = async () => {
    try {
      const res = await api.get('/bio/me')
      if (res.data) {
        setBio(res.data)
        setBioTitle(res.data.bio_title || '')
        setBioDesc(res.data.bio_description || '')
        setThemeColor(res.data.theme_color || '#6366f1')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.post('/bio', {
        username,
        bio_title: bioTitle,
        bio_description: bioDesc,
        theme_color: themeColor,
      })
      setSuccess('Bio page created!')
      fetchBio()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create bio page')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await api.put('/bio/me', {
        bio_title: bioTitle,
        bio_description: bioDesc,
        theme_color: themeColor,
      })
      setSuccess('Bio page updated!')
      fetchBio()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const handleAddLink = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/bio/links', {
        title: newLinkTitle,
        url: newLinkUrl,
        icon: newLinkIcon || null,
        display_order: bio?.links?.length || 0,
      })
      setNewLinkTitle('')
      setNewLinkUrl('')
      setNewLinkIcon('')
      setSuccess('Link added!')
      fetchBio()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add link')
    }
  }

  const handleDeleteLink = async (linkId) => {
    try {
      await api.delete(`/bio/links/${linkId}`)
      fetchBio()
    } catch (err) {
      setError('Failed to delete link')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">LinkIQ</h1>
        <div className="flex items-center gap-4">
            {bio && (

               <a href={"http://localhost:8000/@" + bio.username}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:text-indigo-300 text-sm transition"
            >
                View page
            </a>
        )}
    <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm transition">
      Dashboard
    </Link>
  </div>
</nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-1">Bio Page</h2>
          <p className="text-gray-400">Your personal link-in-bio page</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        {!bio ? (
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-white font-semibold mb-4">Create your bio page</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Username</label>
                <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg px-4 py-3">
                  <span className="text-gray-500 mr-1">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="flex-1 bg-transparent text-white focus:outline-none"
                    placeholder="yourname"
                    required
                  />
                </div>
                <p className="text-gray-600 text-xs mt-1">
                  Your page will be at: localhost:8000/@{username || 'yourname'}
                </p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Display name</label>
                <input
                  type="text"
                  value={bioTitle}
                  onChange={(e) => setBioTitle(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Bio</label>
                <textarea
                  value={bioDesc}
                  onChange={(e) => setBioDesc(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition resize-none"
                  placeholder="Software engineer | Building cool things"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Theme color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-gray-400 text-sm font-mono">{themeColor}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create bio page'}
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Edit profile</h3>
                <span className="text-indigo-400 font-mono text-sm">@{bio.username}</span>
              </div>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Display name</label>
                  <input
                    type="text"
                    value={bioTitle}
                    onChange={(e) => setBioTitle(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Bio</label>
                  <textarea
                    value={bioDesc}
                    onChange={(e) => setBioDesc(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition resize-none"
                    placeholder="Software engineer | Building cool things"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Theme color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-gray-400 text-sm font-mono">{themeColor}</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-2.5 rounded-lg transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </form>
            </div>

            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6">
              <h3 className="text-white font-semibold mb-4">
                Your links{' '}
                <span className="text-gray-500 font-normal text-sm">({bio.links.length})</span>
              </h3>

              {bio.links.length === 0 ? (
                <p className="text-gray-600 text-sm text-center py-4">No links yet. Add one below.</p>
              ) : (
                <div className="space-y-2 mb-4">
                  {bio.links.map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3"
                    >
                      <div>
                        <p className="text-white text-sm font-medium">{l.title}</p>
                        <p className="text-gray-500 text-xs truncate max-w-xs">{l.url}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600 text-xs">{l.click_count} clicks</span>
                        <button
                          onClick={() => handleDeleteLink(l.id)}
                          className="text-red-400 hover:text-red-300 text-xs transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleAddLink} className="space-y-3 border-t border-gray-800 pt-4">
                <p className="text-gray-400 text-sm font-medium">Add a link</p>
                <input
                  type="text"
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition text-sm"
                  placeholder="Title (e.g. My Portfolio)"
                  required
                />
                <input
                  type="url"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition text-sm"
                  placeholder="https://yourwebsite.com"
                  required
                />
                <input
                  type="text"
                  value={newLinkIcon}
                  onChange={(e) => setNewLinkIcon(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition text-sm"
                  placeholder="Icon label (optional — e.g. github, linkedin)"
                />
                <button
                  type="submit"
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2.5 rounded-lg transition text-sm"
                >
                  + Add link
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  )
}