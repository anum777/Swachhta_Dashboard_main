# Swachhta Dashboard Project

A comprehensive waste detection and monitoring system using YOLO object detection and React frontend.

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Setup Instructions](#setup-instructions)
5. [Features](#features)
6. [API Documentation](#api-documentation)
7. [Frontend Components](#frontend-components)
8. [Backend Architecture](#backend-architecture)
9. [Model Details](#model-details)
10. [Contributing](#contributing)

## 🎯 Project Overview
The Swacchta Dashboard is an intelligent monitoring system designed to detect and track waste in real-time using computer vision technology. It combines a React frontend with a Flask backend and uses YOLO object detection for waste identification.

## 💻 Tech Stack
### Frontend
- React 18+
- Vite (Build tool)
- TailwindCSS (Styling)
- React Router (Navigation)

### Backend
- Flask (Python web framework)
- OpenCV (Image processing)
- YOLO v8 (Object detection)
- NumPy (Numerical operations)
- Flask-CORS (Cross-origin resource sharing)

## 📁 Project Structure
```
swacchta_dashboard_project_2/
├── dashboard/                  # Frontend React application
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   │   ├── Navbar.jsx    # Navigation bar component
│   │   │   └── Footer.jsx    # Footer component
│   │   ├── pages/           # Page components
│   │   │   ├── Home.jsx     # Home page with camera feed
│   │   │   └── AlertPage.jsx # Alerts management page
│   │   └── config.js        # Configuration files
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
├── app.py                   # Backend Flask application
├── alerts.json             # Alert storage
└── uploads/               # Processed images storage
```

## 🚀 Setup Instructions

### Backend Setup
1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the Flask server:
```bash
python app.py
```

### Frontend Setup
1. Navigate to dashboard directory:
```bash
cd dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

## ✨ Features

### Real-time Waste Detection
- Live camera feed processing
- Image upload capability
- YOLO object detection for waste identification
- Severity level classification

### Alert Management
- Real-time alert generation
- Alert history tracking
- Timestamp-based organization
- Image storage for each alert

### User Interface
- Dark/Light mode toggle
- Responsive design
- Interactive camera controls
- Alert filtering and sorting

## 🔌 API Documentation

### Backend Endpoints

#### 1. Health Check
```
GET /health
Response: { "status": "ok", "message": "Server is running" }
```

#### 2. Image Upload
```
POST /upload
Body: { "image": "base64_encoded_image_data" }
Response: {
    "status": "success",
    "processed_image": "filename.jpg",
    "timestamp": "YYYY-MM-DD HH:MM:SS"
}
```

#### 3. Alert Management
```
GET /alerts/list
Response: { "status": "success", "alerts": [...] }

POST /alerts/delete
Body: { "timestamp": "YYYY-MM-DD HH:MM:SS" }
Response: { "status": "success", "message": "Alert deleted successfully" }
```

## 🎨 Frontend Components

### Navbar Component
- Navigation links
- Theme toggle
- User profile dropdown
- Responsive design

### Home Page
- Camera feed integration
- Image upload interface
- Real-time processing
- Statistics display
- Alert visualization

### Alert Page
- Alert listing
- Filtering capabilities
- Sorting options
- Image preview
- Delete functionality

## 🛠 Backend Architecture

### Flask Application
- CORS handling
- File upload management
- Error handling
- Static file serving

### Image Processing Pipeline
1. Image reception and validation
2. YOLO model processing
3. Bounding box drawing
4. Alert generation
5. Image storage

### Alert System
- JSON-based storage
- Timestamp tracking
- Image path management
- Class detection logging

## 🤖 Model Details

### YOLO Configuration
- Model: YOLOv8n
- Confidence threshold: 0.25
- IOU threshold: 0.45
- Supported classes:
  - Plastic
  - Metal
  - Glass
  - Cardboard
  - Paper
  - Trash
  - Bottle

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a Pull Request


## 👥 Authors
- Your Name - Anum Agrawal

## 🙏 Acknowledgments
- YOLOv8 team for the object detection model
- React team for the frontend framework
- Flask team for the backend framework
