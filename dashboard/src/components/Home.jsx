import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

// Add these utility functions at the top
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      // Check if online
      if (!navigator.onLine) {
        throw new Error('No internet connection');
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      // Wait 1s before retry
      await wait(1000);
    }
  }
};

// Replace your existing handleUpload function
const handleUpload = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 10000, // 10 second timeout
      withCredentials: true
    };

    const response = await axios.post('/upload', formData, config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please try again.');
      }
      if (error.response) {
        throw new Error(`Server error: ${error.response.status}`);
      }
      if (error.request) {
        throw new Error('No response from server. Please check your connection.');
      }
    }
    throw new Error('Upload failed. Please try again.');
  }
};

// Update your captureAndProcess function
const captureAndProcess = async () => {
  try {
    setIsLoading(true);
    setError(null);
    // ...existing code...
    const result = await handleUpload(file);
    // ...existing code...
  } catch (error) {
    setError(error.message);
    console.error('Processing error:', error);
  } finally {
    setIsLoading(false);
  }
};

const AlertGraph = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sample data for testing - replace with your actual API call
  useEffect(() => {
    const sampleData = [
      { date: '2023-01', critical: 4, warning: 8, info: 15 },
      { date: '2023-02', critical: 6, warning: 10, info: 12 },
      { date: '2023-03', critical: 3, warning: 7, info: 18 },
      { date: '2023-04', critical: 8, warning: 12, info: 10 },
      { date: '2023-05', critical: 5, warning: 9, info: 14 },
    ];
    setData(sampleData);
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data.length) return <div>No data available</div>;

  return (
    <div className="w-full p-4 bg-white dark:bg-secondary-800 rounded-xl shadow-card">
      <h2 className="text-xl font-semibold mb-4 text-secondary-800 dark:text-secondary-100">Alert Trends</h2>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)'
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} />
            <Line type="monotone" dataKey="warning" stroke="#f59e0b" strokeWidth={2} />
            <Line type="monotone" dataKey="info" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AlertGraph;