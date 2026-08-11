# Goal Specs

상태: Confirmed

## 1. 목적

10번 Mobile/PWA Field Use를 `/goal`로 바로 실행할 수 있는 단위로 나눈다.

## 2. Goal 목록

| 순서 | 파일 | 목적 |
|---:|---|---|
| 1 | `G01_DOCUMENT_CONTRACT_SYNC.md` | 문서/API/DB/FE TODO 계약 동기화 |
| 2 | `G02_BUSINESS_CARD_MOBILE_CAPTURE_AND_FAILURE.md` | 모바일 명함 촬영과 safe OCR failure |
| 3 | `G03_MEETING_NOTE_MOBILE_RECORDING.md` | 모바일 녹음과 STT draft |
| 4 | `G04_LOCAL_DRAFT_RECOVERY.md` | 24h local draft 복구 |
| 5 | `G05_MOBILE_NOTIFICATION_PERMISSION_UX.md` | browser push 권한 UX |
| 6 | `G06_MOBILE_FIELD_ANALYTICS_EVENTS.md` | 모바일 현장 품질 이벤트 |
| 7 | `G07_QA_DOCUMENT_CLOSEOUT.md` | 통합 QA와 문서 closeout |

## 3. 공통 작성 규칙

모든 goal은 아래 항목을 포함한다.

- Request 계약
- Response 계약
- Backend Business Logic
- User Flow
- DB/Prisma 영향
- 코드 주석 기준
- 검증 command
- Goal 검토 체크리스트

## 4. 완료 규칙

각 goal final에는 다음이 있어야 한다.

- 수정 파일 요약
- 실행한 검증 command와 결과
- 실행하지 못한 검증과 사유
- `COMMON/GOAL-REVIEW-CHECKLIST.md` 확인 여부
- 해당 goal 문서의 `Goal 검토 체크리스트` 확인 여부
