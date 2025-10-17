import os

# Change this path to the actual dataset folder where images and labels are stored
dataset_path = "C:/Users/anuma/OneDrive/Desktop/archive"  # Example: "C:/Users/YourName/Documents/GarbageDataset"

# List all .txt files
txt_files = [f for f in os.listdir(dataset_path) if f.endswith('.txt')]

if txt_files:
    print("Found annotation files:", txt_files)
else:
    print("No annotation files found.")


