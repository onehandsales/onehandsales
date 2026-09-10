# Product Domain Common

> 2026-09-11 문서 정리: 현재 BE/FE 기준과 충돌하는 과거 모델/API/페이지/부수 기록 언급은 제거했다.

## 목적

제품(Product) 도메인에서 FE와 BE가 함께 봐야 하는 계약을 둔다.

## 문서

- `WORK-SPLIT.md`: FE/BE 책임 경계
- `API-SPEC/PRODUCT_API.md`: 제품 도메인 User API 계약
- `API-SPEC/PRODUCT_API_DETAIL.md`: 제품 도메인 User API 요청값, 응답값, 내부 비즈니스 로직, DB, 에러, FE/BE 처리 기준

## 공통 전제

- 이 폴더의 계약 문서는 `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`에 나열된 `AGENT/SOFTWARE_AGENT` 전체 문서를 먼저 참고한 뒤 작성/수정한다.
- 사용자 페이지 API만 다룬다.
- 모든 API는 로그인한 사용자 기준으로 동작한다.
- 모든 조회와 변경은 `userId` ownership을 검증한다.
- `상품`, `제품`, `Product`는 같은 의미다.
- UI 문구는 `제품`, 코드/DB/API 도메인명은 `Product`를 사용한다.
- 제품 목록 검색은 `productName` 부분 검색만 제공한다.
- 제품 목록 필터는 `productCategoryId`, `productStatusId`만 제공한다.
- 제품 목록 응답에는 `productPrice`, `updatedAt`을 포함하지 않는다.

API 계약을 수정할 때는 계약 상태, 소비자, 요청값 형태, 응답값 형태, 내부 비즈니스 로직, 연결 DB 스키마, transaction, observability, 에러 응답, FE/BE 처리 기준을 누락하지 않는다.
API 구현 또는 FE 연동을 할 때는 `API-SPEC/PRODUCT_API_DETAIL.md`를 최종 API 상세 계약으로 사용한다.

## 관련 문서

- `TODO/DONE/PRODUCT_DOMAIN_PLAN/README.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/WORK-SPLIT.md`
- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
