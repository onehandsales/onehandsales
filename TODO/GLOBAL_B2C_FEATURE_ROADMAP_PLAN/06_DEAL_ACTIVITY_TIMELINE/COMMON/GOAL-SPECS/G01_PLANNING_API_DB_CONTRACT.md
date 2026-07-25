# G01 Planning API DB Contract

상태: Ready
목표: 06 구현 전 계약 검토와 blocking 해소

## 1. 목적

G01은 코드 구현이 아니라 구현 전 확인 goal이다. 현재 BE/FE 코드와 06 문서 계약을 대조해 G02~G07이 바로 실행 가능한지 확인한다.

## 2. 포함 범위

- 현재 `BE/src/modules/deal` 구조 확인
- 현재 `BE/prisma/schema.prisma` Deal/DealFollowingActionLog/DealMemoLog/ScheduleDeal/MeetingNoteDeal/FollowUpMessageTarget 확인
- 현재 `FE/user-web/src/features/deal` 상세/목록 구조 확인
- `COMMON/BUSINESS-LOGIC.md`와 현재 mutation 흐름 대조
- `COMMON/API-SPEC/*` 계약 보정
- `BE-TODO`, `FE-TODO`, `REVIEW-CHECKLIST` 보정

## 3. 제외 범위

- Prisma schema 변경
- Backend endpoint 구현
- Frontend 화면 구현

## 4. 작업

1. `COMMON/SCOPE.md`와 사용자 결정이 일치하는지 확인한다.
2. `COMMON/BUSINESS-LOGIC.md`의 불변 조건이 현재 코드 구조와 충돌하지 않는지 확인한다.
3. 기존 route와 새 route 충돌을 확인한다.
4. 자동 activity trigger가 실제 코드 어디에 연결될지 목록화한다.
5. `DealActivity` schema 후보와 기존 model relation 충돌을 확인한다.
6. API request/response 예시와 실제 DTO 네이밍 충돌을 확인한다.
7. G02에서 필요한 migration 선행 조건과 `NBA-014` gate를 확인한다.
8. blocking 질문이 있으면 `PLANNING-REVIEW.md`에 남긴다.

## 5. 검증

```powershell
cd BE
pnpm run prisma:validate
```

선택 확인:

```powershell
rg "following-action|memo-logs|scheduleDeals|meetingNoteDeals|follow-up" BE/src/modules FE/user-web/src/features
```

## 6. 완료 기준

- G02~G07 구현 착수 blocking 질문이 없다.
- 계약 보정이 필요한 문서가 갱신됐다.
- `COMMON/GOAL-COMPLETION-CHECKLIST.md`의 G01 항목이 갱신됐다.
