"""G06 제공 원본과 실제 화면을 정규화해 비교한다. Pillow 필요."""
from pathlib import Path
import os
import json
from PIL import Image, ImageChops, ImageDraw, ImageStat

ROOT = Path(__file__).resolve().parents[3]
OUTPUT = Path(os.environ.get("CAPTURE_OUTPUT", ROOT / "TODO/BONSAI_FE_MOCK_PLAN/RESULTS/evidence/g06"))
(OUTPUT / "comparisons").mkdir(exist_ok=True)
frames = []
for name, flow, step in [('filter-initial', 'Filtering all templates', 1), ('filter-all', 'Filtering all templates', 2), ('filter-agreements', 'Filtering all templates', 3), ('filter-quotes', 'Filtering all templates', 4), ('filter-later-quotes', 'Filtering all templates', 5), ('quote-hero', 'Filtering all templates/Template detail', 2), ('quote-trust', 'Filtering all templates/Template detail', 3), ('quote-pricing', 'Filtering all templates/Template detail', 4), ('quote-faq', 'Filtering all templates/Template detail', 5), ('invoice-hero', 'Invoice templates', 3), ('invoice-concept', 'Invoice templates', 4), ('invoice-download-description', 'Invoice templates', 5), ('invoice-downloads', 'Invoice templates', 6), ('invoice-formats', 'Invoice templates', 7), ('invoice-industries', 'Invoice templates', 8), ('invoice-related', 'Invoice templates', 9), ('invoice-benefits', 'Invoice templates', 10), ('invoice-word', 'Invoice templates', 11)]:
    source = next((ROOT / "bonsai_analysis/flows" / flow / "screens").glob(f"{step:02d}_*.png"))
    raw = Image.open(source).convert("RGB")
    reference = raw.resize((1440, 900), Image.Resampling.LANCZOS)
    actual = Image.open(OUTPUT / f"{name}.png").convert("RGB")
    assert reference.size == actual.size
    pair = Image.new("RGB", (2880, 930), "white")
    pair.paste(reference, (0, 30)); pair.paste(actual, (1440, 30))
    draw = ImageDraw.Draw(pair)
    draw.text((12, 8), name + " | normalized source", fill="black")
    draw.text((1452, 8), "Chromium 1440 x 900 DPR 1", fill="black")
    pair.save(OUTPUT / "comparisons" / f"{name}-pair.jpg", quality=90)
    diff = ImageChops.difference(reference, actual)
    diff.save(OUTPUT / "comparisons" / f"{name}-diff.png")
    frames.append({"name": name, "source": str(source.relative_to(ROOT)), "sourcePixels": raw.size, "rgbMeanAbsoluteError": round(sum(ImageStat.Stat(diff).mean) / 3, 4)})
(OUTPUT / "visual-metrics.json").write_text(json.dumps({"method": "1440x900 normalization; original CSS viewport/DPR unknown. Catalog controls have documented mock assumptions. Template detail 01 duplicates the catalog. Invoice menu 01/02 use the existing header; no new comparison claims for those states. Pixel error is not a fidelity acceptance threshold.", "frames": frames}, indent=2))
print(json.dumps(frames))
