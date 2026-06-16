# /goal G11 BE Product Export Deal Count

## /goal 입력문

아래 문서를 먼저 읽고, 제품 xlsx export API에 제품별 딜 수 `dealCount` 컬럼을 추가해줘.

필수 참고 문서:

- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/PRODUCT_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/DEAL_SCHEMA.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/PRODUCT_EXPORT_XLSX_API.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/PRODUCT_EXPORT_DEAL_COUNT_API.md`

## 목표

`GET /api/products/export/xlsx` 파일에 `딜 수` 컬럼을 추가하고, 필요 시 `sort=dealCountDesc|dealCountAsc`를 export에도 반영한다.

## 구현 범위

- `BE/src/modules/product/presentation/http/dto/product-request.dto.ts`
- `BE/src/modules/product/application/ports/product.repository.ts`
- `BE/src/modules/product/application/services/product-application.service.ts`
- `BE/src/modules/product/infrastructure/persistence/prisma-product.repository.ts`
- 제품 xlsx export row 생성 로직
- 관련 테스트
- 관련 API 계약 문서 상태 갱신

## 비즈니스 규칙

- export에는 현재 제품 목록 검색어, 필터, 정렬 조건을 적용한다.
- export에는 `page`를 적용하지 않는다.
- 파일 컬럼에 `딜 수`를 추가한다.
- `딜 수`는 현재 사용자 소유 `DealProduct`만 집계한다.
- `sort=dealCountDesc`가 전달되면 딜 수 DESC 기준으로, `sort=dealCountAsc`가 전달되면 딜 수 ASC 기준으로 파일 row를 정렬한다.

## 구현 제한

- JSON 제품 목록 API 변경은 G10에서 처리한다.
- 제품 단건 상세 응답은 변경하지 않는다.
- Frontend 화면은 이 goal에서 변경하지 않는다.
- 범용 ExportJob 또는 비동기 export queue는 만들지 않는다.

## 검증

필수 검증:

```bash
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

동작 검증:

- xlsx에 `딜 수` 컬럼이 포함된다.
- 각 row의 `딜 수`가 실제 제품 연결 딜 수와 일치한다.
- 검색/필터/정렬 조건이 export에 적용된다.
- `page`는 export에 적용되지 않는다.
- 다른 사용자의 딜 연결 수가 섞이지 않는다.

## 완료 보고

- 변경한 파일
- xlsx 컬럼과 sort query 변경 내용
- 실행한 검증 명령과 결과
- 남은 리스크 또는 후속 작업
