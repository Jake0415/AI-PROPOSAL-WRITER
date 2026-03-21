#!/usr/bin/env python3
"""PDF에서 개별 이미지를 추출하는 스크립트 (PyMuPDF/fitz 사용)"""
import sys
import os
import json

try:
    import fitz  # PyMuPDF
except ImportError:
    print(json.dumps({"error": "PyMuPDF not installed", "images": [], "count": 0}))
    sys.exit(0)

MIN_SIZE = 50  # 최소 50x50px 이상만 추출


def extract_images(pdf_path: str, output_dir: str) -> list:
    """PDF에서 이미지를 추출하여 PNG로 저장"""
    os.makedirs(output_dir, exist_ok=True)
    images = []

    doc = fitz.open(pdf_path)
    for page_num in range(len(doc)):
        page = doc[page_num]
        image_list = page.get_images(full=True)

        for img_idx, img_info in enumerate(image_list):
            xref = img_info[0]
            try:
                base_image = doc.extract_image(xref)
                if not base_image:
                    continue

                width = base_image["width"]
                height = base_image["height"]

                # 너무 작은 이미지 스킵 (아이콘, 장식 등)
                if width < MIN_SIZE or height < MIN_SIZE:
                    continue

                image_bytes = base_image["image"]
                ext = base_image.get("ext", "png")

                filename = f"page{page_num + 1}_img{img_idx + 1}.png"
                filepath = os.path.join(output_dir, filename)

                if ext == "png":
                    with open(filepath, "wb") as f:
                        f.write(image_bytes)
                else:
                    # PNG가 아닌 경우 pixmap으로 변환
                    pix = fitz.Pixmap(image_bytes)
                    if pix.n > 4:  # CMYK → RGB
                        pix = fitz.Pixmap(fitz.csRGB, pix)
                    pix.save(filepath)

                images.append({
                    "page": page_num + 1,
                    "index": img_idx + 1,
                    "width": width,
                    "height": height,
                    "path": filepath,
                    "filename": filename,
                })
            except Exception:
                continue

    doc.close()
    return images


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: extract-images.py <pdf_path> <output_dir>", "images": [], "count": 0}))
        sys.exit(1)

    pdf_path = sys.argv[1]
    output_dir = sys.argv[2]

    if not os.path.exists(pdf_path):
        print(json.dumps({"error": f"File not found: {pdf_path}", "images": [], "count": 0}))
        sys.exit(1)

    result = extract_images(pdf_path, output_dir)
    print(json.dumps({"images": result, "count": len(result)}))
