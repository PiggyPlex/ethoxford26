import cv2
from pathlib import Path
import subprocess
from json import dumps

INPUT_IMAGE = "src/screenshot.png"
OUTPUT_DIR = Path("src/segments")
OCR_DIR = Path("src/ocr")

MIN_AREA = 5000
KERNEL_SIZE = (25, 25)
PADDING = 8


def ensure_output_dirs():
    OUTPUT_DIR.mkdir(exist_ok=True)
    OCR_DIR.mkdir(exist_ok=True)


def clear_dirs():
    for d in (OUTPUT_DIR, OCR_DIR):
        if d.exists():
            for file in d.iterdir():
                if file.is_file():
                    file.unlink()


def load_image(path: str):
    img = cv2.imread(path)
    if img is None:
        raise FileNotFoundError(f"Could not read {path}")
    return img


def preprocess(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    thresh = cv2.adaptiveThreshold(
        gray,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV,
        15,
        9,
    )

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
        if cw * ch < MIN_AREA:
            continue

        x1 = max(x - PADDING, 0)
        y1 = max(y - PADDING, 0)
        x2 = min(x + cw + PADDING, w)
        y2 = min(y + ch + PADDING, h)

        boxes.append((x1, y1, x2, y2))

    return boxes


def sort_boxes_reading_order(boxes):
    return sorted(boxes, key=lambda b: (b[1], b[0]))


def save_segments(img, boxes):
    paths = []

    for i, (x1, y1, x2, y2) in enumerate(boxes, start=1):
        crop = img[y1:y2, x1:x2]
        out_path = OUTPUT_DIR / f"{i:03}.png"
        cv2.imwrite(str(out_path), crop)
        paths.append(out_path)

    return paths


def run_tesseract(image_paths):
    results = []

    for img_path in image_paths:
        out_base = OCR_DIR / img_path.stem

        subprocess.run(
            ["tesseract", str(img_path), str(out_base)],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

        txt_path = out_base.with_suffix(".txt")
        text = txt_path.read_text(encoding="utf-8").strip()
        results.append((img_path.name, text))

    return results


def main():
    ensure_output_dirs()
    clear_dirs()

    img = load_image(INPUT_IMAGE)
    mask = preprocess(img)
    boxes = sort_boxes_reading_order(find_segments(mask, img))

    segment_paths = save_segments(img, boxes)
    ocr_results = run_tesseract(segment_paths)

    data = []

    for _, text in ocr_results:
        if len(text.strip()) == 0:
            continue
        data.append(text)

    # stdout
    print(dumps(data))

main()
