import os
import cv2

image_folder = 'path/to/your/images'  # change this

for filename in os.listdir(image_folder):
    if filename.endswith(('.jpg', '.jpeg', '.png')):
        filepath = os.path.join(image_folder, filename)
        img = cv2.imread(filepath)
        if img is None:
            print(f"Corrupted or unreadable: {filename}")
