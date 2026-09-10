# 회사 도메인 기본 기능 확정

## 1. 결정 배경

회사 도메인은 관리자 페이지가 아니라 사용자가 직접 사용하는 페이지를 먼저 구현한다.

기존 회사 로그/분야 표현은 자유 입력 중심이었지만, 현재 구현 범위에서는 회사 분야와 회사 지역을 별도 테이블로 분리하고 회사가 각각의 ID를 FK로 가지는 구조로 확정한다.

## 2. 확정 테이블

- `Company`
- `CompanyField`
- `CompanyRegion`

## 3. 핵심 정책

- 회사 목록은 `createdAt DESC`로 정렬한다.
- 회사 목록 응답에는 `updatedAt`을 포함하지 않는다.
- 회사 분야 전체 조회 응답에는 `createdAt`을 포함하지 않는다.
- 회사 지역 전체 조회 응답에는 `createdAt`을 포함하지 않는다.
- 회사 단건 조회 응답에는 회사명, 회사분야, 회사지역, 등록일, 최근수정일을 포함한다.
- 회사 단건 조회 응답 자체에는 담당자 수와 딜 수를 병합하지 않는다. 현재 `BE/prisma/schema.prisma`에는 Contact/Deal 모델이 없으므로 연결 Contact/Deal 목록 API도 제공하지 않는다.
- 회사 목록 xlsx 내보내기는 `GET /api/companies/export/xlsx`로 제공하고, 현재 검색어와 필터를 반영하되 `page`는 제외한다.
- 회사 생성 요청은 회사명, 회사 분야 ID, 회사 지역 ID, 선택 주소만 받는다.
- 회사명, 회사분야, 회사지역은 회사 단건 수정 API로 변경할 수 있다.
- 회사 분야와 회사 지역은 생성과 삭제만 제공하고 수정은 제공하지 않는다.
- 이미 회사에 매핑된 회사 분야와 회사 지역은 삭제할 수 없다.
- 회사 보조 로그와 복구 계열 API는 현재 범위에 포함하지 않는다.

## 4. API 상태값

- 회사 생성 성공: `201 Created`, response body 없음
- 회사 기본 정보 수정 성공: `201 Created`, response body 없음
- 회사 분야 생성 성공: `201 Created`, response body 없음
- 회사 분야 삭제 성공: `204 No Content`, response body 없음
- 회사 지역 생성 성공: `201 Created`, response body 없음
- 회사 지역 삭제 성공: `204 No Content`, response body 없음
- 회사 목록 xlsx 내보내기 성공: `200 OK`, xlsx binary body

## 5. 제외 범위

회사 보조 로그와 복구 계열 모델/API는 현재 Prisma schema와 controller에 없다.

## 6. 관련 문서

- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/COMPANY_SCHEMA.md`
- `TODO/DONE/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API.md`
