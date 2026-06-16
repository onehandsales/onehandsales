# 회사 도메인 기본 기능 확정

## 1. 결정 배경

회사 도메인은 관리자 페이지가 아니라 사용자가 직접 사용하는 페이지를 먼저 구현한다.

기존 회사 로그/분야 표현은 자유 입력 중심이었지만, 현재 구현 범위에서는 회사 분야와 회사 지역을 별도 테이블로 분리하고 회사가 각각의 ID를 FK로 가지는 구조로 확정한다.

## 2. 확정 테이블

- `Company`
- `CompanyField`
- `CompanyRegion`
- `CompanyMemoLog`
- `CompanyUserPrivateMemoLog`

## 3. 핵심 정책

- 회사 목록은 `createdAt DESC`로 정렬한다.
- 회사 목록 응답에는 `updatedAt`을 포함하지 않는다.
- 회사 목록 응답에는 각 회사의 연결 담당자 수 `contactCount`를 포함한다.
- 회사 분야 전체 조회 응답에는 `createdAt`을 포함하지 않는다.
- 회사 지역 전체 조회 응답에는 `createdAt`을 포함하지 않는다.
- 회사 단건 조회 응답에는 회사명, 회사분야, 회사지역, 등록일, 최근수정일을 포함한다.
- 회사 단건 조회 응답 자체에는 담당자 수와 딜 수를 병합하지 않는다.
- 회사 단건 화면에서 필요한 연결 Contact 전체 목록은 `GET /api/companies/:companyId/contacts` 별도 API로 조회한다.
- 회사 목록 xlsx 내보내기는 `GET /api/companies/export/xlsx`로 제공하고, 현재 검색어와 필터를 반영하되 `page`는 제외한다.
- 회사 생성 요청의 `companyMemo`는 `Company` 테이블 컬럼이 아니라 `CompanyMemoLog` 첫 데이터로 저장한다.
- 회사 생성 요청의 `companyMemo`로 만들어지는 첫 메모 로그는 `memoType`을 `초기 메모`로 저장한다.
- 회사 생성 시 `companyMemo`가 없으면 메모 로그를 만들지 않는다.
- 독립적인 회사 메모 로그 생성 API는 `memo`, `memoType`을 필수로 받는다.
- 독립적인 회사 개인 비밀 메모 로그 생성 API는 `memo`만 필수로 받는다.
- 회사명, 회사분야, 회사지역은 회사 단건 수정 API로 변경할 수 있다.
- 회사 분야와 회사 지역은 생성과 삭제만 제공하고 수정은 제공하지 않는다.
- 이미 회사에 매핑된 회사 분야와 회사 지역은 삭제할 수 없다.
- 회사 기본 기능에서는 휴지통과 soft delete를 제외한다.

## 4. API 상태값

- 회사 생성 성공: `201 Created`, response body 없음
- 회사 기본 정보 수정 성공: `201 Created`, response body 없음
- 회사 분야 생성 성공: `201 Created`, response body 없음
- 회사 분야 삭제 성공: `204 No Content`, response body 없음
- 회사 지역 생성 성공: `201 Created`, response body 없음
- 회사 지역 삭제 성공: `204 No Content`, response body 없음
- 회사 메모 로그 생성 성공: `201 Created`, response body 없음
- 회사 메모 로그 수정 성공: `201 Created`, response body 없음
- 회사 개인 비밀 메모 로그 생성 성공: `201 Created`, response body 없음
- 회사 개인 비밀 메모 로그 수정 성공: `201 Created`, response body 없음
- 회사 목록 xlsx 내보내기 성공: `200 OK`, xlsx binary body
- 회사 연결 Contact 목록 조회 성공: `200 OK`, `items[]` body

## 5. 비밀 메모 보안

`CompanyUserPrivateMemoLog`의 메모 원문은 데이터베이스에 평문으로 저장하지 않는다.

API 요청/응답에서는 `memo`라는 이름을 사용하지만, DB에는 암호화된 본문과 key version을 저장한다. 관리자는 원문을 볼 수 없고 작성자 본인만 복호화된 값을 볼 수 있다.

## 6. 관련 문서

- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/COMPANY_SCHEMA.md`
- `TODO/DONE/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API.md`
