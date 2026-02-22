from PIL import Image
import os

icons_dir = "resources/js/assets/admin/live-monitor"

icons = [
    "live-monitor-icon.png",
    "sesi-aktif-icon.png",
    "scan-icon.png",
    "hadir-icon.png",
    "anomali-icon.png",
]

for icon_name in icons:
    path = os.path.join(icons_dir, icon_name)
    if not os.path.exists(path):
        print(f"  SKIP: {icon_name} not found")
        continue

    img = Image.open(path).convert("RGBA")
    w, h = img.size
    print(f"\n{icon_name}: original {w}x{h}")

    # Find bounding box of non-white/non-transparent content
    # Check each pixel - if it's not white-ish and not transparent, it's content
    pixels = img.load()
    min_x, min_y, max_x, max_y = w, h, 0, 0

    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            # If pixel is not nearly white and not transparent
            if a > 30 and not (r > 240 and g > 240 and b > 240):
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)

    if max_x <= min_x or max_y <= min_y:
        print(f"  SKIP: Could not find content bounds")
        continue

    # Add a small padding (5% of content size)
    content_w = max_x - min_x
    content_h = max_y - min_y
    pad = int(min(content_w, content_h) * 0.03)

    crop_x1 = max(0, min_x - pad)
    crop_y1 = max(0, min_y - pad)
    crop_x2 = min(w, max_x + pad)
    crop_y2 = min(h, max_y + pad)

    cropped = img.crop((crop_x1, crop_y1, crop_x2, crop_y2))
    cw, ch = cropped.size
    print(f"  Cropped to {cw}x{ch} (removed {w - cw}px width, {h - ch}px height)")

    cropped.save(path)
    print(f"  Saved: {path}")

print("\nDone! All live monitor icons cropped.")
