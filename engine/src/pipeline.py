import cv2
import numpy as np
import subprocess
import tempfile
import os
from PIL import Image
from typing import List, Dict

SCREENSHOT_PATH = "screenshot.png"


def segment_image(image: np.ndarray) -> List[Dict]:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Strong binarization tuned for text
    _, bw = cv2.threshold(
        gray, 0, 255,
        cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
    )

    h, w = bw.shape

    # --- PASS 1: horizontal text bands ---
    horizontal_sum = np.sum(bw > 0, axis=1)
    band_threshold = 0.02 * w  # % of row filled

    bands = []
    in_band = False
    start = 0

    for y, val in enumerate(horizontal_sum):
        if val > band_threshold and not in_band:
            start = y
            in_band = True
        elif val <= band_threshold and in_band:
            if y - start > 12:  # minimum text height
                bands.append((start, y))
            in_band = False

    if in_band:
        bands.append((start, h))

    regions = []

    # --- PASS 2: vertical blocks inside bands ---
    for y1, y2 in bands:
        band = bw[y1:y2, :]
        vertical_sum = np.sum(band > 0, axis=0)
        col_threshold = 0.01 * (y2 - y1)

        in_block = False
        x_start = 0

        for x, val in enumerate(vertical_sum):
            if val > col_threshold and not in_block:
                x_start = x
                in_block = True
            elif val <= col_threshold and in_block:
                if x - x_start > 15:
                    regions.append({
                        "x": x_start,
                        "y": y1,
                        "w": x - x_start,
                        "h": y2 - y1
                    })
                in_block = False

        if in_block:
            regions.append({
                "x": x_start,
                "y": y1,
                "w": w - x_start,
                "h": y2 - y1
            })

    # --- PASS 3: merge nearby regions ---
    merged = []
    regions.sort(key=lambda r: (r["y"], r["x"]))

    for r in regions:
        if not merged:
            merged.append(r)
            continue

        prev = merged[-1]
        same_row = abs(prev["y"] - r["y"]) < 10
        close_x = r["x"] - (prev["x"] + prev["w"]) < 15

        if same_row and close_x:
            prev["w"] = (r["x"] + r["w"]) - prev["x"]
            prev["h"] = max(prev["h"], r["h"])
        else:
            merged.append(r)

    return merged



def ocr_region(image: np.ndarray, bbox: Dict) -> str:
    """
    OCR a single region using Tesseract CLI.
    """
    x, y, w, h = bbox["x"], bbox["y"], bbox["w"], bbox["h"]
    crop = image[y:y+h, x:x+w]

    tmp_path = 'temp_region.png'

    # with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
    #     tmp_path = tmp.name

    Image.fromarray(crop).save(tmp_path)

    try:
        result = subprocess.run(
            [
                "tesseract",
                tmp_path,
                "stdout",
                # "--psm", "6",
                # "-l", "eng"
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=False,
        )

        text = result.stdout.strip()
        return text
    finally:
        os.remove(tmp_path)


def build_llm_context(screenshot_path: str) -> Dict:
    """
    Full pipeline:
    screenshot -> segments -> OCR -> structured LLM context
    """
    image = cv2.imread(screenshot_path)
    if image is None:
        raise RuntimeError(f"Failed to load {screenshot_path}")

    regions = segment_image(image)

    output = []
    for idx, r in enumerate(regions):
        text = ocr_region(image, r)

        if not text:
            confidence = "low"
        elif len(text) < 10:
            confidence = "medium"
        else:
            confidence = "high"

        output.append({
            "region_id": idx,
            "bbox": [r["x"], r["y"], r["w"], r["h"]],
            "text": text,
            "confidence_hint": confidence,
        })

    return {
        "source": screenshot_path,
        "num_regions": len(output),
        "regions": output,
    }


if __name__ == "__main__":
    context = build_llm_context(SCREENSHOT_PATH)

    # Pretty-print for inspection
    import json
    print(json.dumps(context, indent=2))
