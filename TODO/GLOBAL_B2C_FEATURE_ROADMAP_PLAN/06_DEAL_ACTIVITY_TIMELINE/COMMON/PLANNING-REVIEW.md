# Planning Review

상태: G02 Completed / Ready for G03
검토일: 2026-07-25

## 1. 결론

- 판정: G01 완료, G02 착수 가능
- 이유: 현재 BE/FE 코드와 06 문서 계약을 대조했고, G02~G07 구현을 막는 blocking 질문은 없다.
- 검증: `cd BE && pnpm run prisma:validate` 통과 (2026-07-25)
- 주의: G02는 신규 Prisma migration을 만들기 전에 `COMMON/FIRST-SALE-GATE-MAP.md`의 `NBA-014` DB/Prisma 운영 gate를 다시 확인해야 한다.

## 2. 사용자 결정 반영

| 항목 | 반영 결과 |
|---|---|
| 06 준비 방식 | 전체 목표를 문서화하고 `/goal` 단위로 순차 구현한다. |
| 1차 목표 | `DealActivity` 정본 + 딜 상세 timeline |
| 자동 기록 범위 | 핵심 딜 진행 + follow-up 발송 이력 |
| 수동 기록 | 포함 |
| 수동 기록 수정 | 포함 |
| 수동 기록 삭제 | 1차 제외 |
| UX 기준 | Notion식 작업공간 UX + Attio식 CRM record 관계 UX |
| 구현 전략 | 기능 구현 우선, 전체 UX polish는 후속 |

## 3. 검토 대상

- `README.md`
- `COMMON/SCOPE.md`
- `COMMON/BUSINESS-LOGIC.md`
- `COMMON/USER-FLOW.md`
- `COMMON/API-SPEC/*`
- `COMMON/ARCHITECTURE-GUARDRAILS.md`
- `COMMON/GOAL-WORK-ORDER.md`
- `COMMON/GOAL-SPECS/*`
- `COMMON/REVIEW-CHECKLIST.md`
- `BE-TODO/API-TODO.md`
- `BE-TODO/DB-SCHEMA.md`
- `FE-TODO/USER-WEB-TODO.md`

## 4. 핵심 설계 판단

| 판단 | 내용 |
|---|---|
| Deal 중심 | 1차는 모든 도메인 공통 activity bus가 아니라 Deal 중심 정본을 만든다. |
| Timeline 정본 | 목록 summary보다 `DealActivity`와 딜 상세 timeline을 먼저 만든다. |
| 자동/수동 구분 | sourceType으로 시스템 생성 activity와 사용자 수동 activity를 구분한다. |
| 수정 가능 범위 | 수동 activity만 수정 가능하다. 자동 activity는 수정/삭제하지 않는다. |
| 삭제 보류 | 수동 activity 삭제는 Trust/policy, retention, audit와 엮이므로 후속으로 분리한다. |
| 메모 보류 | 메모는 민감정보 가능성이 있어 activity 통합을 후속으로 둔다. |
| Summary 후속 | Deal list products/latest activity, Contact dealCount는 G05/G06에서 구현한다. |
| Page size | 15개 page 계약을 유지하고 FE 단독 변경을 금지한다. |
| 상위 계획 반영 | `NBA-001`, `NBA-002`, `NBA-008`, `NBA-014`, `NBA-003` Deal subset과 Productization Gap의 Notion/Attio, Deal-first, Data honesty 기준이 반영됐다. |
| 상위 계획 제외 | Admin 운영, 결제/구독/세금, 앱 내부 다국어, 다국가 데이터 모델, 제품 분석, Company/Contact/Product latest summary는 06에서 구현하지 않는다. |

## 5. G01 현재 코드 대조 결과

| 영역 | 확인 결과 | G02~G07 적용 기준 |
|---|---|---|
| Prisma schema | 현재 `DealActivityType`, `DealActivitySourceType`, `DealActivity`, `User.dealActivities`, `Deal.activities`는 아직 없다. 기존 enum/model 이름과 충돌은 확인되지 않았다. | G02에서 신규 enum/model/relation을 추가한다. 기존 migration 파일은 수정하지 않는다. |
| User/Deal relation | `User`에는 `dealFollowingActionLogs`, `dealMemoLogs`, `dealProducts` 등이 있고 `Deal`에는 `followingActionLogs`, `memoLogs`, `scheduleDeals`, `meetingNoteDeals`가 있다. | `User.dealActivities`, `Deal.activities` relation 추가 위치는 기존 Deal relation 근처로 둔다. |
| Deal route | `DealController`에는 `GET/POST /api/deals/:dealId/activities`, `PATCH /api/deals/:dealId/activities/:activityId`가 없다. 기존 `following-action-logs`, `memo-logs` route와 충돌하지 않는다. | G03에서 새 route를 `DealController`에 추가한다. User API `/api/*`만 사용한다. |
| Deal 생성 | `DealApplicationService.createDeal`은 딜, 회사/담당자/제품 연결, 초기 `DealFollowingActionLog`, 초기 메모, deal due reminder를 같은 transaction에서 처리한다. | G03에서 같은 transaction 안에 `DEAL_CREATED`와 초기 `NEXT_ACTION_CREATED`를 모두 생성한다. 초기 메모는 06 범위가 아니므로 activity로 만들지 않는다. |
| Deal 단계 변경 | `updateDeal`은 기존 딜을 먼저 조회하고 transaction 안에서 `updateDeal`과 relation 교체/reminder 갱신을 수행한다. | G03에서 기존 상태와 요청 상태를 비교해 실제 변경일 때만 `STAGE_CHANGED`를 같은 transaction에 생성한다. |
| 다음 행동 | 단독 다음 행동 생성/수정은 현재 transaction으로 감싸지 않는다. 삭제는 soft delete지만 06 activity 삭제/삭제 activity 범위가 아니다. | G03에서 생성/완료 변경을 transaction으로 감싸 `NEXT_ACTION_CREATED`, `NEXT_ACTION_COMPLETION_CHANGED`를 함께 쓴다. 삭제 activity는 만들지 않는다. |
| Schedule 연결 | Schedule 생성/수정은 transaction이 있고 수정 시 dealId diff를 계산한다. 단 `createScheduleDeals`/`deleteScheduleDeals`는 현재 `ScheduleDeal.id`를 반환하지 않는다. | G03에서 생성된/삭제 직전 `ScheduleDeal.id`와 schedule snapshot을 transaction 안에서 확보할 repository 계약을 추가한다. Schedule soft delete만으로 `SCHEDULE_UNLINKED`를 만들지 않는다. |
| MeetingNote 연결 | 생성/수정은 `replaceMeetingNoteRelations`가 delete 후 recreate 방식이다. 별도 `linkMeetingNoteDeals`는 `MeetingNoteDeal` 생성 후 legacy `DealFollowingActionLog` proxy 로그를 만든다. | G03에서 replace 전 기존 deal relation을 조회해 diff를 먼저 계산한다. `MeetingNoteDeal.id`와 회의록 snapshot을 기준으로 `MEETING_NOTE_LINKED/UNLINKED`를 만들고, legacy proxy 문구를 activity summary로 재사용하지 않는다. |
| Follow-up 발송 | provider 호출은 transaction 밖이고, `markDeliverySucceeded/Failed`가 `FollowUpDeliveryAttempt`와 `FollowUpMessage` 상태를 transaction 안에서 갱신한다. | G03에서 같은 transaction 안에 `FOLLOW_UP_SENT/FAILED`를 만들고 `sourceId=FollowUpDeliveryAttempt.id`, `metadataJson.messageId=FollowUpMessage.id`를 사용한다. `DEAL` target만 딜 activity로 기록한다. |
| Module dependency | Deal/Schedule/MeetingNote/Follow-up 각 repository가 Prisma transaction client를 감싸는 패턴을 사용한다. MeetingNoteModule은 현재 repository를 export하지 않는다. | G03에서 다른 feature module이 `DealApplicationService`를 import하지 않는다. `PrismaDealActivityRepository` 같은 writer helper를 transaction client로 생성해 쓰는 방식으로 module cycle을 피한다. |
| Contact dealCount | Contact list는 page size 15이고 현재 `dealCount` field는 없다. | G05에서 현재 page contact IDs만 aggregation해 `dealCount`를 추가한다. |
| FE Deal detail | 실제 host는 `FE/user-web/src/features/deal/components/deal-detail-panel.tsx`다. `deal-activity-section.tsx`는 null placeholder다. | G04에서 `DealDetailPanel` 내부에 새 `딜 활동` timeline을 통합하고 placeholder를 정본 host로 되살리지 않는다. |
| FE Deal list | `DealListScreen`은 wrapper이고 실제 `/app/deals` 목록 host는 `DealPipelineHomeScreen`이다. | G06에서 딜 목록 summary는 `deal-pipeline-home-screen.tsx`와 관련 type/client를 수정한다. |
| FE target path | follow-up timeline에 `normalizeTargetPath` helper가 있다. | G04에서 helper를 재사용하거나 공통 helper로 분리하되 `/app/*` route로 정규화한다. |

## 6. 미해결 Critical/Major

없음. G01에서 현재 코드와 실제 route/repository 구조를 확인했으며, G02~G07 착수를 막는 Critical/Major 질문은 없다.

## 7. 구현 중 주의

- 신규 migration이 있으므로 G02에서 `NBA-014` DB/Prisma 운영 gate를 확인한다.
- G01은 문서/계약 검토 goal이라 신규 소스 코드와 코드 주석을 작성하지 않았다. G02/G03부터 추가되는 Prisma/Backend 주석은 한국어 문장으로 작성하고, 고유 식별자만 영문으로 둔다.
- `DealActivity` title/body 원문은 structured log에 남기지 않는다.
- follow-up 본문 전체는 timeline 목록에 넣지 않는다.
- follow-up 발송 성공/실패는 `FollowUpDeliveryAttempt.id`를 sourceId로 사용하고 messageId는 metadata에 둔다.
- 딜 생성 시 초기 다음 행동 row가 함께 생성되므로 `DEAL_CREATED`와 초기 `NEXT_ACTION_CREATED`를 같은 transaction에서 처리한다.
- private memo, meeting note raw text, provider raw response를 summary에 넣지 않는다.
- schedule/meeting-note/follow-up 모듈에 activity writer를 연결할 때 module dependency cycle을 피한다.
- 기존 following-action/memo API를 즉시 제거하지 않는다.
- Schedule/MeetingNote 연결 activity는 relation row 삭제 전에 `ScheduleDeal.id`/`MeetingNoteDeal.id`를 확보한다.
- MeetingNote의 legacy `DealFollowingActionLog` proxy 문구는 새 `DealActivity` summary로 재사용하지 않는다.
- G04에서는 기존 다음 행동/메모/follow-up 섹션을 갑자기 제거하지 않되, 새 `딜 활동`과 같은 이력이 중복 primary activity처럼 보이지 않게 배치한다.

## 8. 사용자 추가 결정이 필요한 질문

현재 G02 착수를 막는 질문은 없다.

후속 결정 후보:

- 수동 activity 삭제를 언제 포함할지
- 일반 메모 activity 통합을 할지
- 회사/제품 latest activity summary를 G06 이후 포함할지
- 고급 검색/필터와 딜 확률/score를 별도 goal로 언제 다룰지

## 9. 다음 실행 권장 문구

```text
/goal TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE/COMMON/GOAL-SPECS/G03_DEAL_ACTIVITY_BACKEND.md 기준으로 G03을 구현해줘.
```

## 10. G02 완료 기록

- 완료일: 2026-07-26
- `BE/prisma/schema.prisma`에 `DealActivityType`, `DealActivitySourceType`, `DealActivity`, `User.dealActivities`, `Deal.activities`를 추가했다.
- 신규 migration `BE/prisma/migrations/20260726010000_add_deal_activity/migration.sql`만 추가했고 기존 migration 파일은 수정하지 않았다.
- timeline 조회 index는 `occurredAt DESC, id DESC` 정렬을 직접 만족하도록 Prisma schema와 migration SQL에 desc index를 명시했다.
- `DealActivityRepository` port와 `PrismaDealActivityRepository` helper/test를 추가했다.
- `NBA-014` 확인 결과 DB target은 원격 Supabase다. `prisma migrate dev`, `prisma migrate deploy`, `prisma seed`는 실행하지 않았다.
- 검증: `pnpm run prisma:validate`, `pnpm run prisma:generate`, `pnpm run typecheck`, `pnpm run lint`, `pnpm run test -- deal`, `pnpm run build` 통과.
