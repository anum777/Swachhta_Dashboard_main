import os
import random
import shutil

# Set paths
dataset_path = "C:/Users/anuma/OneDrive/Desktop/archive"  # ✅ Corrected folder name
train_path = "C:/Users/anuma/OneDrive/Desktop/swacchta_dashboard_project_2/datasets/train/"
valid_path = "C:/Users/anuma/OneDrive/Desktop/swacchta_dashboard_project_2/datasets/valid/"

# Create folders if they do not exist
for folder in [train_path, valid_path]:
    os.makedirs(os.path.join(folder, "images"), exist_ok=True)
    os.makedirs(os.path.join(folder, "labels"), exist_ok=True)

# Get list of images
images = [f for f in os.listdir(dataset_path) if f.endswith(".jpg") or f.endswith(".png")]
random.shuffle(images)

# Split (80% train, 20% valid)
split_index = int(0.8 * len(images))
train_images = images[:split_index]
valid_images = images[split_index:]


# Move files
def move_files(image_list, dest_folder):
    for img in image_list:
        label_file = img.replace(".jpg", ".txt").replace(".png", ".txt")
        img_path = os.path.join(dataset_path, img)
        label_path = os.path.join(dataset_path, label_file)

        # Check if label file exists before moving
        if os.path.exists(label_path):
            shutil.move(img_path, os.path.join(dest_folder, "images", img))
            shutil.move(label_path, os.path.join(dest_folder, "labels", label_file))
        else:
            print(f"Warning: Label file not found for {img}")

move_files(train_images, train_path)
move_files(valid_images, valid_path)

print("✅ Dataset splitting done!")
