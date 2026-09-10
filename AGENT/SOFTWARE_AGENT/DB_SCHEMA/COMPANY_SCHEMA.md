# Company DB Schema

이 문서는 현재 `BE/prisma/schema.prisma` 기준의 Company 관련 활성 모델만 설명한다.

## 활성 모델

- `Company`
- `CompanyField`
- `CompanyRegion`
- `CompanyMemoLog`
- `CompanyUserPrivateMemoLog`

## 관계

```text
User 1 - N Company
User 1 - N CompanyField
User 1 - N CompanyRegion
CompanyField 1 - N Company
CompanyRegion 1 - N Company
Company 1 - N CompanyMemoLog
Company 1 - N CompanyUserPrivateMemoLog
```

현재 schema에는 Contact/Product/Deal 모델이 없으므로 Company에서 담당자, 제품, 딜로 이어지는 DB relation도 없다.

## Company

사용자가 등록한 회사의 기준 테이블이다.

- `id`: 회사 PK
- `userId`: 소유 사용자 FK
- `companyName`: 회사명
- `companyFieldId`: 회사 분야 FK
- `companyRegionId`: 회사 지역 FK
- `address`: 회사 상세 주소
- `createdAt`, `updatedAt`: 생성/수정 시각
- `deletedAt`, `deletedByUserId`, `trashExpiresAt`: 휴지통 정책 필드

모든 회사 조회와 변경은 `userId` ownership을 먼저 적용한다. 일반 목록, 상세, 검색, 옵션, export는 `deletedAt IS NULL` 회사만 대상으로 한다.

## CompanyField / CompanyRegion

회사 목록 필터에 쓰는 사용자별 옵션이다.

- `CompanyField.field`: 분야명
- `CompanyRegion.region`: 지역명
- `CompanyRegion.countryCode`: KR/US 등 국가 코드. legacy custom 지역은 `null`일 수 있다.
- `CompanyRegion.regionCode`: KR 시/도 또는 US state code. mapping 실패 custom 지역은 `null`일 수 있다.

이미 회사에 매핑된 분야/지역은 삭제할 수 없다. 수정 API는 제공하지 않는다.

## CompanyMemoLog

회사 일반 메모 로그다.

- `companyId`: 회사 FK
- `userId`: 작성자 FK
- `memoType`: 메모 유형
- `memo`: 메모 본문
- `createdAt`, `updatedAt`: 생성/수정 시각
- `deletedAt`, `deletedByUserId`, `trashExpiresAt`: 휴지통 정책 필드

회사 생성 시 `companyMemo`가 있으면 같은 transaction에서 첫 `CompanyMemoLog`로 저장한다.

## CompanyUserPrivateMemoLog

회사 개인 비밀 메모 로그다. 평문은 DB에 저장하지 않는다.

- `companyId`: 회사 FK
- `userId`: 작성자 FK
- `memoCiphertext`: 암호화된 메모 본문
- `memoKeyVersion`: 암호화 key version
- `createdAt`, `updatedAt`: 생성/수정 시각
- `deletedAt`, `deletedByUserId`, `trashExpiresAt`: 휴지통 정책 필드

API 요청/응답에서는 `memo`라는 이름을 사용하지만 DB에는 `memoCiphertext`, `memoKeyVersion`만 저장한다. 조회 시 작성자 본인에게만 복호화된 `memo`를 반환한다.

## 현재 제공 API

- `GET /api/companies`
- `GET /api/companies/export/xlsx`
- `GET /api/companies/:companyId`
- `POST /api/companies`
- `PATCH /api/companies/:companyId`
- `DELETE /api/companies/:companyId`
- `GET /api/company-fields`
- `POST /api/company-fields`
- `DELETE /api/company-fields/:fieldId`
- `GET /api/company-regions`
- `POST /api/company-regions`
- `DELETE /api/company-regions/:regionId`
- `POST /api/companies/:companyId/memo-logs`
- `GET /api/companies/:companyId/memo-logs`
- `PATCH /api/companies/:companyId/memo-logs/:memoLogId`
- `DELETE /api/companies/:companyId/memo-logs/:memoLogId`
- `POST /api/companies/:companyId/private-memo-logs`
- `GET /api/companies/:companyId/private-memo-logs`
- `PATCH /api/companies/:companyId/private-memo-logs/:privateMemoLogId`
- `DELETE /api/companies/:companyId/private-memo-logs/:privateMemoLogId`
