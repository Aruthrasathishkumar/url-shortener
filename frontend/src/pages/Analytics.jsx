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
    try {
      const res = await api.get(`/links/${linkId}/analytics`)
      setData(res.data)
    } catch (err) {
      setError('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Loading analytics...</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-red-400">{error}</p>
    </div>
  )

  const maxHourly = Math.max(...data.hourly.map(h => h.clicks), 1)
  const maxDevice = Math.max(...data.devices.map(d => d.count), 1)

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">LinkIQ</h1>
        <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm transition">
          Back to dashboard
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-1">Analytics</h2>
          <p className="text-gray-400">Detailed insights for your link</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Total clicks</p>
            <p className="text-4xl font-bold text-white">{data.total_clicks}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Top device</p>
            <p className="text-4xl font-bold text-white capitalize">
              {data.devices[0]?.device || 'N/A'}
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Top source</p>
            <p className="text-4xl font-bold text-white">
              {data.referrers[0]?.referrer || 'direct'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-white font-semibold mb-4">Clicks by hour</h3>
            {data.total_clicks === 0 ? (
              <p className="text-gray-600 text-sm text-center py-8">No data yet</p>
            ) : (
              <div className="flex items-end gap-0.5 h-40">
                {data.hourly.map((h) => (
                  <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-indigo-500 rounded-t transition-all"
                      style={{ height: `${(h.clicks / maxHourly) * 100}%`, minHeight: h.clicks > 0 ? '4px' : '0' }}
                    />
                    {h.hour % 6 === 0 && (
                      <span className="text-gray-600 text-xs">{h.hour}h</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-white font-semibold mb-4">Device breakdown</h3>
            {data.devices.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-8">No data yet</p>
            ) : (
              <div className="space-y-4 mt-4">
                {data.devices.map((d, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-300 text-sm capitalize">{d.device}</span>
                      <span className="text-gray-400 text-sm">
                        {((d.count / data.total_clicks) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all"
                        style={{
                          width: `${(d.count / maxDevice) * 100}%`,
                          backgroundColor: ['#6366f1', '#8b5cf6', '#a78bfa'][i] || '#6366f1'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-white font-semibold mb-4">Top referrers</h3>
            {data.referrers.length === 0 ? (
              <p className="text-gray-600 text-sm">No data yet</p>
            ) : (
              <div className="space-y-3">
                {data.referrers.map((r, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">{r.referrer}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-800 rounded-full h-1.5">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full"
                          style={{ width: `${(r.count / data.total_clicks) * 100}%` }}
                        />
                      </div>
                      <span className="text-gray-400 text-sm w-6 text-right">{r.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-white font-semibold mb-4">Top browsers</h3>
            {data.browsers.length === 0 ? (
              <p className="text-gray-600 text-sm">No data yet</p>
            ) : (
              <div className="space-y-3">
                {data.browsers.map((b, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">{b.browser}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-800 rounded-full h-1.5">
                        <div
                          className="bg-purple-500 h-1.5 rounded-full"
                          style={{ width: `${(b.count / data.total_clicks) * 100}%` }}
                        />
                      </div>
                      <span className="text-gray-400 text-sm w-6 text-right">{b.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}