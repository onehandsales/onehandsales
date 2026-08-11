# UXUI Agent Review

상태: Confirmed

## 1. 목적

10번 문서가 `AGENT/UXUI_AGENT` 기준을 따라 모바일 현장 업무에 맞는 User Web 경험을 만들도록 검토한다.

## 2. 확인한 기준

- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`

## 3. 반영 결과

| 기준 | 10번 반영 |
|---|---|
| 작업 중심 UI | landing/hero가 아니라 `/app` 업무 화면에서 바로 촬영/녹음/설정 행동을 시작 |
| Notion/Attio reference | 조용하고 밀도 있는 업무 도구 톤 유지 |
| 모바일 현장 흐름 | 명함 촬영, 회의 녹음, local draft 복구를 빠른 현장 입력 흐름으로 구성 |
| UX writing | 실패/권한 문구를 짧고 행동 중심으로 작성 |
| 오류 상태 | OCR 실패, 녹음 권한 거부, 브라우저 미지원, push denied/default 상태별 다음 행동 제공 |
| responsive QA | 360px/390px viewport 검증을 goal 체크리스트에 포함 |

## 4. 금지한 UX 방향

- feature 설명용 landing page
- 장식용 hero 또는 marketing composition
- custom camera UI
- 중첩 카드 UI
- provider/internal error 문구 노출
- 약관 기반 browser push permission 허용 copy
- 모바일 viewport에서 CTA/입력/상태 텍스트가 겹치는 UI

## 5. 구현자가 반드시 확인할 항목

- [ ] 첫 화면이 실제 업무 화면이다.
- [ ] 명함 촬영 CTA는 native file/camera picker를 호출한다.
- [ ] 회의 녹음 실패 시 파일 업로드 fallback이 같은 흐름 안에 있다.
- [ ] local draft restore prompt는 사용자가 이해할 수 있는 짧은 copy와 `불러오기`/`버리기`를 제공한다.
- [ ] push permission copy는 사용자가 브라우저 권한을 직접 허용해야 한다고 말한다.
- [ ] 서비스성 알림과 마케팅성 알림이 copy에서 섞이지 않는다.
- [ ] 360px/390px에서 텍스트와 버튼이 겹치지 않는다.
