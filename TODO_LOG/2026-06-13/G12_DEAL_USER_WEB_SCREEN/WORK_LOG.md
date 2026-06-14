# G12 Deal User Web Screen — WORK LOG

## 작업일

2026-06-13

## 목표

`TODO/DEAL_DOMAIN_PLAN/FE-TODO/G02-FE-DEAL-PAGES.goal.md` 기준으로 딜 도메인 FE 화면을 BE API 계약에 맞게 전면 재구현한다.

## 완료 작업 목록

### 1. Deal 타입 전면 재작성

- 파일: `FE/user-web/src/features/deal/types/deal.ts`
- 제거한 stale 필드: `title`, `amount`, `currency`, `stage`, `likelihoodStatus`, `likelihoodPercent`, `expectedCloseDate`, `nextActionText`, `nextActionDueAt`, `nextActionStatus`, `hasMemo`, `memoCount`, `DealActivity`, `DealMemo`, `DealStageSummary`
- 추가한 새 타입: `DealStatus`, `DEAL_STATUS_LABEL`, `DEAL_STATUS_LIST`, `DealListItem`, `DealDetail`, `DealFollowingActionLog`, `DealMemoLog`, `DealCompanyOption`, `DealContactOption`, `DealProductOption`, `CreateDealInput`, `UpdateDealInput`, `DealSort`, `DealExportParams`

### 2. Deal API client 전면 재작성

- 파일: `FE/user-web/src/features/deal/api/deal-api.ts`
- 구현 API: 15개 전체 (`stage-counts`, `list`, `detail`, `create`, `update`, `company-options`, `contact-options`, `product-options`, `export/xlsx`, `following-action-logs` CRUD, `memo-logs` CRUD)
- export API는 `apiBlobClient` 사용

### 3. Deal Query Keys 전면 재작성

- 파일: `FE/user-web/src/features/deal/api/deal-query-keys.ts`
- 추가: `stageCounts`, `companyOptions`, `contactOptions`, `productOptions`, `followingActionLogs(dealId)`, `memoLogs(dealId)`

### 4. TanStack Query Hooks 전면 재작성

- `use-deal-list.ts`: `useDealStageCounts`, `useDealList`
- `use-deal-detail.ts`: `useDealDetail`, `useDealFollowingActionLogs`, `useDealMemoLogs`
- `use-deal-mutations.ts`: `useCreateDealMutation`, `useUpdateDealMutation`, `useCreateFollowingActionLogMutation`, `useUpdateFollowingActionLogMutation`, `useCreateMemoLogMutation`, `useUpdateMemoLogMutation`, `useExportDealsMutation`
- `use-deal-entity-options.ts`: `useDealCompanyOptions`, `useDealContactOptions`, `useDealProductOptions` (BE `/api/deals/*-options` 직접 호출로 변경)

### 5. Deal 스키마 전면 재작성

- 파일: `FE/user-web/src/features/deal/schemas/deal-schema.ts`
- `dealCreateFormSchema`, `dealUpdateFormSchema`, `followingActionLogFormSchema`, `memoLogFormSchema`
- `toCreateDealInput`, `toUpdateDealInput` 변환 함수

### 6. Deal Pipeline Home Screen 전면 재작성

- 파일: `FE/user-web/src/features/deal/components/deal-pipeline-home-screen.tsx`
- Desktop: 목록 (검색/단계 탭/정렬/export) + 오른쪽 상세 split view
- Mobile: 탭 + 카드 리스트
- 페이지네이션: `Pagination` 컴포넌트 `totalPages` 기반
- 딜 생성 dialog 연결

### 7. Deal Detail Panel 전면 재작성

- 파일: `FE/user-web/src/features/deal/components/deal-detail-panel.tsx`
- 기본 정보, 제품 목록, 다음 행동 로그 CRUD, 메모 로그 CRUD
- 로그 인라인 생성/수정/완료 토글

### 8. Deal Create Dialog 전면 재작성

- 파일: `FE/user-web/src/features/deal/components/deal-create-dialog.tsx`
- 회사/거래처 dropdown (`/api/deals/*-options` 직접 호출)
- 제품 다중 선택 toggle
- `dealName`, `dealCost`, `dealStatus`, `followingAction`, `expectedEndDate` 필드

### 9. 구 컴포넌트 stub 처리

- `deal-list-screen.tsx`: `DealPipelineHomeScreen` 재export로 교체
- `deal-activity-section.tsx`: null 반환 stub으로 교체
- `deal-display.ts`: 비움 (참조 파일 없음 확인)
- `deal-redesign/` 폴더 전체: stub 처리 (deal 폴더로 통합됨)

### 10. app-shell.tsx 업데이트

- `/deals/:dealId` 경로 감지 → `DealDetailTopBar` 컴포넌트 추가 (breadcrumb: 딜 / 딜명)
- `/deals` 경로에서 `flex flex-1 flex-col overflow-hidden` 적용

### 11. 라우터/페이지 업데이트

- `pages/deals/index.tsx`: `DealPipelineHomeScreen` 사용
- `pages/deals/detail.tsx`: `DealDetailPanel` 직접 사용 (단일 화면)
- `pages/home/index.tsx`: `DealPipelineHomeScreen` 사용

## 제거한 stale 계약 필드

| 구 필드 | 새 필드 |
|---|---|
| `title` | `dealName` |
| `amount` | `dealCost` |
| `currency` | (제거) |
| `stage` | `dealStatus` |
| `likelihoodStatus` | (제거) |
| `expectedCloseDate` | `expectedEndDate` |
| `nextActionText` | `latestFollowingAction.followingAction` |
| `companyName` (flat) | `company.companyName` (nested) |
| `contactName` (flat) | `contact.username` (nested) |

## 검증 결과

```
npx tsc --noEmit
(오류 없음 — 종료 코드 0)
```

## 수동 확인 필요 경로

- `/deals` — 목록 + split view
- `/deals/:dealId` — 상세 TopBar + 로그 CRUD
- 딜 생성 dialog (단계 탭에서 + 버튼)
- export 버튼 (xlsx 다운로드)
