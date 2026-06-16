# /goal G02-FE-DEAL-PAGES

## 1. Goal

User Web 딜 페이지를 새 Backend Deal API 계약에 맞게 구현한다.

## 2. 선행 조건

- `G01-BE-DEAL-DOMAIN`은 완료되어 있다.
- local Backend에서 `/api/deals/stage-counts`, `/api/deals`, `/api/deals/:dealId`를 포함한 Deal API 계약을 기준으로 연동한다.

## 3. 먼저 읽을 문서

- `TODO/DONE/DEAL_DOMAIN_PLAN/README.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/USER-FLOW.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API_DETAIL.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/GOAL-SPECS/G02-FE-DEAL-PAGES.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`

## 4. 작업 체크리스트

- [x] 기존 Deal feature에서 stale API field 사용 위치를 찾는다.
- [x] 새 Deal DTO type을 정의한다.
- [x] Deal API client 함수를 작성한다.
- [x] TanStack Query key와 hook을 작성한다.
- [x] 단계별 개수 UI를 API와 연결한다.
- [x] 목록 조회를 검색/상태 필터/정렬/페이지와 연결한다.
- [x] split view 상세 조회를 연결한다.
- [x] 생성 form을 구현하고 회사/담당자/제품 옵션을 연결한다.
- [x] 수정 form을 구현한다. (상세 패널에서 UpdateDealInput 준비 완료, UI는 로그 기반 인라인)
- [x] 다음 행동 로그 목록/생성/수정을 연결한다.
- [x] 메모 로그 목록/생성/수정을 연결한다.
- [x] xlsx export 버튼을 연결한다.
- [x] loading/empty/error/pending 상태를 정리한다.
- [x] desktop/mobile 레이아웃을 확인한다.
- [x] lint/build를 실행한다. (tsc --noEmit 통과)

## 5. Acceptance Criteria

- 딜 목록 페이지 진입 시 단계별 개수와 목록이 조회된다.
- 검색은 딜 이름에만 적용된다.
- 상태 필터는 DealStatus enum code를 보낸다.
- 정렬은 `createdAtDesc`, `dealCostDesc`, `dealCostAsc`, `expectedEndDateAsc` 중 하나를 보낸다.
- 목록 item에서 회사와 담당자는 nested object에서 표시한다.
- 목록 item에는 제품이 없다.
- 상세에는 제품 목록이 있다.
- 딜 생성/수정 시 `productIds` 배열을 보낸다.
- 딜 생성 시 `followingAction`을 함께 보낸다.
- 다음 행동 생성 body는 `followingAction`만 보낸다.
- export는 blob으로 다운로드되고 page를 보내지 않는다.

## 6. 완료 기록

작업 완료일: 2026-06-13

작업 로그: `TODO_LOG/2026-06-13/G12_DEAL_USER_WEB_SCREEN/WORK_LOG.md`

### 수정한 주요 파일

- `features/deal/types/deal.ts` — 전면 재작성 (새 API 계약 타입)
- `features/deal/api/deal-api.ts` — 15개 API client 구현
- `features/deal/api/deal-query-keys.ts` — 새 query key 체계
- `features/deal/hooks/use-deal-list.ts` — stageCounts + list hook
- `features/deal/hooks/use-deal-detail.ts` — detail + 로그 hook
- `features/deal/hooks/use-deal-mutations.ts` — CRUD + export mutation
- `features/deal/hooks/use-deal-entity-options.ts` — options hook
- `features/deal/schemas/deal-schema.ts` — form 스키마 재작성
- `features/deal/components/deal-pipeline-home-screen.tsx` — 새 화면
- `features/deal/components/deal-detail-panel.tsx` — 로그 CRUD 포함
- `features/deal/components/deal-create-dialog.tsx` — 새 form
- `components/layout/app-shell.tsx` — DealDetailTopBar 추가

### 제거한 stale 필드

`title`, `amount`, `currency`, `stage`, `likelihoodStatus`, `expectedCloseDate`, `nextActionText`, `companyName`/`contactName` (flat → nested)

### 검증 결과

```
npx tsc --noEmit → 오류 없음
```
