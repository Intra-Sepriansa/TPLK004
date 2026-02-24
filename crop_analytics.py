import sys
from PIL import Image
import numpy as np

def crop_image(image_path):
    print(f"Processing {image_path}...")
    try:
        img = Image.open(image_path).convert("RGBA")
        data = np.array(img)
        alpha = data[:, :, 3]
        
        # Aggressive alpha threshold (50) to remove soft shadows completely
        mask = alpha > 50
        y_indices, x_indices = np.where(mask)
        
        if len(y_indices) == 0 or len(x_indices) == 0:
            print(f"Gambar {image_path} kosong atau sepenuhnya transparan.")
            return
            
        y_min, y_max = y_indices.min(), y_indices.max()
        x_min, x_max = x_indices.min(), x_indices.max()
        
        # Minimal padding to keep it tight
        padding = 0
        y_min = max(0, y_min - padding)
        y_max = min(img.height, y_max + padding)
        x_min = max(0, x_min - padding)
        x_max = min(img.width, x_max + padding)
        
        print(f"Original size: {img.size}")
        print(f"Cropped to: ({x_min}, {y_min}, {x_max}, {y_max}) -> {x_max-x_min}x{y_max-y_min}")
        
        cropped_img = img.crop((x_min, y_min, x_max, y_max))
        cropped_img.save(image_path, "PNG")
        print(f"Success! Saved to {image_path}\n")
        
    except Exception as e:
        print(f"Error processing {image_path}: {e}\n")

if __name__ == "__main__":
    for path in sys.argv[1:]:
        crop_image(path)
