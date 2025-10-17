import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

from ultralytics import YOLO

model = YOLO('runs/detect/train14/weights/best.pt')
metrics = model.val()

print("Precision:", metrics['metrics/precision'])
print("Recall:", metrics['metrics/recall'])
print("mAP50:", metrics['metrics/mAP50'])
print("mAP50-95:", metrics['metrics/mAP50-95'])
