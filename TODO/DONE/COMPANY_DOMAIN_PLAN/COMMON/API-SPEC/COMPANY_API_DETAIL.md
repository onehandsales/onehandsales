# Company API Detail

> 2026-09-11 문서 정리: 현재 BE/FE 기준과 충돌하는 과거 모델/API/페이지/부수 기록 언급은 제거했다.

## Company Request

- 생성: `companyName`, `companyFieldId`, `companyRegionId`, 선택 `address`
- 수정: `companyName`, `companyFieldId`, `companyRegionId`, 선택 `address`
- 목록/export query: 검색어, 분야 ID 목록, 지역 ID 목록

## Company Response

- 목록 item: `id`, `companyName`, `companyField`, `companyRegion`, `address`, `createdAt`
- 상세: 목록 item의 기본 값과 `updatedAt`
- 분야 item: `id`, `field`
- 지역 item: `id`, `region`, `countryCode`, `regionCode`

## 상태 코드

- 생성/수정/옵션 생성: `201 Created`
- 옵션 삭제: `204 No Content`
- 조회: `200 OK`
- export: `200 OK`

## 에러 기준

- 현재 사용자의 리소스가 아니면 존재하지 않는 리소스와 동일하게 처리한다.
- 회사에 연결된 분야/지역은 삭제할 수 없다.
- 필수 입력 누락과 잘못된 ID는 validation error로 처리한다.
