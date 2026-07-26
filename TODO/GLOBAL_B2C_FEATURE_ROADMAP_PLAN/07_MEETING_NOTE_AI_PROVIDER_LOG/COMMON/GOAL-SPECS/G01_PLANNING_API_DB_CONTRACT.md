# G01 Planning API DB Contract

상태: Completed
목표: 07 구현 전 계약 검토와 blocking 해소
완료일: 2026-07-26

## 1. 목적

G01은 코드 구현이 아니라 구현 전 확인 goal이다. 현재 BE/FE/Prisma 코드와 07 문서 계약을 대조해 G02~G06이 바로 실행 가능한지 확인한다.

## 1.1 완료 결과

- 현재 BE/FE/Prisma 코드와 07 문서 계약을 대조했다.
- G02~G06 구현 착수를 막는 blocking 질문은 없다.
- API request/response, DB 변경 방향, User Web UX 범위는 현재 코드 구조와 충돌하지 않는다.
- 검토 결과는 `COMMON/PLANNING-REVIEW.md`에 기록했다.
- 완료 체크는 `COMMON/GOAL-COMPLETION-CHECKLIST.md`에 반영했다.

## 2. 포함 범위

- 현재 `BE/prisma/schema.prisma`의 `AiProviderOperation`, `AiProviderCallLog`, `MeetingNote` 확인
- 현재 `BE/src/modules/meeting-note` AI/STT draft 흐름 확인
- 현재 `BE/src/modules/deal` following-action 저장 API 확인
- 현재 `FE/user-web/src/features/meeting-note` 생성 모달/상세 화면 확인
- `COMMON/API-SPEC/*` request/response 계약 보정
- `BE-TODO`, `FE-TODO`, `REVIEW-CHECKLIST` 보정

## 3. 제외 범위

- Prisma schema 변경
- Backend endpoint 구현
- Frontend 화면 구현

## 4. 작업

1. `COMMON/SCOPE.md`와 사용자 결정이 일치하는지 확인한다.
2. `COMMON/SOURCE-PLAN-COVERAGE.md`와 상위 입력 계획 반영 범위가 일치하는지 확인한다.
3. `COMMON/BUSINESS-LOGIC.md`의 저장 금지 조건이 현재 코드 구조와 충돌하지 않는지 확인한다.
4. `COMMON/API-SPEC/MEETING_NOTE_AI_DRAFT_LOG_API.md`가 기존 `CreateMeetingNoteTextAiDraftDto`, `CreateMeetingNoteSttAiDraftDto`와 충돌하지 않는지 확인한다.
5. `COMMON/API-SPEC/MEETING_NOTE_NEXT_ACTION_FOLLOW_UP_API.md`의 신규 route가 기존 route와 충돌하지 않는지 확인한다.
6. 기존 `POST /api/deals/:dealId/following-action-logs`를 다음 행동 확정 저장 API로 재사용할 수 있는지 확인한다.
7. `AiProviderCallLog.targetType/targetId` 설계가 sales-report/follow-up 기존 log와 충돌하지 않는지 확인한다.
8. Safe failure response가 현재 전역 `HttpExceptionFilter`와 FE `ApiClientError` 구조에 맞는지 확인한다.
9. G02에서 필요한 migration 선행 조건과 DB 운영 gate를 확인한다.
10. `NEXT_BACKEND_API_BACKLOG_PLAN`의 `NBA-003`, `NBA-005`, `NBA-007`, `NBA-012`, `NBA-013`이 07에 섞이지 않았는지 확인한다.
11. `USER_WEB_PRODUCTIZATION_GAP_PLAN`의 payment, Admin, localization, analytics, trust/policy, backup/restore gate가 07에 섞이지 않았는지 확인한다.
12. blocking 질문이 있으면 `COMMON/PLANNING-REVIEW.md`에 남긴다.

## 5. 검증

```powershell
cd BE
pnpm run prisma:validate
```

선택 확인:

```powershell
rg "ai-draft|stt-draft|AiProviderCallLog|AiProviderOperation|following-action-logs" BE/src BE/prisma/schema.prisma FE/user-web/src
```

## 6. 완료 기준

- [x] G02~G06 구현 착수 blocking 질문이 없다.
- [x] 계약 보정이 필요한 문서가 갱신됐다.
- [x] `COMMON/SOURCE-PLAN-COVERAGE.md`가 `NEXT_BACKEND_API_BACKLOG_PLAN`과 `USER_WEB_PRODUCTIZATION_GAP_PLAN`의 포함/제외/후속 범위를 모두 설명한다.
- [x] `COMMON/PLANNING-REVIEW.md`에 현재 코드 대조 결과가 기록됐다.
- [x] `COMMON/GOAL-COMPLETION-CHECKLIST.md`의 G01 항목이 갱신됐다.

## 7. 주석 기준

G01은 코드 구현 goal이 아니므로 신규 코드 주석은 없다. G02~G05 구현 시 한글 주석 규칙을 적용한다.
