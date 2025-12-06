import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import Layout from '../components/Layout';
import LinkForm from '../components/LinkForm';
import LinkTable from '../components/LinkTable';

function Dashboard() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get('/links');
      setLinks(response.data.links);
    } catch (err) {
      setError('Failed to load links.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async (linkData) => {
    try {
      await apiClient.post('/links', linkData);
      setShowForm(false);
      fetchLinks();
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to create link.');
    }
  };

  const handleUpdateLink = async (id, linkData) => {
    try {
      await apiClient.patch(`/links/${id}`, linkData);
      setEditingLink(null);
      fetchLinks();
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to update link.');
    }
  };

  const handleDeleteLink = async (id) => {
    if (!window.confirm('Are you sure you want to delete this link?')) {
      return;
    }

    try {
      await apiClient.delete(`/links/${id}`);
      fetchLinks();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete link.');
    }
  };

  const handleViewAnalytics = (id) => {
    navigate(`/links/${id}`);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.email}</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {showForm ? 'Cancel' : 'Create New Link'}
          </button>
        </div>

        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Short Link</h2>
            <LinkForm onSubmit={handleCreateLink} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {editingLink && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Edit Link</h2>
            <LinkForm
              initialData={editingLink}
              onSubmit={(data) => handleUpdateLink(editingLink.id, data)}
              onCancel={() => setEditingLink(null)}
            />
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Loading links...</div>
          ) : links.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              No links yet. Create your first short link!
            </div>
          ) : (
            <LinkTable
              links={links}
              onEdit={setEditingLink}
              onDelete={handleDeleteLink}
              onViewAnalytics={handleViewAnalytics}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
