# G05 Complex Flow UX

상태: Ready
우선순위: P1
담당 영역: FE/user-web

## 1. 목표

일정, 회의록, 명함 스캔, Import, Trash처럼 상태가 복잡한 화면의 UX를 정리한다.

## 2. 먼저 읽을 문서

- `COMMON/ISSUE-LOG.md`
- `COMMON/UXUI-QA-SCOPE.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
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

## 4A. UX 기준

- 일정/회의록/명함 스캔/Import/Trash는 복잡한 보조 기능이지만, 화면 문법은 workspace/page/list/detail 기준을 유지한다.
- 연결 딜, 회사, 담당자 정보가 필요한 곳에서는 Attio식 linked record 맥락을 보여준다.
- provider/운영 상태가 화면을 내부 시스템 콘솔처럼 보이게 만들면 안 된다.
- Backend에 없는 Notification, generic Export, Admin 운영 기능을 reference에 있다는 이유로 노출하지 않는다.

## 5. 제외 범위

- Schedule week report 구현
- Notification 구현
- ImportJob 영속화
- MeetingNote transcript 저장
- provider call log table 구현
- Trash 7일 이후 복구 구현

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
- provider failure와 validation failure가 내부 정보를 노출하지 않는다.
- 관련 이슈가 `COMMON/ISSUE-LOG.md`에서 정리된다.
