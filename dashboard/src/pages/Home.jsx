import React, { useRef, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">{value}</p>
      </div>
      <div className="text-4xl bg-blue-50 p-3 rounded-full">{icon}</div>
    </div>
  </div>
);

const getSeverityLevel = (detectedClasses) => {
  // Convert all classes to lowercase for better matching
  const normalizedClasses = detectedClasses.map(cls => cls.toLowerCase());
  
  // Define waste-related keywords
  const wasteKeywords = [
    'garbage', 'trash', 'waste', 'litter', 'debris',
    'plastic', 'paper', 'cardboard', 'container',
    'bag', 'bottle', 'wrapper', 'packaging', 'cup'
  ];

  // Count how many waste-related items are detected
  const wasteCount = normalizedClasses.filter(cls => 
    wasteKeywords.some(keyword => cls.includes(keyword))
  ).length;

  // Updated severity logic
  if (wasteCount === 0) {
    return { 
      level: 'clean', 
      color: 'green', 
      icon: '✨', 
      message: 'Area is clean' 
    };
  } else if (wasteCount >= 1 && wasteCount <= 2) {
    return { 
      level: 'moderate', 
      color: 'yellow', 
      icon: '⚠️', 
      message: 'Moderate waste detected' 
    };
  } else {
    return { 
      level: 'unclean', 
      color: 'red', 
      icon: '🚨', 
      message: 'Significant waste detected - Needs cleaning' 
    };
  }
};

const formatLastDetectionTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / 60000);
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes/60)}h ago`;
  return date.toLocaleDateString();
};

const Home = () => {
  const videoRef = useRef(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [serverStatus, setServerStatus] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    totalAlerts: 0,
    todayAlerts: 0,
    activeCamera: false,
    lastDetection: null
  });
  const [cameraMode, setCameraMode] = useState('environment'); // 'environment' or 'user'
  const [selectedFile, setSelectedFile] = useState(null);
  const [showCameraSection, setShowCameraSection] = useState(false);
  const fileInputRef = useRef(null);
  const [severity, setSeverity] = useState(null);
  const [showAlerts, setShowAlerts] = useState(false);

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
      setStats(prev => ({ ...prev, activeCamera: false }));
    }
  };

  const toggleCameraMode = async () => {
    stopCamera();
    setCameraMode(prev => prev === 'environment' ? 'user' : 'environment');
    startCamera();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: cameraMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      videoRef.current.srcObject = stream;
      setIsCameraActive(true);
      setStats(prev => ({ ...prev, activeCamera: true }));
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError('Failed to access camera');
    }
  };

  const checkServerStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Server responded with error');
      setServerStatus(true);
      setError('');
    } catch (err) {
      console.error('CORS or network error:', err.message); // Debug log
      setServerStatus(false);
      setError('Server is not running or CORS issue. Please check the backend.');
    }
  };

  const captureAndProcess = async () => {
    try {
      const imageData = await captureImage(); // Assume this function captures the image and returns base64 data
      await handleUpload(imageData);
    } catch (error) {
      console.error('Error in captureAndProcess:', error.message);
      alert(`Error: ${error.message}`);
    }
  };

  const captureImage = async () => {
    if (!API_BASE_URL) {
      setError('API_BASE_URL is not configured. Please check your configuration.');
      return;
    }

    if (!serverStatus) {
      setError('Please ensure server is running and try again');
      checkServerStatus();
      return;
    }

    if (!videoRef.current || !videoRef.current.videoWidth) {
      setError('Camera not ready. Please ensure camera is started and try again.');
      return;
    }

    setError('');
    setLoading(true);
    setProcessedImage(null);

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const compressImage = async (base64String, maxSizeMB = 1) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        const maxDimension = 1024;
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress with reduced quality
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = base64String;
    });
  };

  const handleUpload = async (base64Data) => {
    try {
      setError('');
      setLoading(true);
      console.log('Compressing image...');
      
      // Compress image before upload
      const compressedImage = await compressImage(base64Data);
      console.log('Image compressed, sending to server...');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60-second timeout

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: compressedImage }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        setProcessedImage(`${API_BASE_URL}/uploads/${data.processed_image}`);
        // Add severity assessment
        const severityResult = getSeverityLevel(data.detected_classes || []);
        setSeverity(severityResult);
      } else {
        throw new Error(data.error || 'Processing failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again with a smaller image.');
      } else {
        setError(`Upload failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/alerts/list`);
      const data = await response.json();
      if (data.status === 'success') {
        setAlerts(data.alerts);
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  };

  useEffect(() => {
    checkServerStatus();
    fetchAlerts();
  }, []);

  useEffect(() => {
    const today = new Date().toDateString();
    const todayAlerts = alerts.filter(alert => 
      new Date(alert.timestamp).toDateString() === today
    ).length;

    // Sort alerts by timestamp in descending order to get the most recent
    const sortedAlerts = [...alerts].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    setStats(prev => ({
      ...prev,
      totalAlerts: alerts.length,
      todayAlerts,
      lastDetection: sortedAlerts[0]?.timestamp || null
    }));
  }, [alerts]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpload(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-300 bg-clip-text text-transparent mb-4">
            Waste Detection Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Intelligent Monitoring System for Cleaner Environment</p>
        </div>

        {/* Statistics Grid with Animation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in">
          <StatCard title="Total Alerts" value={stats.totalAlerts} icon="📊" />
          <StatCard title="Today's Alerts" value={stats.todayAlerts} icon="📅" />
          <StatCard title="Camera Status" value={isCameraActive ? 'Active' : 'Inactive'} icon="📸" />
          <StatCard 
            title="Last Detection" 
            value={formatLastDetectionTime(stats.lastDetection)} 
            icon="⏰" 
          />
        </div>

        {/* Upload and Camera Options */}
        {!showCameraSection && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-8 animate-slide-up">
            <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-8 text-center">Choose Detection Method</h2>
            <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
              <div className="w-full md:w-1/2">
                <div className="h-full bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-700 dark:to-gray-600 border-2 border-dashed border-blue-200 dark:border-blue-500 rounded-xl p-8 hover:border-blue-400 dark:hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={triggerFileInput}
                    className="w-full bg-gradient-to-r from-blue-500 to-teal-400 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium text-lg"
                  >
                    Upload Image 📁
                  </button>
                  <p className="text-gray-600 dark:text-gray-300 mt-4 text-center">Drag and drop or click to upload</p>
                </div>
              </div>
              
              <div className="w-full md:w-1/2">
                <div className="h-full bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 border-2 border-dashed border-teal-200 dark:border-teal-500 rounded-xl p-8 hover:border-teal-400 dark:hover:border-teal-300 transition-all duration-300 transform hover:-translate-y-1">
                  <button
                    onClick={() => setShowCameraSection(true)}
                    className="w-full bg-gradient-to-r from-teal-500 to-blue-400 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium text-lg"
                  >
                    Use Camera 📸
                  </button>
                  <p className="text-gray-600 dark:text-gray-300 mt-4 text-center">Real-time detection using camera</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Camera Section */}
        {showCameraSection && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-8 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Camera Controls</h2>
              <button
                onClick={() => setShowCameraSection(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back to Options
              </button>
            </div>
            
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <div className="flex gap-4">
                {!isCameraActive ? (
                  <button
                    onClick={startCamera}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-600 transition flex items-center gap-2"
                  >
                    <span>Start Camera</span>
                    <span>📸</span>
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="bg-red-500 text-white px-6 py-3 rounded-lg shadow hover:bg-red-600 transition flex items-center gap-2"
                  >
                    <span>Stop Camera</span>
                    <span>⏹️</span>
                  </button>
                )}
                <button
                  onClick={toggleCameraMode}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg shadow hover:bg-gray-600 transition flex items-center gap-2"
                >
                  <span>Switch Camera</span>
                  <span>🔄</span>
                </button>
              </div>
              <button
                onClick={captureAndProcess}
                disabled={loading || !serverStatus}
                className={`px-6 py-3 rounded-lg shadow text-white font-medium transition flex items-center gap-2
                  ${loading || !serverStatus
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600'
                  }`}
              >
                <span>{loading ? 'Processing...' : 'Capture & Process'}</span>
                <span>{loading ? '⏳' : '📸'}</span>
              </button>
            </div>

            {/* Camera Preview */}
            <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-inner">
              <video 
                ref={videoRef} 
                autoPlay 
                className="w-full h-full object-cover"
                style={{ transform: cameraMode === 'user' ? 'scaleX(-1)' : 'none' }}
              />
              {loading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="animate-spin text-4xl">⚙️</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-200 rounded-lg shadow-lg border border-red-200 dark:border-red-800 flex items-center gap-3">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* Results Display */}
        {processedImage && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <span>Detection Result</span>
                <span>🎯</span>
              </h2>
              {severity && (
                <div className={`px-4 py-2 rounded-full flex items-center gap-2 
                  ${severity.level === 'clean' ? 'bg-green-100 text-green-800' :
                    severity.level === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'}`}
                >
                  <span>{severity.icon}</span>
                  <span className="font-medium">{severity.message}</span>
                </div>
              )}
            </div>
            <div className={`relative rounded-lg overflow-hidden ${
              severity && `border-4 border-${severity.color}-500`
            }`}>
              <img
                src={processedImage}
                alt="Processed Result"
                className="w-full rounded-lg shadow-lg"
              />
              {severity && (
                <div className={`absolute top-4 right-4 px-4 py-2 rounded-full 
                  bg-${severity.color}-500 text-white font-bold shadow-lg
                  flex items-center gap-2`}
                >
                  <span>{severity.icon}</span>
                  <span>Level: {severity.level.toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Alerts Section */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl p-8 animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <span>Recent Alerts</span>
              <span>🚨</span>
            </h2>
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <span>{showAlerts ? 'Hide Alerts' : 'Show Alerts'}</span>
              <span>{showAlerts ? '👆' : '👇'}</span>
            </button>
          </div>

          {showAlerts && (
            <div className="space-y-4">
              {alerts.length > 0 ? (
                alerts.slice().reverse().map((alert, index) => (
                  <div
                    key={index}
                    className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1">
                          Detected: {alert.classes.join(', ')}
                        </p>
                      </div>
                      {alert.image_path && (
                        <img
                          src={`${API_BASE_URL}/uploads/${alert.image_path}`}
                          alt="Alert"
                          className="w-24 h-24 object-cover rounded-lg shadow"
                        />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center">No alerts yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
