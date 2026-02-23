from PIL import Image, ImageDraw

def make_rounded_crop(image_path, corner_radius, crop_margin):
    try:
        im = Image.open(image_path).convert('RGBA')
        width, height = im.size
        print(f"Original {image_path}: {width}x{height}")
        
        # Center crop the primary icon by shaving off a margin to get rid of dark borders
        bbox = (crop_margin, crop_margin, width - crop_margin, height - crop_margin)
        im = im.crop(bbox)
        
        width, height = im.size
        
        # Create a mask for rounded corners
        mask = Image.new('L', (width, height), 0)
        draw = ImageDraw.Draw(mask)
        draw.rounded_rectangle((0, 0, width, height), radius=corner_radius, fill=255)
        
        # Apply mask
        im.putalpha(mask)
        
        im.save(image_path)
        print(f'Successfully masked and cropped {image_path} to size {width}x{height}')
    except Exception as e:
        print(f'Error: {e}')

make_rounded_crop('/Users/intrasepriansa/Herd/TPLK004/resources/js/assets/admin/informasi-tugas/draft.png', corner_radius=110, crop_margin=45)
make_rounded_crop('/Users/intrasepriansa/Herd/TPLK004/resources/js/assets/admin/informasi-tugas/informasi-tugas.png', corner_radius=110, crop_margin=45)
