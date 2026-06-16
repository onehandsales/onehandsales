# /goal G01-BE-DEAL-DOMAIN

## 1. Goal

Backend Deal 도메인 DB와 User API를 구현한다.

## 2. 먼저 읽을 문서

- `TODO/DONE/DEAL_DOMAIN_PLAN/README.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API_DETAIL.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/GOAL-SPECS/G01-BE-DEAL-DOMAIN.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/BE-TODO/DB-SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`

## 3. 작업 체크리스트

- [x] Prisma schema에 Deal 모델 4개와 relation을 추가한다.
- [x] migration을 생성한다.
- [x] Prisma Client를 생성한다.
- [x] DealStatus enum과 label mapper를 만든다.
- [x] Deal module을 기존 Backend module 구조에 맞춰 추가한다.
- [x] DTO validation을 작성한다.
- [x] repository에서 ownership 조건을 포함한 query를 작성한다.
- [x] application service에서 생성 transaction을 구현한다.
- [x] 목록 API의 최신 다음 행동 1개 조회를 구현한다.
- [x] 옵션 API 3개를 `createdAt DESC`로 구현한다.
- [x] export xlsx를 구현한다.
- [x] 다음 행동 로그 API 3개를 구현한다.
- [x] 메모 로그 API 3개를 구현한다.
- [x] observability event를 남긴다.
- [x] API 테스트를 추가한다.
- [x] lint/test/e2e 가능한 검증을 실행한다.

## 4. API 완료 목록

완료 시 아래 API가 모두 동작해야 한다.

- [x] `GET /api/deals/stage-counts`
- [x] `GET /api/deals`
- [x] `GET /api/deals/:dealId`
- [x] `POST /api/deals`
- [x] `PATCH /api/deals/:dealId`
- [x] `GET /api/deals/company-options`
- [x] `GET /api/deals/contact-options`
- [x] `GET /api/deals/product-options`
- [x] `GET /api/deals/export/xlsx`
- [x] `GET /api/deals/:dealId/following-action-logs`
- [x] `POST /api/deals/:dealId/following-action-logs`
- [x] `PATCH /api/deals/:dealId/following-action-logs/:followingActionLogId`
- [x] `GET /api/deals/:dealId/memo-logs`
- [x] `POST /api/deals/:dealId/memo-logs`
- [x] `PATCH /api/deals/:dealId/memo-logs/:memoLogId`

## 5. Acceptance Criteria

- 인증 없이는 401을 반환한다.
- 타 사용자 Deal/FK/Log 접근은 404를 반환한다.
- 목록 응답은 nested company/contact/latestFollowingAction을 사용한다.
- 목록 응답에는 product가 없다.
- 목록은 `search`, `companyId`, `contactId`, `dealStatus`, `sort` query를 지원한다.
- stage counts는 `search`, `companyId`, `contactId` query를 지원한다.
- 상세 응답은 nested products 배열을 포함한다.
- 생성 API는 Deal, DealProduct, 최초 다음 행동 로그를 함께 만든다.
- 생성/수정 API는 contact가 company에 속하는지 검증한다.
- 생성/수정 API는 `productIds` 배열로 딜-제품 연결을 관리한다.
- 최초 다음 행동 로그의 `checkComplete`은 false다.
- `expectedEndDate`는 `YYYY-MM-DD`만 허용한다.
- option API 3개는 `createdAt DESC`다.
- following action log와 memo log 목록은 `createdAt DESC`다.
- export에는 id, 제품, 최근수정일이 없다.

## 6. 완료 기록

작업 완료 후 TODO_LOG에 아래를 남긴다.

- 구현한 API 목록
- migration 이름
- 실행한 검증 명령과 결과
- 남은 이슈 또는 후속 작업
