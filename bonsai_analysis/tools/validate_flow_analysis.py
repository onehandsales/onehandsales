"""Validate the Bonsai R2 document inventory without contacting external services."""
from pathlib import Path
from urllib.parse import unquote, urlsplit
import hashlib
import json
import re
import struct
import sys

BASE = Path(__file__).resolve().parents[1]
REVIEW = BASE / 'review' / '2026-11-20'
manifest = json.loads((REVIEW / 'manifest.json').read_text(encoding='utf-8'))
screens = {s['id']: s for s in manifest['screens']}
errors = []
links_checked = 0
images_checked = 0
stages_checked = 0
excluded_links = 0
source_text = (BASE / 'SOURCES.md').read_text(encoding='utf-8')
required_titles = ['출처와 검토 상태', '플로우 목적과 연결', '전체 단계표', '화면별 상세 분석', '업무 규칙과 데이터 변화', '공식 도움말과 API 대조', '데이터 모델링 시사점', '미확인 사항과 검토 질문', '검토 이력']

def check(condition, path, message):
    if not condition:
        errors.append({'path': str(path.relative_to(BASE)), 'error': message})

def anchors(text):
    result = set(re.findall(r'<a\s+id="([^"]+)"', text))
    counts = {}
    for heading in re.findall(r'^#{1,6}\s+(.+)$', text, re.M):
        heading = re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', heading)
        slug = re.sub(r'[^\w\- ]', '', heading.lower()).replace(' ', '-')
        count = counts.get(slug, 0)
        result.add(slug + (f'-{count}' if count else ''))
        counts[slug] = count + 1
    return result

def check_links(path, text):
    global links_checked, excluded_links
    for angle, plain in re.findall(r'\]\((?:<([^>]+)>|([^\s]+?))\)', text):
        url = unquote(angle or plain)
        if urlsplit(url).scheme or url.startswith('//'):
            continue
        name, sep, anchor = url.partition('#')
        target = (path.parent / name).resolve() if name else path
        # The user excluded these directories even when they are link targets.
        if {'TODO', 'TODO_LOG'} & set(target.parts):
            excluded_links += 1
            continue
        links_checked += 1
        check(target.exists(), path, f'Broken link: {url}')
        if target.is_file() and anchor and target.suffix.lower() == '.md':
            check(anchor in anchors(target.read_text(encoding='utf-8')), path, f'Missing anchor: {url}')

expected_paths = {BASE / 'flows' / f['path'] / 'ANALYSIS.md' for f in manifest['flows']}
actual_paths = set((BASE / 'flows').rglob('ANALYSIS.md'))
check(actual_paths == expected_paths, BASE, 'ANALYSIS.md inventory differs from 134-flow manifest')
for f in manifest['flows']:
    path = BASE / 'flows' / f['path'] / 'ANALYSIS.md'
    if not path.is_file():
        check(False, path, 'Missing analysis')
        continue
    raw = path.read_bytes()
    text = raw.decode('utf-8').replace('\r\n', '\n')
    count = len(f['screens'])
    check(hashlib.sha256(text.encode()).hexdigest() == f['analysis_sha256'], path, 'Analysis changed since review manifest')
    headings = re.findall(r'^## (\d+)\. (.+)$', text, re.M)
    check(headings == [(str(i), title) for i, title in enumerate(required_titles, 1)], path, 'Nine-section structure')
    check(f'실제 이미지 재확인 **{count}/{count}단계**' in text, path, 'Visual coverage count')
    check(f'`{f["flow_id"]}`' in text, path, 'Flow ID')
    check('R2 누락·내용 재검토 완료(정적 캡처 범위)' in text, path, 'R2 status')
    for marker in ['### 진입 조건과 확인된 종료 범위', '- 진입:', '- 종료:', '- 관련 흐름:', '**원본에 없는 분기·남은 범위:**', '### 단계별 미확인 사항', '2026-11-20 KST']:
        check(marker in text, path, f'Missing marker: {marker}')
    parts = re.split(r'^## \d+\. .+$', text, flags=re.M)
    if len(parts) != 10:
        continue
    table_ids = re.findall(r'^\| \d+ \| \[`(sc_\w+)`\]', parts[3], re.M)
    detail_ids = re.findall(r'^- Screen ID: `(sc_\w+)`', parts[4], re.M)
    check(table_ids == f['screens'] == detail_ids, path, 'Stage IDs/order mismatch')
    check(len(re.findall(r'^\| \d+ \|', parts[5], re.M)) == count, path, 'State table count')
    check(len(re.findall(r'^- 단계 \d+:', parts[8], re.M)) == count, path, 'Stage question count')
    stage_blocks = re.split(r'^### 단계 \d+ — .+$', parts[4], flags=re.M)[1:]
    check(len(stage_blocks) == count, path, 'Stage detail count')
    for step, (sid, block) in enumerate(zip(f['screens'], stage_blocks), 1):
        stages_checked += 1
        for marker in ['- 원본:', '- 로컬 이미지:', '- 실제 이미지 확인일:', '- R2 이미지 재검토:', '- 이미지 크기:', '- 이전·다음 단계:', '#### 화면에서 직접 확인한 내용', '#### 동작과 데이터', '#### 모델링 영향', '- 미확인:']:
            check(marker in block, path, f'Stage {step}: missing {marker}')
        expected_prev = f['screens'][step-2] if step > 1 else '플로우 시작'
        expected_next = f['screens'][step] if step < count else '플로우 기록 종료'
        check(f'`{expected_prev}` → 현재 → `{expected_next}`' in block, path, f'Stage {step}: previous/next')
        asset = path.parent / 'screens' / f'{step:02d}_{sid}.png'
        check(asset.is_file(), path, f'Missing image: {asset.name}')
        if asset.is_file():
            data = asset.read_bytes(); images_checked += 1
            check(data[:8] == b'\x89PNG\r\n\x1a\n', path, f'PNG signature: {asset.name}')
            check(len(data) >= 24 and struct.unpack('>II', data[16:24]) == (2880, 1800), path, f'PNG size: {asset.name}')
            check(hashlib.sha256(data).hexdigest() == screens[sid]['sha256'], path, f'PNG hash: {asset.name}')
        if 'source_url' in screens[sid]:
            check(screens[sid]['source_url'] in block, path, f'Stage {step}: source URL')
    cited_urls = set(re.findall(r'\]\((https?://[^)]+)\)', parts[6]))
    for source in manifest['sources']:
        if source['url'] in cited_urls:
            check(f'#s{source["n"]:03d}' in parts[6], path, f'Source anchor for {source["n"]}')
    check_links(path, text)

for path in [BASE / 'README.md', BASE / 'SOURCES.md', REVIEW / 'REPORT.md']:
    check_links(path, path.read_text(encoding='utf-8'))
check(len(re.findall(r'<a id="s\d{3}"></a>', source_text)) == 93, BASE / 'SOURCES.md', 'Expected 93 source entries')
result = {'review_date': manifest['review_date'], 'documents': len(expected_paths), 'stages_checked': stages_checked, 'unique_screens': len(screens), 'image_files_checked': images_checked, 'local_links_checked': links_checked, 'excluded_link_targets_not_read': excluded_links, 'official_source_entries': len(manifest['sources']), 'error_count': len(errors), 'errors': errors}
(REVIEW / 'validation.json').write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(json.dumps(result, ensure_ascii=False, indent=2))
sys.exit(bool(errors))
