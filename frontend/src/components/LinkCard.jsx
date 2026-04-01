import { useNavigate } from 'react-router-dom'

export default function LinkCard({ link }) {
  const navigate = useNavigate()

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const getStatusColor = () => {
    if (!link.is_active) return 'text-red-400 bg-red-400/10'
    return 'text-green-400 bg-green-400/10'
  }

  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 hover:border-gray-700 transition">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-indigo-400 font-mono font-medium">
              localhost:8000/{link.short_code}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor()}`}>
              {link.is_active ? 'Active' : 'Inactive'}
            </span>
            {link.is_one_time && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium text-amber-400 bg-amber-400/10">
                One-time
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm truncate">{link.original_url}</p>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <span className="text-xs text-gray-600">
              {link.click_count} click{link.click_count !== 1 ? 's' : ''}
            </span>
            {link.max_clicks && (
              <span className="text-xs text-gray-600">limit: {link.max_clicks}</span>
            )}
            {link.expires_at && (
              <span className="text-xs text-gray-600">
                expires: {new Date(link.expires_at).toLocaleDateString()}
              </span>
            )}
            <span className="text-xs text-gray-600">
              {new Date(link.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => copyToClipboard(`http://localhost:8000/${link.short_code}`)}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition"
          >
            Copy
          </button>
          <button
            onClick={() => navigate(`/analytics/${link.id}`)}
            className="text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 px-3 py-1.5 rounded-lg transition"
          >
            Analytics
          </button>
        </div>
      </div>
    </div>
  )
}