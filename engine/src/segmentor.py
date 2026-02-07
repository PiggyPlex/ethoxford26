import cv2
import numpy as np
from PIL import Image
from pathlib import Path

INPUT_IMAGE = "screenshot.png"
OUTPUT_DIR = Path("segments")

# Tunables – adjust if needed
MIN_AREA = 5000          # ignore tiny noise regions
KERNEL_SIZE = (25, 25)   # text block grouping
PADDING = 8              # padding around crops


def ensure_output_dir():
    OUTPUT_DIR.mkdir(exist_ok=True)

def clear_output_dir():
    if OUTPUT_DIR.exists():
        for file in OUTPUT_DIR.iterdir():
            if file.is_file():
                file.unlink()


def load_image(path: str):
    img = cv2.imread(path)
    if img is None:
        raise FileNotFoundError(f"Could not read {path}")
    return img


def preprocess(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Adaptive threshold works well for mixed UI backgrounds
    thresh = cv2.adaptiveThreshold(
        gray,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV,
        15,
        9,
    )

    # Group text lines into blocks
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, KERNEL_SIZE)
    dilated = cv2.dilate(thresh, kernel, iterations=1)

    return dilated


def find_segments(mask, original_img):
    contours, _ = cv2.findContours(
        mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    h, w = original_img.shape[:2]
    boxes = []

    for c in contours:
        x, y, cw, ch = cv2.boundingRect(c)
        area = cw * ch

        if area < MIN_AREA:
            continue

        # Clamp with padding
        x1 = max(x - PADDING, 0)
        y1 = max(y - PADDING, 0)
        x2 = min(x + cw + PADDING, w)
        y2 = min(y + ch + PADDING, h)

        boxes.append((x1, y1, x2, y2))

    return boxes


def sort_boxes_reading_order(boxes):
    # Top-to-bottom, then left-to-right
    return sorted(boxes, key=lambda b: (b[1], b[0]))


def save_segments(img, boxes):
    for i, (x1, y1, x2, y2) in enumerate(boxes, start=1):
        crop = img[y1:y2, x1:x2]
        out_path = OUTPUT_DIR / f"{i:03}.png"
        cv2.imwrite(str(out_path), crop)


def main():
    ensure_output_dir()
    clear_output_dir()
    img = load_image(INPUT_IMAGE)
    mask = preprocess(img)
    boxes = find_segments(mask, img)
    boxes = sort_boxes_reading_order(boxes)
    print(boxes)
    save_segments(img, boxes)

    print(f"Saved {len(boxes)} segments to {OUTPUT_DIR}/")


if __name__ == "__main__":
    main()
