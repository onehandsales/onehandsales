# Additional Work Common

## 1. 목적

이 폴더는 추가 유지보수 작업 중 FE와 BE가 함께 봐야 하는 계약과 기준을 관리한다.

## 2. 현재 문서

- `API-SPEC/COMPANY_LIST_CONTACT_COUNT_API.md`
- `API-SPEC/COMPANY_CONTACT_LIST_API.md`
- `API-SPEC/COMPANY_EXPORT_XLSX_API.md`
- `API-SPEC/CONTACT_EXPORT_XLSX_API.md`
- `API-SPEC/PRODUCT_EXPORT_XLSX_API.md`

## 3. 규칙

- API 응답이 바뀌는 작업은 `API-SPEC`에 요청값, 응답값, 비즈니스 로직, DB 기준, transaction, observability, 에러, FE/BE 처리 기준을 적는다.
- 구현 전 계약 상태를 확인한다.
- 기존 활성 계획의 API 계약과 충돌하면 기존 계획 문서를 함께 갱신한다.
