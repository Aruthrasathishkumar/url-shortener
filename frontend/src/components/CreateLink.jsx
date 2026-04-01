import { useState } from 'react'
import api from '../api'

export default function CreateLink({ onCreated }) {
  const [url, setUrl] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [maxClicks, setMaxClicks] = useState('')
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
      }
      const res = await api.post('/links', payload)
      setResult(res.data)
      setUrl('')
      setCustomCode('')
      setMaxClicks('')
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

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
      <h3 className="text-lg font-semibold text-white mb-4">Shorten a URL</h3>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 mb-4">
          <p className="text-indigo-300 text-sm mb-2">Link created successfully!</p>
          <div className="flex items-center gap-3">
            <code className="text-white font-mono text-sm flex-1">{result.short_url}</code>
            <button
              onClick={() => copyToClipboard(result.short_url)}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition"
            placeholder="https://your-long-url.com"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 rounded-lg transition disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? 'Creating...' : 'Shorten'}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-gray-500 hover:text-gray-300 transition"
        >
          {showAdvanced ? '− Hide' : '+ Show'} advanced options
        </button>

        {showAdvanced && (
          <div className="space-y-3 pt-2 border-t border-gray-800">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Custom code <span className="text-gray-600">(optional)</span>
              </label>
              <input
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition text-sm"
                placeholder="my-custom-link"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Max clicks <span className="text-gray-600">(optional)</span>
              </label>
              <input
                type="number"
                value={maxClicks}
                onChange={(e) => setMaxClicks(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition text-sm"
                placeholder="e.g. 100"
                min="1"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isOneTime}
                onChange={(e) => setIsOneTime(e.target.checked)}
                className="w-4 h-4 accent-indigo-500"
              />
              <span className="text-sm text-gray-400">
                One-time link <span className="text-gray-600">(expires after first click)</span>
              </span>
            </label>
          </div>
        )}
      </form>
    </div>
  )
}