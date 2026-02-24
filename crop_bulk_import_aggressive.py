import os
from PIL import Image

TARGET_DIR = '/Users/intrasepriansa/Herd/TPLK004/resources/js/assets/admin/bulk-import'

def crop_transparent_borders(image_path):
    print(f"Processing: {image_path}")
    img = Image.open(image_path)
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    # Get the bounding box of non-transparent areas
    # getbbox() returns (left, upper, right, lower)
    # PIL's getbbox() sometimes fails to perfectly detect semi-transparent pixels
    # We can try multiplying alpha to force 0/255
    bg = Image.new("RGBA", img.size, (255, 255, 255, 0))
    diff = Image.composite(img, bg, img)
    bbox = diff.getbbox()
    
    if bbox:
        # Check if the image needs cropping
        if bbox != (0, 0, img.width, img.height):
            print(f"  Cropping from {img.size} to (width: {bbox[2]-bbox[0]}, height: {bbox[3]-bbox[1]})")
            cropped_img = img.crop(bbox)
            cropped_img.save(image_path, "PNG")
            print(f"  Saved {image_path}")
        else:
            print("  No transparent borders found via getbbox. Skipping.")
    else:
        print("  Image is completely transparent. Skipping.")

def main():
    if not os.path.exists(TARGET_DIR):
        print(f"Directory not found: {TARGET_DIR}")
        return

    for filename in os.listdir(TARGET_DIR):
        if filename.endswith(".png"):
            filepath = os.path.join(TARGET_DIR, filename)
            crop_transparent_borders(filepath)

if __name__ == '__main__':
    main()
