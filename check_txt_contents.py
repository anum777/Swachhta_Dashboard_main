import os

dataset_path = "C:/Users/anuma/OneDrive/Desktop/archive"  # Change to your dataset path

# List all .txt files
txt_files = [f for f in os.listdir(dataset_path) if f.endswith('.txt')]

# Read and print the first few lines of each file
for txt_file in txt_files:
    file_path = os.path.join(dataset_path, txt_file)
    print(f"\n📂 Checking file: {txt_file}")
    
    with open(file_path, "r") as file:
        lines = file.readlines()
        for line in lines[:5]:  # Print only the first 5 lines
            print(line.strip())

print("\n✅ Done checking annotation files!")
