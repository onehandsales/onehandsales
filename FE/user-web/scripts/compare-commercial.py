"""G04 원본·실제 캡처를 동일한 정규화 해상도로 비교한다. Pillow 필요."""
from pathlib import Path
import json
import os
from PIL import Image, ImageChops, ImageDraw, ImageStat

ROOT = Path(__file__).resolve().parents[3]
OUTPUT = Path(os.environ.get("CAPTURE_OUTPUT", ROOT / "TODO/BONSAI_FE_MOCK_PLAN/RESULTS/evidence/g04"))
(OUTPUT / "comparisons").mkdir(exist_ok=True)
metrics = []
for prefix, flow, count in [("pricing", "Pricing", 3), ("reviews", "Reviews", 4)]:
    for step in range(1, count + 1):
        name = f"{prefix}-{step:02d}"
        source = next((ROOT / "bonsai_analysis/flows" / flow / "screens").glob(f"{step:02d}_*.png"))
        raw = Image.open(source).convert("RGB")
        reference = raw.resize((1440, 900), Image.Resampling.LANCZOS)
        actual = Image.open(OUTPUT / f"{name}.png").convert("RGB")
        assert actual.size == reference.size
        diff = ImageChops.difference(reference, actual)
        pair = Image.new("RGB", (2880, 930), "white")
        pair.paste(reference, (0, 30)); pair.paste(actual, (1440, 30))
        draw = ImageDraw.Draw(pair)
        draw.text((12, 8), f"{name} | normalized original", fill="black")
        draw.text((1452, 8), "Chromium 1440 x 900 DPR 1", fill="black")
        pair.save(OUTPUT / "comparisons" / f"{name}-pair.jpg", quality=90)
        Image.blend(reference, actual, .5).save(OUTPUT / "comparisons" / f"{name}-overlay.png")
        diff.save(OUTPUT / "comparisons" / f"{name}-diff.png")
        metric = {"name": name, "source": str(source.relative_to(ROOT)), "sourcePixels": raw.size,
                  "rgbMeanAbsoluteError": round(sum(ImageStat.Stat(diff).mean) / 3, 4)}
        old = OUTPUT / "before-review" / f"{name}.png"
        if old.exists():
            metric["beforeRgbMeanAbsoluteError"] = round(sum(ImageStat.Stat(ImageChops.difference(reference, Image.open(old).convert("RGB"))).mean) / 3, 4)
        metrics.append(metric)
(OUTPUT / "visual-metrics.json").write_text(json.dumps({"method": "Lanczos normalization; no masking or correction; differences do not prove visual equivalence", "frames": metrics}, indent=2) + "\n")
print(json.dumps(metrics))
