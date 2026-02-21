from PIL import Image
import os
import sys

def crop_transparency(image_path, alpha_threshold=10):
    try:
        img = Image.open(image_path).convert("RGBA")
        
        # Get the alpha channel
        alpha = img.split()[3]
        
        # Get bounding box of non-transparent pixels
        # A pixel is considered non-transparent if its alpha > alpha_threshold
        bbox = alpha.point(lambda p: 255 if p > alpha_threshold else 0).getbbox()
        
        if bbox:
            print(f"Cropping {image_path} from {img.size} to {bbox[2]-bbox[0]}x{bbox[3]-bbox[1]}")
            cropped_img = img.crop(bbox)
            cropped_img.save(image_path)
            print(f"Successfully cropped {image_path}")
        else:
            print(f"Warning: {image_path} is completely transparent or below threshold.")
            
    except Exception as e:
        print(f"Error processing {image_path}: {e}")

# Process the three requested files
files_to_crop = [
    "/Users/intrasepriansa/Herd/TPLK004/resources/js/assets/admin/qr-builder/token-icon.png",
    "/Users/intrasepriansa/Herd/TPLK004/resources/js/assets/admin/qr-builder/token-aktif-icon.png",
    "/Users/intrasepriansa/Herd/TPLK004/resources/js/assets/admin/qr-builder/qr-icon.png"
]

for file_path in files_to_crop:
    if os.path.exists(file_path):
        crop_transparency(file_path)
    else:
        print(f"Error: File not found - {file_path}")
