# G05 Complex Flow UX

상태: Done
우선순위: P1
담당 영역: FE/user-web

## 1. 목표

일정, 회의록, 명함 스캔, Import, Trash처럼 상태가 복잡한 화면의 UX를 정리한다.

## 2. 먼저 읽을 문서

- `COMMON/ISSUE-LOG.md`
- `COMMON/UXUI-QA-SCOPE.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/UXUI_AGENT/DECISIONS/015_uxui_list_filter_pagination.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/COMMON/ERROR.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`

## 3. 주요 파일 후보

- `FE/user-web/src/pages/schedules/*`
- `FE/user-web/src/pages/meeting-notes/*`
- `FE/user-web/src/pages/business-cards/*`
- `FE/user-web/src/pages/import/*`
- `FE/user-web/src/pages/trash/*`
- `FE/user-web/src/features/schedule/components/*`
- `FE/user-web/src/features/meeting-note/components/*`
- `FE/user-web/src/features/business-card/components/*`
- `FE/user-web/src/features/import-export/components/*`
- `FE/user-web/src/features/trash/components/*`

## 4. 작업 내용

### 일정

- 월간/목록 화면에서 일정과 연결 딜이 읽히는지 확인한다.
- 일정이 독립 record이면서 연결 딜/회사/담당자 맥락을 가진 activity-like 업무 항목처럼 보이는지 확인한다.
- 생성/수정 form에서 local date-time과 timezone 의미가 사용자에게 혼란스럽지 않은지 확인한다.
- `/app/schedules/week`는 구현하지 않고 현재 redirect 상태를 유지한다.

### 회의록

- 목록은 이미 record table 구조로 보고, 제목/요약, 연결 회사/담당자/딜, 작성일, 다음 행동 맥락이 빠르게 읽히게 한다.
- 등록일이 연결 record와 다음 행동 맥락을 밀어내면 업무 판단 정보를 우선한다.
- desktop row height는 약 52~56px 수준의 업무용 밀도를 검토한다.
- meeting note list는 현재 Backend/문서 계약상 `pageSize=10`이므로, 15개 기본 전환은 FE 단독으로 하지 않는다.
- 모바일은 10개 내외 card/list를 유지하고 desktop table을 억지로 노출하지 않는다.
- 직접 작성이 기본 흐름으로 자연스럽게 보이는지 확인한다.
- AI/STT는 보조 action으로 보이고 기본 저장 흐름을 방해하지 않게 한다.
- 긴 상세내용/향후계획/필요액션 입력이 답답하지 않게 한다.
- 딜 연결 action이 너무 숨겨져 있지 않게 한다.
- 회의록 상세/목록에서 회사/담당자/딜 linked record 맥락이 보이는지 확인한다.
- 회의록 본문, 활동 로그, Memo 기록의 의미가 섞이지 않게 한다.

### 명함 스캔

- 이미지 업로드, `명함스캔 중`, OCR 성공, OCR 실패, 확인/수정, 저장 완료 상태를 확인한다.
- provider 실패 시 내부 provider/quota/API key 문구를 노출하지 않는다.
- 이미지를 저장하지 않았다는 안전 안내가 보인다.

### Import

- 업로드 -> AI 매핑 -> row 검증 -> row 수정 -> 확정 저장 흐름의 현재 단계가 명확해야 한다.
- table overflow는 최소한 768px에서 사용 가능해야 한다.
- 오류 셀 메시지가 누락된 셀에만 보이는지 확인한다.
- 확정 전 job in-memory 한계가 사용자 혼란을 만들면 UX 문구 또는 후속 분리로 기록한다.

### Trash

- 목록, 상세 modal, 복구 action이 명확해야 한다.
- 복구 성공/실패 문구가 안전해야 한다.
- private memo 원문이 복구 전 preview에 과하게 노출되지 않는지 확인한다.
- 삭제된 항목도 원래 sales record 유형과 연결 맥락을 알아볼 수 있어야 한다.
- 목록 row는 삭제된 record를 찾고 판단하기 위한 업무용 밀도를 유지하되, 복구 전 민감 정보 preview를 과하게 늘리지 않는다.

## 4A. UX 기준

- 일정/회의록/명함 스캔/Import/Trash는 복잡한 보조 기능이지만, 화면 문법은 workspace/page/list/detail 기준을 유지한다.
- 연결 딜, 회사, 담당자 정보가 필요한 곳에서는 Attio식 linked record 맥락을 보여준다.
- 목록은 단순 등록일 최신순 확인표가 아니라 record 관계, 상태, 현재 응답에서 가능한 최근 활동, 다음 행동 맥락을 가능한 범위에서 드러내야 한다.
- 최근 활동 또는 다음 행동 summary가 현재 list response에 부족하면 FE에서 임의로 만들지 않고 BE/API 후속으로 기록한다.
- provider/운영 상태가 화면을 내부 시스템 콘솔처럼 보이게 만들면 안 된다.
- Backend에 없는 Notification, generic Export, Admin 운영 기능을 reference에 있다는 이유로 노출하지 않는다.

## 5. 제외 범위

- Schedule week report 구현
- Notification 구현
- ImportJob 영속화
- MeetingNote transcript 저장
- provider call log table 구현
- Trash 7일 이후 복구 구현
- FE만의 page size 숫자 변경

## 6. 검증

```bash
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

## 7. 완료 기준

- 일정/회의록/명함/Import/Trash의 주요 상태가 사용자에게 안전하게 보인다.
- 복잡한 흐름 화면도 Notion + Attio reference gate를 통과한다.
- 회의록/명함/Trash 등 목록형 화면이 조용하고 조밀한 record list로 보이며, 연결 record와 현재 응답에서 가능한 다음 행동/상태 맥락이 등록일보다 우선된다.
- provider failure와 validation failure가 내부 정보를 노출하지 않는다.
- 관련 이슈가 `COMMON/ISSUE-LOG.md`에서 정리된다.

## 8. 완료 기록

- 완료일: 2026-07-18
- 구현 파일: `FE/user-web/src/features/schedule/components/schedule-screen.tsx`, `FE/user-web/src/features/meeting-note/components/meeting-note-list-screen.tsx`, `FE/user-web/src/features/business-card/components/business-card-scan-screen.tsx`, `FE/user-web/src/features/import-export/components/import-screen.tsx`, `FE/user-web/src/features/trash/components/trash-screen.tsx`
- 문서 파일: `COMMON/ISSUE-LOG.md`, `COMMON/GOAL-WORK-ORDER.md`, `COMMON/API-SPEC/README.md`, `BE-TODO/API-TODO.md`, `FE-TODO/USER-WEB-TODO.md`
- 화면 검증: `/tmp/onehandsales-g05-final/*.png` 로컬 screenshot. repository에는 보관하지 않는다.
- 자동 점검 결과: 28개 route/viewport/detail 조합에서 console error 0건, page error 0건, failed request 0건, document horizontal overflow 0건

### 완료 요약

- `/app/schedules`는 768px에서 month/week grid의 7일 맥락과 연결 딜 pill이 읽히도록 compact density를 적용했다.
- `/app/meeting-notes`는 desktop 56px row, 회사/담당자 + 연결 딜 우선 table, 768px card/list를 적용했다.
- `/app/business-cards`는 desktop 56px row, 768px card/list, 상태/저장 action 중심 표시, 이미지 미저장 안내, provider 내부값 비노출을 적용했다.
- `/app/import`는 desktop 56px row, 768px preview table 내부 스크롤, field-level validation 표시를 보강했다.
- `/app/trash`는 desktop 56px row, 768px card/list, private memo preview masking, restore modal의 안전한 상세 표시를 적용했다.

### 검증 결과

- `pnpm run typecheck`: 통과
- `pnpm run lint`: 통과
- `pnpm run build`: 통과. 기존 Tailwind `duration-[500ms]` ambiguous class 경고와 Vite chunk size 경고는 남아 있지만 build 실패는 아니다.
- `git diff --check`: 통과
- `node /tmp/onehandsales-g05-qa.mjs`: 통과, failed 0건, checked 28건
- `pnpm run test:e2e`: 로컬 Playwright chromium headless shell 누락으로 테스트 시작 전 실패. 코드 assertion 실패는 없었다.

### 완료 후 검토

- G05 제외 범위인 Schedule week report, Notification, ImportJob 영속화, MeetingNote transcript 저장, provider call log table, Trash 7일 이후 복구, FE 단독 page size 변경은 구현하지 않았다.
- 현재 API 응답에 없는 실제 최신 활동/다음 행동 summary는 FE에서 임의 생성하지 않았다.
- 15개 page size 기본 전환은 Backend 상수, 응답 `pageSize`, 관련 테스트/API 문서 계약과 함께 변경해야 하므로 G05에서 제외했다.
