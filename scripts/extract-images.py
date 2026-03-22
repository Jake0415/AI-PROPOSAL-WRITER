#!/usr/bin/env python3
"""하이브리드 PDF 이미지 추출 (PyMuPDF)
1차: get_images() - 임베딩된 이미지 객체 추출
2차: get_pixmap() - imagePages의 벡터 도표를 페이지 렌더링으로 캡처
"""
import sys
import os
import json

try:
    import fitz  # PyMuPDF
except ImportError:
    print(json.dumps({"error": "PyMuPDF not installed", "element_images": [], "page_renders": [], "total": 0}))
    sys.exit(0)

MIN_SIZE = 50       # 이미지 객체 최소 크기 (px)
RENDER_DPI = 150    # 페이지 렌더링 해상도


def extract_element_images(doc, output_dir: str) -> list:
    """1차: PDF 내 임베딩된 이미지 객체 추출"""
    images = []
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

                if width < MIN_SIZE or height < MIN_SIZE:
                    continue

                image_bytes = base_image["image"]
                ext = base_image.get("ext", "png")

                filename = f"element_p{page_num + 1}_i{img_idx + 1}.png"
                filepath = os.path.join(output_dir, filename)

                if ext == "png":
                    with open(filepath, "wb") as f:
                        f.write(image_bytes)
                else:
                    pix = fitz.Pixmap(image_bytes)
                    if pix.n > 4:
                        pix = fitz.Pixmap(fitz.csRGB, pix)
                    pix.save(filepath)

                images.append({
                    "page": page_num + 1,
                    "index": img_idx + 1,
                    "width": width,
                    "height": height,
                    "path": filepath,
                    "filename": filename,
                    "type": "element",
                })
            except Exception:
                continue
    return images


def render_image_pages(doc, output_dir: str, page_numbers: list) -> list:
    """2차: 지정된 페이지를 PNG로 렌더링 (벡터 도표 캡처)"""
    renders = []
    for page_num in page_numbers:
        if page_num < 1 or page_num > len(doc):
            continue
        try:
            page = doc[page_num - 1]
            pix = page.get_pixmap(dpi=RENDER_DPI)

            filename = f"render_p{page_num}.png"
            filepath = os.path.join(output_dir, filename)
            pix.save(filepath)

            renders.append({
                "page": page_num,
                "index": 0,
                "width": pix.width,
                "height": pix.height,
                "path": filepath,
                "filename": filename,
                "type": "page_render",
            })
        except Exception:
            continue
    return renders


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: extract-images.py <pdf_path> <output_dir> [--image-pages 3,7,12]"}))
        sys.exit(1)

    pdf_path = sys.argv[1]
    output_dir = sys.argv[2]

    # --image-pages 파싱
    image_pages = []
    for i, arg in enumerate(sys.argv):
        if arg == "--image-pages" and i + 1 < len(sys.argv):
            image_pages = [int(p) for p in sys.argv[i + 1].split(",") if p.strip().isdigit()]

    if not os.path.exists(pdf_path):
        print(json.dumps({"error": f"File not found: {pdf_path}", "element_images": [], "page_renders": [], "total": 0}))
        sys.exit(1)

    os.makedirs(output_dir, exist_ok=True)
    doc = fitz.open(pdf_path)

    # 1차: 이미지 객체 추출
    element_images = extract_element_images(doc, output_dir)

    # 1차에서 추출된 페이지는 2차에서 제외 (중복 방지)
    element_pages = set(img["page"] for img in element_images)
    render_pages = [p for p in image_pages if p not in element_pages]

    # 2차: imagePages 페이지 렌더링
    page_renders = render_image_pages(doc, output_dir, render_pages)

    doc.close()

    print(json.dumps({
        "element_images": element_images,
        "page_renders": page_renders,
        "total": len(element_images) + len(page_renders),
    }))
