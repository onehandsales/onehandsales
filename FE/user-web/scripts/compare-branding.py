"""G16 원본을 1440×900으로 정규화하고 실제 캡처와 나란히 비교한다."""
import hashlib
import json
import os
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageStat

root = Path(__file__).resolve().parents[3]
source = root / 'bonsai_analysis/flows/Settings/Editing branding settings/screens'
base = Path(os.environ.get('CAPTURE_OUTPUT', '/tmp/onehandsales-g16/captures'))
output = Path(os.environ.get('COMPARISON_OUTPUT', '/tmp/onehandsales-g16/comparisons'))
output.mkdir(parents=True, exist_ok=True)
names = ['01-none-top', '02-none-lower', '03-header-menu', '04-abstract', '05-plant', '06-saved-plant']
results = []
for number, name in enumerate(names, 1):
    file = next(source.glob(f'{number:02d}_*.png'))
    raw = Image.open(file).convert('RGB')
    original = raw.resize((1440, 900), Image.Resampling.LANCZOS)
    actual = Image.open(base / f'{name}.png').convert('RGB')
    if actual.size != (1440, 900):
        raise ValueError('Implementation viewport must be 1440 × 900')
    difference = ImageChops.difference(original, actual)
    pair = Image.new('RGB', (2880, 928), 'white')
    draw = ImageDraw.Draw(pair)
    draw.text((12, 8), 'Recorded PNG normalized to 1440x900; original CSS viewport / DPR unknown', fill='black')
    draw.text((1452, 8), 'Local implementation, Chromium 1440x900 DPR1', fill='black')
    pair.paste(original, (0, 28)); pair.paste(actual, (1440, 28))
    pair.save(output / f'{name}-pair.png'); difference.save(output / f'{name}-diff.png')
    results.append({'name': name, 'source': str(file), 'sourcePixels': raw.size, 'sha256': hashlib.sha256(file.read_bytes()).hexdigest(), 'actual': str(base / f'{name}.png'), 'pair': str(output / f'{name}-pair.png'), 'meanAbsoluteRGBDifference': sum(ImageStat.Stat(difference).mean) / 3})
(output / 'visual-comparison.json').write_text(json.dumps({'normalization': '1440x900 comparison canvas, not proof of original viewport/DPR', 'metricMeaning': 'Pixel difference only; not an acceptance percentage', 'frames': results}, indent=2))
print(json.dumps({'comparedFrames': len(results), 'output': str(output)}))
