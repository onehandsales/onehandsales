# Goal Work Order

상태: Confirmed

## 1. 목적

10번 Mobile/PWA Field Use를 `/goal` 단위로 실행할 순서와 각 goal의 선행 검토 문서를 고정한다.

## 2. 모든 Goal 공통 선행 읽기

구현자는 각 `/goal` 시작 전에 아래 문서를 확인한다.

- `COMMON/SCOPE.md`
- `COMMON/DECISION-LOG.md`
- `COMMON/IMPLEMENTATION-CONTRACT-RULES.md`
- `COMMON/ARCHITECTURE-GUARDRAILS.md`
- `COMMON/GOAL-REVIEW-CHECKLIST.md`
- `COMMON/GOAL-SPECS/<현재 goal>.md`
- 관련 `COMMON/API-SPEC/*.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/005_backend_api_function_comment_rule.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`

DB 영향이 있는 goal은 추가로 확인한다.

- `BE/prisma/schema.prisma`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`
- 관련 `AGENT/SOFTWARE_AGENT/DB_SCHEMA/*.md`

## 3. 실행 순서

| 순서 | Goal | 목적 | 완료 기준 |
|---:|---|---|---|
| 1 | `G01_DOCUMENT_CONTRACT_SYNC` | 문서/API/DB/FE TODO 기준 동기화 | 10번 계약과 체크리스트가 구현 가능 상태 |
| 2 | `G02_BUSINESS_CARD_MOBILE_CAPTURE_AND_FAILURE` | 모바일 명함 촬영과 safe OCR failure | BE/FE/test/migration 완료 |
| 3 | `G03_MEETING_NOTE_MOBILE_RECORDING` | 모바일 녹음 및 STT draft | FE recording/fallback과 BE contract test 완료 |
| 4 | `G04_LOCAL_DRAFT_RECOVERY` | 24h local draft 복구 | BusinessCard/MeetingNote draft 복구 완료 |
| 5 | `G05_MOBILE_NOTIFICATION_PERMISSION_UX` | 모바일 알림 권한 UX | explicit permission flow 완료 |
| 6 | `G06_MOBILE_FIELD_ANALYTICS_EVENTS` | 모바일 품질 이벤트 | client/server event allowlist와 tests 완료 |
| 7 | `G07_QA_DOCUMENT_CLOSEOUT` | 통합 QA와 문서 closeout | 모든 goal 체크리스트 검토 기록 완료 |

## 4. 의존성

- G02는 `BusinessCardScanLog` migration이 있으므로 G03~G06보다 먼저 처리한다.
- G04는 G02/G03 form 구조를 알아야 하므로 G02/G03 이후 처리한다.
- G06은 G02~G05의 이벤트 지점이 확정된 뒤 처리한다.
- G07은 모든 구현 goal 이후에만 처리한다.

## 5. 체크리스트 강제 규칙

각 `/goal` 구현자는 final 응답 전에 반드시 아래를 수행한다.

1. `COMMON/GOAL-REVIEW-CHECKLIST.md` 공통 항목 확인
2. 현재 goal 문서의 `Goal 검토 체크리스트` 확인
3. 실행한 command와 결과 기록
4. 실행하지 못한 검증이 있으면 사유 기록

G07은 모든 goal 문서의 체크리스트가 확인되었다는 기록이 없으면 완료 처리하지 않는다.
