import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import CreateLink from '../components/CreateLink'
import LinkCard from '../components/LinkCard'

export default function Dashboard() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
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

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">LinkIQ</h1>
        <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/bio')}
              className="text-gray-400 hover:text-white text-sm transition"
            >
                Bio page
            </button>
            <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white text-sm transition"
            >
                Logout
            </button>
        </div>
    </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-1">Dashboard</h2>
          <p className="text-gray-400">Create and manage your short links</p>
        </div>

        <CreateLink onCreated={fetchLinks} />

        <div className="mt-10">
          <h3 className="text-lg font-semibold text-white mb-4">
            Your links{' '}
            <span className="text-gray-500 font-normal text-sm">({links.length})</span>
          </h3>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : links.length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              No links yet. Create your first one above!
            </div>
          ) : (
            <div className="space-y-3">
              {links.map((link) => (
                <LinkCard key={link.id} link={link} onRefresh={fetchLinks} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}