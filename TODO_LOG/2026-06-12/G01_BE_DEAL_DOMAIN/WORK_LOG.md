# G01 BE Deal Domain Work Log

## 1. 작업명

G01-BE-DEAL-DOMAIN Backend 구현

## 2. 작업 일자

2026-06-12

## 3. 관련 계획과 goal

- `TODO/DEAL_DOMAIN_PLAN/BE-TODO/G01-BE-DEAL-DOMAIN.goal.md`
- `TODO/DEAL_DOMAIN_PLAN/COMMON/GOAL-SPECS/G01-BE-DEAL-DOMAIN.md`

## 4. 관련 AGENT/TODO 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `TODO/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API.md`
- `TODO/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API_DETAIL.md`

## 5. 예정 범위

- Prisma `Deal`, `DealProduct`, `DealFollowingActionLog`, `DealMemoLog` 모델과 migration 추가
- code-level DealStatus enum과 label mapper 구현
- `/api/deals/*` User API 15개 구현
- Deal 생성과 최초 다음 행동 로그 생성을 transaction으로 처리
- 딜 목록 최신 다음 행동 1개 조회 구현
- 회사/담당자/제품 옵션 `createdAt DESC` 조회 구현
- xlsx export에서 id, 제품, 최근수정일 제외
- application service 단위 테스트 추가

## 6. 진행 기록

- Prisma schema에 Deal 관련 모델 4개와 User/Company/Contact/Product relation을 추가했다.
- `20260612000000_add_deal_domain` migration SQL을 추가했다.
- `20260612010000_add_deal_product_join` migration SQL을 추가해 `Deal.productId`를 `DealProduct`로 backfill하고 딜-제품 N:M 관계로 전환했다.
- `BE/src/modules/deal` 아래 domain/application/infrastructure/presentation 구조를 추가했다.
- Deal controller를 `AppModule`에 연결해 `/api/deals/*` route를 등록했다.
- Deal 생성 시 Deal, DealProduct, 최초 `DealFollowingActionLog` 생성이 같은 repository transaction 안에서 실행되도록 구현했다.
- Deal 수정 시 `productIds`가 전달되면 DealProduct 연결을 transaction 안에서 교체하도록 구현했다.
- Deal 생성/수정 시 담당자가 선택한 회사에 속하는지 검증하도록 구현했다.
- `expectedEndDate`는 API boundary에서 `YYYY-MM-DD` 문자열만 받고, application layer에서 실제 calendar date인지 검증한다.
- export 파일명은 기존 Backend xlsx helper 규칙과 동일한 `deals_YYYYMMDD_HHmmss.xlsx` 형식으로 맞췄다.
- Backend 구현 완료 상태에 맞춰 AGENT Backend architecture와 Deal TODO 상태 문서를 갱신했다.

## 7. 적용 범위 또는 변경 파일

- `BE/prisma/schema.prisma`
- `BE/prisma/migrations/20260612000000_add_deal_domain/migration.sql`
- `BE/prisma/migrations/20260612010000_add_deal_product_join/migration.sql`
- `BE/src/app.module.ts`
- `BE/src/modules/deal/**`
- `BE/src/modules/deal/application/services/deal-application.service.spec.ts`
- `BE/src/modules/deal/presentation/http/deal.controller.spec.ts`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `TODO/DEAL_DOMAIN_PLAN/**`
- `TODO/ACTIVE_BACKEND_API_FE_REVIEW.md`
- `TODO/README.md`

## 8. 검증 결과

통과:

- `pnpm prisma validate`
- `pnpm prisma generate`
- `pnpm run typecheck`
- `pnpm test -- --runInBand` -> 6 suites, 17 tests passed
- `pnpm run lint`
- `pnpm run build`
- `GET http://localhost:3000/api/health` -> 200
- `GET http://localhost:3000/api/deals/stage-counts` without auth -> 401
- 임시 clean schema `codex_deal_join_verify_*`에 현재 repo migration 5개 적용 성공
- 임시 clean schema에서 `Deal`, `DealProduct`, `DealFollowingActionLog`, `DealMemoLog` 테이블과 `Deal.expectedEndDate` date 컬럼 확인
- 임시 clean schema에서 `Deal.productId` 컬럼 제거와 `DealProduct_dealId_productId_key` unique index 확인
- 검증 후 임시 schema 삭제 확인
- Deal controller spec으로 15개 API route, static route ordering, 201/200 status, enum/date-only HTTP validation 확인

추가 확인:

- `pnpm prisma migrate status`는 local DB migration history drift를 보고했다.
- local DB는 `20260606000000_init_mvp_schema`, `20260606001000_auth_device_active_slot_unique` migration을 보유하고 있으나 현재 repo에는 없다.
- 현재 repo migration 5개는 local DB에 적용되어 있지 않은 상태로 표시된다.
- local DB에는 예전 MVP `Deal` 테이블만 존재하며, 컬럼은 `title`, `amount`, `stage`, `likelihoodStatus`, `nextActionTitle` 등으로 현재 계약의 `dealName`, `dealCost`, `dealStatus`, `DealProduct`, `DealFollowingActionLog`, `DealMemoLog` 구조와 다르다.
- 따라서 `migrate deploy` 또는 reset 계열 명령은 실행하지 않았다.
- public schema에는 적용하지 않았지만, clean schema 기준으로 migration chain 자체는 정상이다.

## 9. 검토 결과

- Backend 코드 구현과 정적/단위 검증은 완료됐다.
- migration 파일은 clean schema에서 적용 검증을 마쳤지만, 현재 public schema의 local DB history drift와 예전 `Deal` 테이블 충돌 때문에 public schema 적용은 보류했다.
- drift 해소 없이 강제로 migration history를 조작하거나 DB reset을 수행하지 않았다.

## 10. 남은 리스크 또는 보류 사항

- local DB migration history와 예전 Deal 테이블을 별도 절차로 정리해야 실제 local DB에 Deal 테이블을 안전하게 적용할 수 있다.
- User Web 연동은 `G02-FE-DEAL-PAGES`에서 진행한다.
- Admin Deal API, 삭제 API, 일정/회의록/자동화 연동은 계획 범위 밖이다.

## 11. 다음 권장 작업

1. local DB migration drift를 정리한다.
2. `G02-FE-DEAL-PAGES`로 User Web 딜 화면을 새 API 계약에 연결한다.

## 12. 전체 작업 진행 현황

- Backend Deal DB/API 구현: 완료
- Backend 자동 검증: 완료
- local DB migration 적용: 보류, migration history drift
- Frontend Deal 연동: 대기
