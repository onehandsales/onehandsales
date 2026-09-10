# /goal G01 FE Product Pages

> 2026-09-11 문서 정리: 현재 BE/FE 기준과 충돌하는 과거 모델/API/페이지/부수 기록 언급은 제거했다.

## /goal 입력문

아래 문서를 먼저 읽고, 사용자 페이지 제품(Product) 화면과 API 연동을 완료해줘.

필수 문서:
- `AGENT/README.md`
- `AGENT/AGENT_USAGE_RULES.md`
- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/README.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/WORK-SPLIT.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API_DETAIL.md`

현재 코드 확인:
- `FE/user-web/package.json`
- `FE/user-web/src/**`
- 기존 제품 화면과 API 클라이언트

## 목표


`상품`, `제품`, `Product`는 같은 의미이며, 화면 문구는 `제품`을 사용한다.

## 구현 범위

### 1. 제품 목록 페이지

구현 API:
- `GET /api/products`
- `GET /api/products/export/xlsx`
- `GET /api/product-categories`
- `GET /api/product-statuses`

화면 기준:
- 10개 단위 페이지네이션을 사용한다.
- 검색은 제품명 `productName`만 대상으로 한다.
- 필터는 제품 카테고리, 제품 상태만 제공한다.
- 목록 컬럼은 제품명, 제품 카테고리명, 제품 상태명, 딜 수, 등록일을 표시한다.
- 내보내기 버튼은 현재 `productName`, `productCategoryId`, `productStatusId`, `sort` 조건을 export API에 전달하고 `page`는 전달하지 않는다.
- 내보내기 응답은 JSON이 아니라 blob으로 처리하고 Backend `Content-Disposition` 파일명을 우선 사용한다.

### 2. 제품 생성

구현 API:
- `POST /api/products`
- `POST /api/product-categories`
- `DELETE /api/product-categories/:categoryId`
- `POST /api/product-statuses`
- `DELETE /api/product-statuses/:statusId`

입력 기준:
- `productName`: 필수
- `productPrice`: 필수, 정수, 0 이상
- `productCategoryId`: 기존 선택 또는 새로 생성 후 선택
- `productStatusId`: 기존 선택 또는 새로 생성 후 선택

동작 기준:
- 생성 성공 응답은 본문 없는 `201 Created`로 처리한다.
- 카테고리/상태 생성 성공 응답은 본문 없는 `201 Created`로 처리하고 옵션 목록을 다시 조회한다.
- 카테고리/상태 삭제 성공 응답은 본문 없는 `204 No Content`로 처리하고 옵션 목록을 다시 조회한다.
- 카테고리/상태가 사용 중이라 삭제 실패하면 `409 Conflict`를 사용자에게 명확하게 표시한다.

### 3. 제품 상세/수정

구현 API:
- `GET /api/products/:productId`
- `PATCH /api/products/:productId`

상세 표시:
- 제품명
- 제품가격
- 제품 카테고리
- 제품 상태
- 등록일
- 최근수정일

수정 기준:
- `productName`, `productPrice`, `productCategoryId`, `productStatusId`를 수정할 수 있다.
- 수정 성공 응답은 본문 없는 `201 Created`로 처리하고 상세 데이터를 다시 조회한다.
- `productPrice` 정수/0 이상 검증을 프론트에서도 수행한다.

### 4. 제품 일반 메모

구현 API:

화면 기준:
- 일반 메모 무한스크롤 목록을 제공한다.
- 목록에는 `memoType`, `memo`, `createdAt`을 표시한다.
- 생성 입력은 `memoType`, `memo`를 받는다.
- 수정 입력은 `memoType`, `memo` 중 최소 1개를 수정할 수 있어야 한다.
- 생성/수정 성공 응답은 본문 없는 `201 Created`로 처리하고 목록을 다시 조회한다.


구현 API:

화면 기준:
- 목록에는 복호화된 `memo`, `createdAt`을 표시한다.
- 생성 입력은 `memo`를 받는다.
- 수정 입력은 `memo`를 받는다.
- 생성/수정 성공 응답은 본문 없는 `201 Created`로 처리하고 목록을 다시 조회한다.
- 암호화/복호화 책임은 백엔드에 있으며 프론트는 평문 입력과 응답 표시만 담당한다.

## 기존 코드 정리 기준

기존 프론트 코드에 아래 개념이 있으면 이번 API 계약에 맞게 제거하거나 이름을 변경한다.

- `name` 대신 `productName` 사용
- `category` 문자열 대신 `productCategoryId` 사용
- `unitPrice` 대신 `productPrice` 사용
- `currency` 제거
- `description` 제거
- `ProductConnection`, `connections`, `connectionCount`, 연결 대상 UI 제거
- 제품 삭제/복구/영구삭제 UI 제거
- `includeDeleted` 필터 제거
- `DELETE /api/products`, `/restore` 호출 제거

## 완료 체크리스트

- [x] 제품 목록 화면이 API 계약과 일치한다.
- [x] 제품명 검색만 제공한다.
- [x] 제품 카테고리/상태 필터가 동작한다.
- [x] 제품 목록에는 제품가격과 최근수정일이 표시되지 않는다.
- [x] 제품 목록 xlsx 내보내기가 현재 검색어, 필터, 정렬을 반영한다.
- [x] export API 응답을 blob 다운로드로 처리한다.
- [x] 제품 카테고리 생성/삭제 UI가 동작한다.
- [x] 제품 상태 생성/삭제 UI가 동작한다.
- [x] 제품 상세 화면이 계약 응답값을 표시한다.
- [x] 제품 수정 화면이 계약 요청값만 전송한다.
- [x] 일반 메모 생성/조회/수정이 동작한다.
- [x] 일반 메모 수정에서 `memoType`과 `memo` 중 최소 1개를 수정할 수 있다.
- [x] 본문 없는 `201 Created`, `204 No Content` 응답을 정상 처리한다.
- [x] 오래된 필드명과 삭제/복구/연결/로그 UI가 제거되어 있다.
- [x] 아래 검증 명령을 실행하고 결과를 보고했다.

## 완료 기록

- 완료일: 2026-06-13
- 브랜치: `fe/contact`
- 작업 로그: `TODO_LOG/2026-06-13/G11_PRODUCT_USER_WEB_SCREEN_REVISION/WORK_LOG.md`
- 검증: `npx tsc --noEmit` 통과 (오류 없음)
- 보류: BE `GET /api/products` 응답에 `totalPages` 미포함 → BE 추가 요청 필요

## 검증 명령

프로젝트 스크립트 이름은 현재 `FE/user-web/package.json`을 기준으로 확인한 뒤 실행한다.

권장 검증:

```powershell
cd D:\workspace_repository\sales_b2c_platform\Sales_b2c\FE\user-web
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run build
```

문서/계약 확인:

```powershell
cd D:\workspace_repository\sales_b2c_platform\Sales_b2c
git diff --check
```

## 제외 범위

- 백엔드 구현
- 관리자 페이지 구현
- 제품 삭제/복구/영구삭제
- ProductConnection
- 딜 생성 중 제품 inline creation 연동
- 범용 Import/Export/OCR 연동
- ExportJob 기반 비동기 내보내기
