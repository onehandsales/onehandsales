# Product Domain Plan

## 목적

사용자가 영업하는 상품/제품(Product) 페이지의 기본 기능을 FE와 BE가 같은 계약으로 구현할 수 있게 실행 문서를 둔다.

이 계획에서 `상품`, `제품`, `Product`는 같은 의미다. UI 문구는 `제품`을 사용하고, 코드/DB/API 도메인명은 `Product`를 사용한다.

관리자 페이지, 휴지통, soft delete, 제품 삭제/복구, 제품 연결, 제품 객관 로그, 딜 연동, 범용 Import/Export/OCR 연동은 현재 범위에서 제외한다. 제품 목록 xlsx 내보내기 API는 추가 유지보수 범위에서 Backend 구현이 완료되어 FE 목록 작업에 포함한다.

## 필수 선행 정본

이 계획의 모든 문서는 `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`에 나열된 `AGENT/SOFTWARE_AGENT` 전체 문서를 먼저 참고한 뒤 작성/수정한다.

특히 API 계약과 goal 문서에는 계약 상태, 소비자, 요청값 형태, 응답값 형태, 내부 비즈니스 로직, 연결 DB 스키마, transaction, observability, 에러 응답, FE/BE 처리 기준을 상세하게 적는다.

## 문서 구조

```text
TODO/DONE/PRODUCT_DOMAIN_PLAN/
  README.md
  COMMON/
    README.md
    WORK-SPLIT.md
    API-SPEC/
      PRODUCT_API.md
      PRODUCT_API_DETAIL.md
  FE-TODO/
    README.md
    G01-FE-PRODUCT-PAGES.goal.md
  BE-TODO/
    README.md
    G01-BE-PRODUCT-DOMAIN.goal.md
```

## 실행 순서

1. `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`로 Software Agent 전체 정본 선행 참조 규칙을 확인한다.
2. `COMMON/WORK-SPLIT.md`로 FE/BE 책임 경계를 확인한다.
3. `COMMON/API-SPEC/PRODUCT_API.md`로 API 목록과 기본 계약을 확인한다.
4. `COMMON/API-SPEC/PRODUCT_API_DETAIL.md`로 요청값, 응답값, 내부 비즈니스 로직, DB 연결, transaction, observability, 에러, FE/BE 처리 기준을 확인한다.
5. BE는 `[완료] BE-TODO/G01-BE-PRODUCT-DOMAIN.goal.md`의 완료 결과와 현재 `BE/src/modules/product` 구현을 확인한다.
6. FE는 BE 완료 후 `FE-TODO/G01-FE-PRODUCT-PAGES.goal.md`를 실행해 사용자 페이지를 구현한다.

## 진행 상태

- BE: 완료
- FE 제품 페이지: 완료
- FE 완료 확인일: 2026-06-14
- FE 완료 근거: `FE/user-web/src/features/product`, `FE/user-web/src/pages/products`
- FE 검증: `FE/user-web` typecheck/lint/build 통과

## 현재 범위

BE가 책임지는 API:

- `GET /api/products`
- `GET /api/products/export/xlsx`
- `GET /api/product-categories`
- `POST /api/product-categories`
- `DELETE /api/product-categories/:categoryId`
- `GET /api/product-statuses`
- `POST /api/product-statuses`
- `DELETE /api/product-statuses/:statusId`
- `POST /api/products`
- `GET /api/products/:productId`
- `PATCH /api/products/:productId`
- `POST /api/products/:productId/memo-logs`
- `GET /api/products/:productId/memo-logs`
- `PATCH /api/products/:productId/memo-logs/:memoLogId`
- `POST /api/products/:productId/private-memo-logs`
- `GET /api/products/:productId/private-memo-logs`
- `PATCH /api/products/:productId/private-memo-logs/:privateMemoLogId`

FE가 책임지는 화면:

- 제품 목록
- 제품명 검색
- 제품 카테고리 필터
- 제품 상태 필터
- 제품 목록 xlsx 내보내기
- 제품 생성
- 제품 카테고리 생성/삭제
- 제품 상태 생성/삭제
- 제품 단건 상세
- 제품명/제품가격/제품 카테고리/제품 상태 수정
- 제품 일반 메모 로그 생성/조회/수정
- 제품 개인 비밀 메모 로그 생성/조회/수정

## 현재 만들지 않는 기능

- 관리자 제품 관리 화면
- 제품 휴지통
- 제품 soft delete
- 제품 삭제/복구/영구삭제 API
- 제품 카테고리 수정 API
- 제품 상태 수정 API
- `ProductConnection`
- `ProductLog`
- 기존 `ProductMemo` 또는 공통 `PersonalMemo(targetType=PRODUCT)` 방식
- `initialMemo` 요청 필드명
- `unitPrice`, `currency`, `description` 필드
- 제품 목록의 최근 수정일 표시
- 제품 목록의 가격 표시
- 딜 생성 중 제품 inline creation 연동
- 범용 Import/Export/OCR 연동
- ExportJob 기반 비동기 내보내기

## 완료 기준

- BE와 FE가 같은 API 계약을 기준으로 구현된다.
- `COMMON/API-SPEC/PRODUCT_API_DETAIL.md`에 모든 API의 요청값, 응답값, 내부 비즈니스 로직이 적혀 있다.
- `COMMON/API-SPEC/PRODUCT_API_DETAIL.md`에 모든 API의 계약 상태, transaction, observability 기준이 적혀 있다.
- 제품 목록 검색은 `productName`만 대상으로 한다.
- 제품 목록은 기본 등록일 DESC로 정렬되며 딜 높은순/딜 낮은순 정렬을 지원한다.
- 제품 목록에는 `updatedAt`, `productPrice`가 나오지 않는다.
- 제품 목록 xlsx 내보내기는 현재 검색어, 필터, 정렬을 반영하고 `page`는 제외한다.
- 제품 목록 xlsx에는 제품명, 카테고리, 상태, 딜 수, 등록일을 포함하고 ID와 제품 가격은 포함하지 않는다.
- 제품 카테고리/상태 전체 조회에는 `createdAt`이 나오지 않는다.
- 제품 생성의 `productMemo`는 값이 있을 때만 `ProductMemoLog` 첫 데이터로 저장된다.
- 제품 생성의 `productMemo`로 만들어진 첫 메모 로그는 `memoType`이 `초기 메모`다.
- 독립적인 제품 일반 메모 로그 생성은 `memo`, `memoType`을 받는다.
- 제품 일반 메모 로그 수정은 `memo`, `memoType` 중 최소 1개를 수정할 수 있다.
- 독립적인 제품 개인 비밀 메모 로그 생성/수정은 `memo`만 받는다.
- 비밀 메모는 DB에 평문으로 저장되지 않는다.

## 관련 문서

- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/WORK-SPLIT.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API_DETAIL.md`
- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
