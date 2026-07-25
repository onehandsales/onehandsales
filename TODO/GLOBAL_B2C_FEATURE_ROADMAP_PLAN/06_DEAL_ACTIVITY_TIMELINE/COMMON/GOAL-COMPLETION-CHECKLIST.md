# Goal Completion Checklist

상태: Ready
최종 업데이트: 2026-07-25

## 1. 목적

06 Deal Activity Timeline의 `/goal` 실행 완료 여부를 확인한다.

구현 goal은 타입/테스트/build 결과 없이 완료로 체크하지 않는다. 실제 실행하지 못한 검증이 있으면 체크하지 않고 사유를 남긴다.

## 2. Goal 완료 현황

| 완료 | Goal | 상태 | 완료일 | 완료 기준 | 증거 | 비고 |
|---|---|---|---|---|---|---|
| [ ] | G01 Planning API DB Contract | Ready |  | 현재 코드와 계약 대조, blocking 질문 없음 |  |  |
| [ ] | G02 Deal Activity DB Prisma | Ready |  | Prisma schema/migration/model/index 구현 |  | 신규 migration. NBA-014 선행 |
| [ ] | G03 Deal Activity Backend | Ready |  | timeline API와 자동/수동 activity Backend 구현 |  |  |
| [ ] | G04 Deal Activity User Web | Ready |  | 딜 상세 timeline UX 구현 |  |  |
| [ ] | G05 Deal Record Summary Backend | Ready |  | Deal/Contact list summary Backend 구현 |  |  |
| [ ] | G06 Deal Record Summary User Web | Ready |  | 목록 summary User Web 구현 |  |  |
| [ ] | G07 QA Review Closeout | Ready |  | REVIEW-CHECKLIST 통과와 문서 closeout |  |  |

## 3. Goal별 체크 조건

### G01

- [ ] 현재 BE deal/follow-up/schedule/meeting-note 구현을 확인했다.
- [ ] 현재 FE deal detail/list 구현을 확인했다.
- [ ] `COMMON/BUSINESS-LOGIC.md`와 현재 mutation 흐름을 대조했다.
- [ ] API path와 기존 route 충돌이 없다.
- [ ] activity writer provider 배치가 module cycle을 만들지 않는다.
- [ ] 회의록 연결 legacy `DealFollowingActionLog`와 새 `DealActivity` 중복 노출 처리 기준이 정해졌다.
- [ ] 딜 생성 시 초기 `DealFollowingActionLog`가 `NEXT_ACTION_CREATED`로 함께 기록되는 기준을 확인했다.
- [ ] follow-up sourceId 기준이 `FollowUpDeliveryAttempt.id`로 확정됐다.
- [ ] `DealActivity` schema 후보와 현재 Prisma 관계 충돌이 없다.
- [ ] API request/response 예시와 실제 DTO 네이밍 충돌이 없다.
- [ ] G02~G07 착수 blocking 질문이 없다.

### G02

- [ ] `DealActivityType`, `DealActivitySourceType` enum이 있다.
- [ ] `DealActivity` model이 있다.
- [ ] `Deal` relation이 추가됐다.
- [ ] migration SQL에 index/FK/comment가 있다.
- [ ] migration SQL에 table/column/index 의도 주석 또는 `COMMENT ON`이 있다.
- [ ] 기존 migration 파일을 수정하지 않았다.
- [ ] 공유/운영성 DB에 무단 migrate/seed를 실행하지 않았다.
- [ ] `pnpm run prisma:validate`가 통과했다.

### G03

- [ ] `GET /api/deals/:dealId/activities`가 구현됐다.
- [ ] `POST /api/deals/:dealId/activities`가 구현됐다.
- [ ] `PATCH /api/deals/:dealId/activities/:activityId`가 구현됐다.
- [ ] 자동 activity 생성 지점이 transaction과 연결됐다.
- [ ] 회의록 연결 변경은 delete/recreate 전 diff 기준으로 activity가 생성됐다.
- [ ] 회의록 연결 legacy `DealFollowingActionLog` 문구를 activity summary로 재사용하지 않는다.
- [ ] follow-up activity는 `DEAL` target message만 딜 timeline에 기록한다.
- [ ] follow-up 발송 성공/실패 activity가 delivery attempt 단위로 기록됐다.
- [ ] 자동 activity는 수정할 수 없다.
- [ ] private memo/provider raw/follow-up body 전체가 response/log에 노출되지 않는다.

### G04

- [ ] 딜 상세에 timeline section이 있다.
- [ ] 수동 activity 생성 form이 있다.
- [ ] 수동 activity 수정 UX가 있다.
- [ ] loading/empty/error/success 상태가 있다.
- [ ] cursor는 FE에서 파싱하지 않고 API 응답의 `nextCursor`를 그대로 전달한다.
- [ ] `DealDetailPanel` 안에서 새 timeline이 통합됐고 기존 placeholder component를 정본 host로 쓰지 않았다.
- [ ] 모바일 390px/360px에서 timeline이 깨지지 않는다.

### G05

- [ ] `GET /api/deals` item에 products summary가 있다.
- [ ] `GET /api/deals` item에 latestActivity가 있다.
- [ ] `GET /api/contacts` item에 dealCount가 있다.
- [ ] ownership/soft delete aggregation test가 있다.
- [ ] page size 15 계약이 Backend/API/test에서 일치한다.

### G06

- [ ] 딜 목록에 products summary가 표시된다.
- [ ] 딜 목록에 latest activity가 표시된다.
- [ ] 담당자 목록에 dealCount가 표시된다.
- [ ] API 응답 없는 summary를 FE에서 꾸미지 않는다.
- [ ] desktop/mobile list layout이 깨지지 않는다.

### G07

- [ ] Backend `typecheck`, `lint`, 관련 `test`, `build`를 실행했다.
- [ ] User Web `typecheck`, `lint`, `build`, 필요한 E2E/수동 QA를 실행했다.
- [ ] `COMMON/REVIEW-CHECKLIST.md`를 갱신했다.
- [ ] README, API-SPEC, BE-TODO, FE-TODO가 구현 결과와 일치한다.
