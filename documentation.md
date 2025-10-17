# Swachhta Dashboard - Technical Documentation
Version 1.0 | Last Updated: 2024

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Frontend Components](#frontend-components)
3. [Backend Services](#backend-services)
4. [API Documentation](#api-documentation)
5. [Database Structure](#database-structure)
6. [Installation Guide](#installation-guide)
7. [Troubleshooting](#troubleshooting)

## 1. System Architecture

### Overview
The Swachhta Dashboard is built using a modern client-server architecture:
- Frontend: React + Vite
- Backend: Flask
- Image Processing: YOLO v8
- Storage: File System + JSON

### Technology Stack
```
Frontend:                    Backend:
├── React 18                ├── Flask
├── Vite                    ├── OpenCV
├── TailwindCSS            ├── YOLO v8
└── React Router           └── NumPy
```

## 2. Frontend Components

### Core Components

#### Navbar (`Navbar.jsx`)
- Purpose: Main navigation and theme control
- Features:
  - Dynamic theme switching (dark/light)
  - Responsive design
  - User profile dropdown
  - Navigation links

#### Footer (`Footer.jsx`)
- Purpose: Site-wide footer information
- Sections:
  - About Us
  - Quick Links
  - Social Media Integration

#### Home Page (`Home.jsx`)
- Purpose: Main dashboard interface
- Key Features:
  - Real-time camera feed
  - Image upload capability
  - Waste detection results
  - Statistics display
  - Alert management

#### Alert Page (`AlertPage.jsx`)
- Purpose: Alert history and management
- Features:
  - Alert listing
  - Filtering system
  - Image preview
  - Delete functionality

### State Management
- Local state using React hooks
- Theme persistence using localStorage
- API integration using fetch

## 3. Backend Services

### Flask Application (`app.py`)

#### Core Features
1. Image Processing Pipeline
```python
def process_image(image_path):
    - Load YOLO model
    - Process image
    - Draw bounding boxes
    - Save processed image
    - Generate alerts
```

2. Alert Management System
```python
- Alert logging
- Alert retrieval
- Alert deletion
- Image storage
```

3. API Endpoints
```
/health    - Server health check
/upload    - Image processing
/alerts/*  - Alert management
```

### YOLO Configuration
```python
Model: YOLOv8n
Confidence Threshold: 0.25
IOU Threshold: 0.45
Classes: ['plastic', 'metal', 'glass', 'cardboard', 'paper', 'trash', 'bottle']
```

## 4. API Documentation

### Endpoints

#### 1. Health Check
```
GET /health
Response: { "status": "ok", "message": "Server is running" }
```

#### 2. Image Upload
```
POST /upload
Body: { "image": "base64_encoded_image" }
Response: {
    "status": "success",
    "processed_image": "filename.jpg",
    "timestamp": "YYYY-MM-DD HH:MM:SS"
}
```

#### 3. Alert Management
```
GET /alerts/list
POST /alerts/delete
```

## 5. Database Structure

### Alerts JSON Structure
```json
[
  {
    "timestamp": "YYYY-MM-DD HH:MM:SS",
    "classes": ["class1", "class2"],
    "image_path": "processed_image.jpg"
  }
]
```

## 6. Installation Guide

### Frontend Setup
```bash
cd dashboard
npm install
npm run dev
```

### Backend Setup
```bash
pip install -r requirements.txt
python app.py
```

### Environment Configuration
```
Frontend: .env
Backend: config.py
```

## 7. Troubleshooting

### Common Issues

1. Image Upload Failures
```
- Check file size limits
- Verify image format
- Check network connectivity
```

2. Model Detection Issues
```
- Verify YOLO model path
- Check CPU/GPU configuration
- Validate input image format
```

3. Alert Management
```
- Check file permissions
- Verify JSON file integrity
- Monitor storage space
```

### Performance Optimization

1. Image Processing
```
- Image compression before upload
- Batch processing for multiple images
- Caching of processed results
```

2. Frontend
```
- Lazy loading of components
- Image optimization
- Code splitting
```

3. Backend
```
- Request throttling
- Response caching
- Error handling
```

## Security Considerations

1. API Security
```
- CORS configuration
- Request validation
- File upload restrictions
```

2. Data Protection
```
- Secure file storage
- Input sanitization
- Error message handling
```

## Maintenance Guide

### Regular Tasks
1. Log rotation
2. Temporary file cleanup
3. Model updates
4. Security patches

### Monitoring
1. Server health
2. Processing times
3. Error rates
4. Storage usage

---

© 2024 Swachhta Dashboard. All rights reserved.
