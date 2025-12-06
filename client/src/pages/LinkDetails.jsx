import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import Layout from '../components/Layout';
import AnalyticsSummary from '../components/AnalyticsSummary';

function LinkDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [link, setLink] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLinkData();
  }, [id]);

  const fetchLinkData = async () => {
    try {
      setLoading(true);
      setError('');

      const [linkResponse, analyticsResponse] = await Promise.all([
        apiClient.get(`/links/${id}`),
        apiClient.get(`/links/${id}/analytics`),
      ]);

      setLink(linkResponse.data.link);
      setAnalytics(analyticsResponse.data.analytics);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load link data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto text-center py-12">
          <div className="text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-4">
            {error}
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            ← Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 text-blue-600 hover:text-blue-700 flex items-center"
        >
          <span className="mr-1">←</span> Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Link Analytics</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Short URL</label>
              <div className="mt-1">
                <a
                  href={link.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {link.shortUrl}
                </a>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Original URL</label>
              <div className="mt-1 text-gray-900 truncate">{link.originalUrl}</div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Created</label>
              <div className="mt-1 text-gray-900">
                {new Date(link.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Status</label>
              <div className="mt-1">
                {link.isActive ? (
                  link.expiresAt && new Date(link.expiresAt) < new Date() ? (
                    <span className="text-red-600 font-medium">Expired</span>
                  ) : (
                    <span className="text-green-600 font-medium">Active</span>
                  )
                ) : (
                  <span className="text-gray-600 font-medium">Inactive</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <AnalyticsSummary analytics={analytics} />
      </div>
    </Layout>
  );
}

export default LinkDetails;
