import React, { useState } from 'react';

function LinkForm({ initialData = null, onSubmit, onCancel }) {
  const [originalUrl, setOriginalUrl] = useState(initialData?.originalUrl || '');
  const [customSlug, setCustomSlug] = useState(initialData?.shortCode || '');
  const [expiresAt, setExpiresAt] = useState(
    initialData?.expiresAt ? new Date(initialData.expiresAt).toISOString().slice(0, 16) : ''
  );
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        originalUrl,
        isActive,
      };

      if (!initialData && customSlug) {
        data.customSlug = customSlug;
      }

      if (expiresAt) {
        data.expiresAt = new Date(expiresAt).toISOString();
      } else if (initialData && !expiresAt) {
        data.expiresAt = null;
      }

      await onSubmit(data);
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="originalUrl" className="block text-sm font-medium text-gray-700 mb-1">
          Original URL *
        </label>
        <input
          id="originalUrl"
          type="url"
          required
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/your-long-url"
        />
      </div>

      {!initialData && (
        <div>
          <label htmlFor="customSlug" className="block text-sm font-medium text-gray-700 mb-1">
            Custom Slug (optional)
          </label>
          <input
            id="customSlug"
            type="text"
            value={customSlug}
            onChange={(e) => setCustomSlug(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="my-custom-slug"
            pattern="[a-zA-Z0-9_-]+"
            title="Only letters, numbers, hyphens, and underscores allowed"
          />
          <p className="mt-1 text-xs text-gray-500">
            Leave empty to generate a random short code
          </p>
        </div>
      )}

      <div>
        <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-1">
          Expiration Date (optional)
        </label>
        <input
          id="expiresAt"
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {initialData && (
        <div className="flex items-center">
          <input
            id="isActive"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
            Link is active
          </label>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Saving...' : initialData ? 'Update Link' : 'Create Link'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default LinkForm;
