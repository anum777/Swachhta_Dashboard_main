import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import { LoadingSpinner, ErrorMessage, Card } from '../components/common';

const AlertPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterClass, setFilterClass] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/alerts/list`);
      if (!response.ok) {
        throw new Error(`Failed to fetch alerts: ${response.status}`);
      }
      const data = await response.json();
      if (data.status === 'success') {
        setAlerts(data.alerts);
        setFilteredAlerts(data.alerts);
      } else {
        throw new Error(data.message || 'Failed to fetch alerts');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteAlert = async (timestamp) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/alerts/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timestamp }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete alert: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        const updatedAlerts = alerts.filter((alert) => alert.timestamp !== timestamp);
        setAlerts(updatedAlerts);
        setFilteredAlerts(updatedAlerts);
      } else {
        throw new Error(data.message || 'Failed to delete alert');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = alerts.filter((alert) =>
      (alert.classes || []).some((cls) => cls.toLowerCase().includes(query))
    );
    setFilteredAlerts(filtered);
  };

  const getFilteredAndSortedAlerts = () => {
    let filtered = [...alerts];
    
    if (filterClass !== 'all') {
      filtered = filtered.filter(alert => 
        alert.classes.includes(filterClass)
      );
    }
    
    if (searchQuery) {
      filtered = filtered.filter(alert =>
        alert.classes.some(cls => 
          cls.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    return filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.timestamp) - new Date(a.timestamp);
      }
      return new Date(a.timestamp) - new Date(b.timestamp);
    });
  };

  const openImageModal = (imagePath) => {
    setSelectedImage(`${API_BASE_URL}/uploads/${imagePath}`);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading alerts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Alert Management</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="all">All Classes</option>
              {Array.from(new Set(alerts.flatMap(a => a.classes))).map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </Card>

        {getFilteredAndSortedAlerts().length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center">No alerts available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredAndSortedAlerts().map((alert, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 relative hover:shadow-lg transition-shadow duration-300"
              >
                <button
                  onClick={() => deleteAlert(alert.timestamp)}
                  className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition"
                >
                  Delete
                </button>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Timestamp:</strong> {new Date(alert.timestamp).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Detected Classes:</strong> {(alert.classes || []).join(', ')}
                </p>
                {alert.image_path && (
                  <img
                    src={`${API_BASE_URL}/uploads/${alert.image_path}`}
                    alt="Processed Detection"
                    className="mt-4 w-full h-48 object-cover rounded-lg shadow cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openImageModal(alert.image_path)}
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 dark:bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={closeImageModal}
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full">
              <button
                onClick={closeImageModal}
                className="absolute -top-10 right-0 text-white text-xl hover:text-gray-300"
              >
                ✕ Close
              </button>
              <img
                src={selectedImage}
                alt="Full size"
                className="w-full h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertPage;
