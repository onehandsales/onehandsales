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
5. 회의록 연결 mutation의 legacy `DealFollowingActionLog` 생성과 새 `DealActivity`가 중복 노출되지 않는 처리 기준을 정한다.
6. schedule/meeting-note/follow-up에서 activity writer를 호출할 provider 배치가 module cycle을 만들지 않는지 확인한다.
7. `DealActivity` schema 후보와 기존 model relation 충돌을 확인한다.
8. API request/response 예시와 실제 DTO 네이밍 충돌을 확인한다.
9. G02에서 필요한 migration 선행 조건과 `NBA-014` gate를 확인한다.
10. `DealApplicationService.createDeal`의 초기 `DealFollowingActionLog` 생성이 `DEAL_CREATED`와 `NEXT_ACTION_CREATED`를 모두 만들도록 계약과 충돌하지 않는지 확인한다.
11. follow-up 발송 성공/실패 sourceId가 `FollowUpDeliveryAttempt.id`이고 `FollowUpMessage.id`는 metadata로만 쓰이는지 확인한다.
12. source soft delete가 별도 deleted activity를 만들지 않고 link omission만 수행한다는 1차 기준이 구현자에게 명확한지 확인한다.
13. FE host가 `DealDetailPanel`이고 기존 `deal-activity-section.tsx` placeholder를 정본 host로 되살리지 않는지 확인한다.
14. blocking 질문이 있으면 `PLANNING-REVIEW.md`에 남긴다.

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
