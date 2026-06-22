# FE/BE Work Split

## 목적

`COMPANY_DOMAIN_PLAN` 안에서 FE와 BE가 같은 작업을 중복하거나 API shape를 임의로 바꾸지 않도록 책임 경계를 고정한다.

## 공통 전제

- 이 계획의 TODO 문서는 `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`에 나열된 `AGENT/SOFTWARE_AGENT` 전체 문서를 먼저 참고한 뒤 작성/수정한다.
- 일반 사용자 페이지 API만 구현한다.
- 관리자 페이지는 이번 범위에서 제외한다.
- 모든 API는 `Authorization: Bearer <backend_app_access_token>`을 사용한다.
- 모든 API는 현재 로그인한 `userId` 기준으로 데이터 소유권을 검증한다.
- 모든 API 계약은 `COMMON/API-SPEC/COMPANY_API_DETAIL.md`의 계약 상태, transaction, observability 기준을 따른다.
- 회사 목록은 기본 `createdAt DESC`로 정렬하고 담당자 수/딜 수 정렬을 지원한다.
- 회사 목록 응답에는 `updatedAt`을 포함하지 않는다.
- 회사 목록 응답에는 회사별 연결 담당자 수 `contactCount`를 포함한다.
- 회사 연결 Contact 목록은 회사 단건 응답에 병합하지 않고 `GET /api/companies/:companyId/contacts` 별도 API로 조회한다.
- 회사 목록 xlsx 내보내기는 현재 검색어, 필터, 정렬 조건을 적용하고 `page`는 적용하지 않는다.
- 회사 분야/지역 전체 조회 응답에는 `createdAt`을 포함하지 않는다.
- 회사 생성 요청의 `companyMemo`는 `CompanyMemoLog` 첫 데이터로 저장한다.
- 회사 생성 요청의 `companyMemo`로 만들어지는 첫 메모 로그는 `memoType`을 `초기 메모`로 저장한다.
- 회사 개인 비밀 메모는 DB에 평문으로 저장하지 않는다.

## BE 책임

BE는 DB, API, 비즈니스 규칙, 보안 정책을 책임진다.

현재 BE 책임 항목은 완료됐다. FE 작업자는 아래 API와 DB 기준을 선행 완료 조건으로 사용한다.

- `Company`, `CompanyField`, `CompanyRegion`, `CompanyMemoLog`, `CompanyUserPrivateMemoLog` Prisma schema와 migration
- 회사 목록 페이지네이션 API
- 회사 목록 item별 `contactCount` 계산
- 회사 목록 xlsx 내보내기 API
- 회사 연결 Contact 전체 목록 API
- 회사 분야 전체 조회 API
- 회사 지역 전체 조회 API
- 회사 단건 조회 API
- 회사 생성 API
- 회사명/회사분야/회사지역 수정 API
- 회사 분야 생성/삭제 API
- 회사 지역 생성/삭제 API
- 회사 메모 로그 단건 생성 API
- 회사 메모 로그 10개씩 무한스크롤 조회 API
- 회사 메모 로그 단건 수정 API
- 회사 개인 비밀 메모 로그 단건 생성 API
- 회사 개인 비밀 메모 로그 10개씩 무한스크롤 조회 API
- 회사 개인 비밀 메모 로그 단건 수정 API
- `companyMemo`가 있는 회사 생성 요청의 transaction 처리
- 회사 API 계약의 observability event key, request id, redaction 기준 유지
- 회사 분야/지역 삭제 전 매핑 여부 검사
- 개인 비밀 메모 암호화/복호화 처리
- API 응답 shape와 status code 유지
- Backend 검증: Prisma validate/generate, typecheck, lint, test, build

BE가 하지 않는 일:

- FE 화면 구현
- 관리자 API 추가
- 회사 휴지통 또는 soft delete 추가
- 회사 삭제 API 추가
- 회사 분야/지역 수정 API 추가
- 회사 목록에 딜 수 추가
- 회사 단건 응답에 담당자 수와 딜 수를 직접 병합

## FE 책임

FE는 사용자 화면, 상태, API client 연결을 책임진다.

- 회사 목록 화면
- 회사 이름 검색 입력
- 회사 분야 필터 선택
- 회사 지역 필터 선택
- 10개 단위 페이지네이션 UI
- 회사 목록의 `contactCount` 표시
- 회사 목록 xlsx 내보내기 버튼
- 회사 생성 화면 또는 모달
- 회사 분야 생성/삭제 UI
- 회사 지역 생성/삭제 UI
- 회사 단건 상세 화면
- 회사 단건 화면의 연결 Contact 목록 영역
- 회사명/회사분야/회사지역 수정 UI
- 회사 메모 로그 생성 UI
- 회사 메모 로그 10개씩 무한스크롤 조회 UI
- 회사 메모 로그 수정 UI
- 회사 개인 비밀 메모 로그 생성 UI
- 회사 개인 비밀 메모 로그 10개씩 무한스크롤 조회 UI
- 회사 개인 비밀 메모 로그 수정 UI
- 생성/수정/삭제 API가 body 없이 성공하는 경우 필요한 목록 재조회

FE가 하지 않는 일:

- BE API shape 임의 변경
- BE 코드 수정
- DB schema 또는 migration 작성
- 관리자 화면 구현
- 회사 휴지통 UI 추가
- 회사 삭제 UI 추가
- 회사 목록에 최근 수정일 표시
- 회사 목록 또는 단건에 딜 수 표시
- 회사 단건 응답에 없는 담당자 수를 임의 계산해 표시
- 비밀 메모 암호화 로직을 FE에서 직접 구현

## 실행 순서

1. BE goal 완료 결과를 확인해 DB와 API를 확정한다.
2. FE goal은 `COMMON/API-SPEC/COMPANY_API.md`와 실제 BE 응답 shape를 기준으로 구현한다.
3. FE 작업 중 API 불일치가 발견되면 FE에서 우회하지 말고 API 계약과 BE 구현을 비교해 이슈로 남긴다.
4. API 계약을 변경해야 하면 `COMPANY_API.md`와 `COMPANY_API_DETAIL.md`의 transaction, observability 항목을 함께 갱신한다.

## 관련 goal

- `BE-TODO/G01-BE-COMPANY-DOMAIN.goal.md`
- `FE-TODO/G01-FE-COMPANY-PAGES.goal.md`
