"""Gummble 원본과 실제 브라우저 캡처를 같은 크기로 비교한다. Pillow 필요."""
from pathlib import Path
import json
import os
from PIL import Image, ImageChops, ImageDraw, ImageStat

ROOT = Path(__file__).resolve().parents[3]
OUTPUT = Path(os.environ.get("CAPTURE_OUTPUT", ROOT / "TODO/BONSAI_FE_MOCK_PLAN/RESULTS/evidence/g02"))
FLOWS = ROOT / "bonsai_analysis/flows"
SIZE = (1440, 900)

# 기능 : 원본 파일을 정규화하고 나란히 보기·오버레이·차이와 수치를 기록한다.
def compare(name, source, metrics):
    raw = Image.open(source).convert("RGB")
    reference = raw.resize(SIZE, Image.Resampling.LANCZOS)
    actual = Image.open(OUTPUT / f"{name}.png").convert("RGB")
    assert actual.size == SIZE
    difference = ImageChops.difference(reference, actual)
    preview = Image.new("RGB", (2880, 930), "white")
    preview.paste(reference, (0, 30))
    preview.paste(actual, (1440, 30))
    draw = ImageDraw.Draw(preview)
    draw.text((12, 8), f"{name} | Gummble normalized 1440x900", fill="black")
    draw.text((1452, 8), "Implementation | Chromium 1440x900 DPR1", fill="black")
    preview.save(OUTPUT / "comparisons" / f"{name}-pair.jpg", quality=90)
    Image.blend(reference, actual, .5).save(OUTPUT / "comparisons" / f"{name}-overlay.png")
    difference.save(OUTPUT / "comparisons" / f"{name}-diff.png")
    means = ImageStat.Stat(difference).mean
    histogram = difference.convert("L").histogram()
    result = {"name": name, "source": str(source.relative_to(ROOT)).replace("\\", "/"),
              "originalPixels": raw.size, "comparisonPixels": SIZE,
              "rgbMeanAbsoluteError": round(sum(means) / 3, 4),
              "lumaDifferenceAbove16Percent": round(sum(histogram[17:]) / (1440 * 900) * 100, 3)}
    previous = OUTPUT / "before-review" / f"{name}.png"
    if previous.exists():
        old = ImageChops.difference(reference, Image.open(previous).convert("RGB"))
        result["beforeRgbMeanAbsoluteError"] = round(sum(ImageStat.Stat(old).mean) / 3, 4)
    metrics.append(result)

(OUTPUT / "comparisons").mkdir(exist_ok=True)
metrics = []
for number in range(1, 12):
    compare(f"step-{number:02d}", next((FLOWS / "Landing page/screens").glob(f"{number:02d}_*.png")), metrics)
for name, flow, step in [("hero", "Logging in", 1), ("menu-product", "Products (CRM)", 1),
                          ("menu-industries", "Industries (Consulting)", 1), ("menu-resources", "Blog", 1),
                          ("menu-templates", "Invoice templates", 1), ("menu-invoice", "Invoice templates", 2)]:
    if (OUTPUT / f"{name}.png").exists():
        compare(name, next((FLOWS / flow / "screens").glob(f"{step:02d}_*.png")), metrics)
(OUTPUT / "visual-metrics.json").write_text(json.dumps({"method": "RGB absolute difference; original resized Lanczos; no masks or color correction; metrics do not establish visual parity", "frames": metrics}, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(metrics, ensure_ascii=False))
