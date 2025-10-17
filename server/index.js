const express = require('express');
const cors = require('cors');
const app = express();

// Configure CORS
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ...existing code...

app.post('/upload', async (req, res) => {
  try {
    // ...existing upload logic...
    res.status(200).json({ message: 'Upload successful' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});