import React, { useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const Home = () => {
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const webcamRef = React.useRef(null);

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  }, [webcamRef]);

  const handleUpload = async (data) => {
    try {
      const formData = new FormData();
      formData.append('image', data.image);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000, // 10 second timeout
      };

      const response = await axios.post('http://localhost:5000/upload', formData, config);
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

  const captureAndProcess = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const imageSrc = webcamRef.current.getScreenshot();
      const data = { image: imageSrc };
      const result = await handleUpload(data);
      setImage(imageSrc);
    } catch (error) {
      setError(error.message);
      console.error('Process error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Webcam Capture</h1>
      {error && <div className="error">{error}</div>}
      {isLoading && <div>Processing...</div>}
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
      />
      <button onClick={capture}>Capture</button>
      <button onClick={captureAndProcess}>Capture and Process</button>
      {image && (
        <div>
          <h2>Captured Image:</h2>
          <img src={image} alt="Captured" />
        </div>
      )}
    </div>
  );
};

export default Home;