# Source Plan Coverage

상태: Confirmed

## 1. 목적

이 문서는 `NEXT_BACKEND_API_BACKLOG_PLAN`과 `USER_WEB_PRODUCTIZATION_GAP_PLAN`의 10번 관련 항목이 `10_MOBILE_PWA_FIELD_USE`에 어떻게 반영됐는지 기록한다.

## 2. NEXT_BACKEND_API_BACKLOG_PLAN 반영

| 원본 항목 | 10 반영 | 위치 |
|---|---|---|
| `NBA-005` BusinessCard provider failure code/message contract | 핵심 범위로 반영. safe failure code/message/retryable 계약과 DB safe field migration을 문서화 | `COMMON/API-SPEC/BUSINESS_CARD_MOBILE_CAPTURE_AND_FAILURE_CONTRACT.md`, `COMMON/GOAL-SPECS/G02_BUSINESS_CARD_MOBILE_CAPTURE_AND_FAILURE.md` |
| Product Analytics 09 후속: 모바일/PWA field-use 세부 event | 10에서 최소 품질 event로 반영 | `COMMON/EVENT-TAXONOMY.md`, `COMMON/GOAL-SPECS/G06_MOBILE_FIELD_ANALYTICS_EVENTS.md` |
| Admin provider failure UI/log | 10에서는 사용자 safe failure만 처리. 운영 조회는 11로 이관 | `COMMON/SCOPE.md`, `COMMON/ARCHITECTURE-GUARDRAILS.md` |
| DB/Prisma 운영 gate `NBA-014` | BusinessCardScanLog safe field migration goal에서 선행 확인 | `COMMON/PRISMA-MIGRATION-SPEC.md`, `COMMON/GOAL-SPECS/G02_BUSINESS_CARD_MOBILE_CAPTURE_AND_FAILURE.md` |
| MeetingNote provider log subset 07 완료 | 10에서 기존 `/api/meeting-notes/stt-draft`와 `AiProviderCallLog`를 재사용 | `COMMON/API-SPEC/MEETING_NOTE_MOBILE_RECORDING_STT_CONTRACT.md` |

## 3. USER_WEB_PRODUCTIZATION_GAP_PLAN 반영

| 원본 gap | 10 반영 | 위치 |
|---|---|---|
| 모바일 앱/PWA 현장 입력 | 1차는 모바일 브라우저/PWA 필수 현장 UX, native iOS/Android는 후속 필수 로드맵 | `README.md`, `COMMON/DECISION-LOG.md` |
| 명함 촬영 UX | `capture="environment"` 기반 후면 카메라 호출, 앨범 선택, 다시 촬영, 촬영 품질 안내 | `COMMON/USER-FLOW.md`, `FE-TODO/USER-WEB-TODO.md` |
| OCR provider 실패 copy와 retry UI | safe error response와 FE `다시 촬영`/`파일 바꾸기`/`수동 입력` UX | `COMMON/API-SPEC/BUSINESS_CARD_MOBILE_CAPTURE_AND_FAILURE_CONTRACT.md` |
| 회의 직후 음성 기록 | `MediaRecorder` 녹음 UX와 기존 STT draft API 재사용 | `COMMON/API-SPEC/MEETING_NOTE_MOBILE_RECORDING_STT_CONTRACT.md` |
| 모바일 키보드 상태 저장 버튼 접근성 | local draft + mobile form action 영역 검증 | `COMMON/GOAL-SPECS/G04_LOCAL_DRAFT_RECOVERY.md`, `COMMON/REVIEW-CHECKLIST.md` |
| 민감정보 local draft TTL | 24시간 TTL, 복원 확인, 저장/버림/만료 삭제 | `COMMON/API-SPEC/LOCAL_DRAFT_CONTRACT.md` |
| browser push fallback UX | 02 Notification API 재사용, 모바일 권한 안내와 설정 이동 | `COMMON/API-SPEC/MOBILE_NOTIFICATION_PERMISSION_CONTRACT.md` |

## 4. 09 Product Analytics에서 넘어온 범위

09에서 runtime taxonomy에 넣지 않은 PWA/Admin/Billing/Notification detail event 중, 10에서는 모바일 현장 기능 품질에 직접 필요한 event만 추가한다.

10 포함:

- 명함 촬영 시작/재시도
- 명함 OCR 실패
- 회의록 녹음 시작/완료/실패
- local draft 저장/복원/폐기
- 모바일 push 권한 prompt/result

10 제외:

- billing/paywall/churn event
- Admin analytics dashboard/API
- 광고 attribution/UTM
- full offline sync event
- native app store install attribution
