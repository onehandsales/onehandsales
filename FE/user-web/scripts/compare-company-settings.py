"""G15 제공 원본과 실제 화면을 정규화해 비교한다. Pillow 필요."""
from pathlib import Path
import os
import json
from PIL import Image, ImageChops, ImageDraw, ImageStat

ROOT = Path(__file__).resolve().parents[3]
OUTPUT = Path(os.environ.get("CAPTURE_OUTPUT", ROOT / "TODO/BONSAI_FE_MOCK_PLAN/RESULTS/evidence/g15"))
(OUTPUT / "comparisons").mkdir(exist_ok=True)
frames = []
for name, flow, step in [(f"details-{n:02d}","Dashboard/Adding company details",n) for n in range(1,9)] + [(f"logo-{n:02d}","Dashboard/Adding company details/Uploading company logo",n) for n in range(1,5)] + [(f"profile-{n:02d}","Settings/Disabling public profile",n) for n in range(1,4)]:
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
(OUTPUT / "visual-metrics.json").write_text(json.dumps({"method": "1440x900 normalization; original CSS viewport/DPR unknown. 15 source states; logo loading screenshot interpretation unconfirmed. Source image thumbnail reused only as a test file; contact/slug/sample identity and currency handling differ explicitly. Pixel error is not a fidelity acceptance threshold.", "frames": frames}, indent=2))
print(json.dumps(frames))
