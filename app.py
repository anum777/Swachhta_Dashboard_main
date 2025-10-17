# ------------------------- IMPORTS -------------------------
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS  # Handle Cross-Origin Resource Sharing
from werkzeug.utils import secure_filename  # Secure filenames for uploads
from werkzeug.middleware.proxy_fix import ProxyFix  # Updated import
import os  # File system operations
import cv2  # OpenCV for image processing
import base64  # Base64 encoding/decoding
import numpy as np  # Numerical operations
from datetime import datetime  # Timestamps
import json  # JSON file handling
from ultralytics import YOLO  # YOLO object detection

# ------------------------- FLASK SETUP -------------------------
app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app)

# Increase max content length to 16MB
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# Updated CORS configuration to be more permissive
CORS(app, 
     resources={r"/*": {"origins": "*"}},  # Allow all origins in development
     supports_credentials=True,
     allow_headers=["Content-Type", "Accept", "Authorization"],
     max_age=3600)

@app.after_request
def add_cors_headers(response):
    """Ensure CORS headers are added to every response."""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Max-Age"] = "3600"
    return response

@app.errorhandler(Exception)
def handle_error(error):
    print(f"Error: {str(error)}")
    return jsonify({"status": "error", "message": str(error)}), 500

@app.errorhandler(413)
def handle_file_too_large(error):
    """Handle file too large error"""
    return jsonify({"status": "error", "message": "File too large"}), 413

@app.errorhandler(400)
def handle_bad_request(error):
    """Handle bad request error"""
    return jsonify({"status": "error", "message": "Bad request"}), 400

@app.route('/')
def home():
    return "Swachhta Dashboard Backend is Running! Use /upload endpoint for image processing."

@app.route('/health')
def health_check():
    """Health check endpoint to verify server status"""
    return jsonify({"status": "ok", "message": "Server is running"}), 200

# ------------------------- CONFIGURATION -------------------------
UPLOAD_FOLDER = 'uploads'  # Folder to store uploaded images
ALERT_LOG_FILE = 'alerts.json'  # File to store alerts
GARBAGE_CLASSES = ['plastic', 'metal', 'glass', 'cardboard', 'paper', 'trash', 'bottle', 'cup']  # Classes to detect

# Create uploads folder if not exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# ------------------------- MODEL LOADING -------------------------
MODEL_PATHS = {
    'custom': 'runs/detect/train14/weights/best.pt'
}

# Check model paths
for name, path in MODEL_PATHS.items():
    if not os.path.exists(path):
        raise FileNotFoundError(f"{name} model not found at: {path}")

# Load YOLO model
custom_model = YOLO('yolov8n.pt')

# Print available classes for debugging
print("Available classes:", custom_model.names)

# ------------------------- HELPER FUNCTIONS -------------------------
def initialize_alert_log():
    """Create empty alerts file if not exists"""
    if not os.path.exists(ALERT_LOG_FILE):
        with open(ALERT_LOG_FILE, 'w') as f:
            json.dump([], f)

def log_alert(alert_data):
    """Save alert to JSON file"""
    try:
        if not os.path.exists(ALERT_LOG_FILE):
            initialize_alert_log()
            
        with open(ALERT_LOG_FILE, 'r+') as f:
            try:
                alerts = json.load(f)
            except json.JSONDecodeError:
                alerts = []
            alerts.append(alert_data)
            f.seek(0)  # Fix: Added parentheses
            f.truncate()
            json.dump(alerts, f, indent=4)
            print(f"Alert logged: {alert_data}")
    except Exception as e:
        print(f"Error logging alert: {e}")

def get_all_alerts():
    """Read all alerts from JSON file"""
    if os.path.exists(ALERT_LOG_FILE):
        with open(ALERT_LOG_FILE, 'r') as f:
            return json.load(f)
    return []

def process_image(image_path):
    """Process image with YOLO model"""
    try:
        print(f"Starting image processing for: {image_path}")
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Failed to read image from: {image_path}")
            
        # Run detection with more permissive settings
        results = custom_model(
            source=img,
            conf=0.25,     # Lower confidence threshold
            iou=0.45,      # Standard IOU
            verbose=True,   # Enable verbose output
            classes=None,   # Detect all classes
            device='cpu'    # Force CPU inference
        )
        
        detected_classes = []
        class_confidences = {}  # Store confidence scores for each class

        for result in results:
            boxes = result.boxes
            for box in boxes:
                class_id = int(box.cls[0])
                class_name = custom_model.names[class_id]
                confidence = float(box.conf[0])
                
                # Store highest confidence for each class
                if class_name not in class_confidences or confidence > class_confidences[class_name]:
                    class_confidences[class_name] = confidence

                print(f"Found: {class_name} ({confidence:.2f})")
                
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                
                # Draw all detections
                color = (0, 255, 0)  # Green for all detections
                cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
                label = f"{class_name} ({confidence:.2f})"
                cv2.putText(img, label, (x1, y1-10), 
                          cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
                
                if class_name not in detected_classes:  # Avoid duplicates
                    detected_classes.append(class_name)

        # Save processed image
        processed_filename = f"processed_{os.path.basename(image_path)}"
        processed_path = os.path.join(app.config['UPLOAD_FOLDER'], processed_filename)
        success = cv2.imwrite(processed_path, img)
        if not success:
            raise ValueError("Failed to save processed image")

        # Log alerts for detected classes in GARBAGE_CLASSES
        relevant_classes = [cls for cls in detected_classes if cls in GARBAGE_CLASSES]
        if relevant_classes:
            alert_data = {
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "classes": relevant_classes,
                "image_path": processed_filename,
                "confidences": {cls: class_confidences[cls] for cls in relevant_classes}
            }
            log_alert(alert_data)

        return processed_path, detected_classes, class_confidences

    except Exception as e:
        print(f"Critical error in process_image: {str(e)}")
        return image_path, [], {}

# ------------------------- API ROUTES -------------------------
@app.route('/upload', methods=['POST', 'OPTIONS'])
def handle_upload():
    if request.method == 'OPTIONS':
        return app.make_default_options_response()

    try:
        # Add request size validation early
        if not request.content_length:
            return jsonify({"status": "error", "error": "Empty request"}), 400
            
        if request.content_length > app.config['MAX_CONTENT_LENGTH']:
            return jsonify({"status": "error", "error": "File too large"}), 413

        # Debugging log for incoming request
        print("Incoming request headers:", request.headers)
        print("Incoming request data size:", len(request.data) if request.data else "No data")

        # Add request size check
        content_length = request.content_length
        if content_length and content_length > app.config['MAX_CONTENT_LENGTH']:
            print("Error: File too large")
            return jsonify({"status": "error", "error": "File too large"}), 413

        if not request.is_json:
            print("Error: Content-Type must be application/json")
            return jsonify({"status": "error", "error": "Content-Type must be application/json"}), 400

        # Get base64 image data
        data = request.json
        if not data or 'image' not in data:
            print("Error: No image data received")
            return jsonify({"status": "error", "error": "No image data received"}), 400

        # Decode base64 image
        try:
            header, encoded = data['image'].split(",", 1)
            image_data = base64.b64decode(encoded)
            nparr = np.frombuffer(image_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                print("Error: Invalid image data")
                return jsonify({"status": "error", "error": "Invalid image data"}), 400
        except Exception as e:
            print(f"Error decoding image: {str(e)}")
            return jsonify({"status": "error", "error": "Failed to decode image"}), 400

        # Save original image
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        original_filename = f"original_{timestamp}.jpg"
        original_path = os.path.join(app.config['UPLOAD_FOLDER'], original_filename)
        
        if not cv2.imwrite(original_path, img):
            print("Error: Failed to save image")
            return jsonify({"status": "error", "error": "Failed to save image"}), 500

        # Process image
        processed_path, detected_classes, confidences = process_image(original_path)
        if not os.path.exists(processed_path):
            print("Error: Processed image file not found")
            raise ValueError("Processed image file not found")
            
        return jsonify({
            "status": "success",
            "processed_image": os.path.basename(processed_path),
            "detected_classes": detected_classes,  # Include detected classes in response
            "confidences": confidences,  # Include confidence scores
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })

    except Exception as e:
        print(f"Upload error: {str(e)}")  # Debug log
        return jsonify({
            "status": "error", 
            "error": f"Image processing failed: {str(e)}"
        }), 500

@app.route('/alerts/list', methods=['GET'])
def list_alerts():
    """Get all alerts from JSON file"""
    try:
        alerts = get_all_alerts()
        return jsonify({"status": "success", "alerts": alerts})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/alerts/delete', methods=['POST'])
def delete_alert():
    """Delete an alert and its associated image"""
    try:
        data = request.json
        if not data or 'timestamp' not in data:
            return jsonify({"status": "error", "message": "Invalid request data"}), 400

        timestamp = data['timestamp']
        alerts = get_all_alerts()
        updated_alerts = []
        image_to_delete = None

        for alert in alerts:
            if (alert['timestamp'] == timestamp):
                image_to_delete = alert.get('image_path')
            else:
                updated_alerts.append(alert)

        # Update the alerts.json file
        with open(ALERT_LOG_FILE, 'w') as f:
            json.dump(updated_alerts, f, indent=4)

        # Delete the associated image file
        if image_to_delete:
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_to_delete)
            if os.path.exists(image_path):
                os.remove(image_path)

        return jsonify({"status": "success", "message": "Alert deleted successfully"}), 200

    except Exception as e:
        print(f"Error deleting alert: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/uploads/<filename>')
def serve_image(filename):
    """Serve uploaded images"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.errorhandler(500)
def handle_500_error(e):
    return jsonify({"status": "error", "message": "Internal server error"}), 500

# ------------------------- START APPLICATION -------------------------
if __name__ == '__main__':
    initialize_alert_log()
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)