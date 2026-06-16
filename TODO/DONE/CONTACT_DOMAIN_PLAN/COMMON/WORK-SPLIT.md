# FE/BE Work Split

## 목적

`CONTACT_DOMAIN_PLAN` 안에서 FE와 BE가 같은 작업을 중복하거나 API shape를 임의로 바꾸지 않도록 책임 경계를 고정한다.

## 공통 전제

- 이 계획의 TODO 문서는 `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`에 나열된 `AGENT/SOFTWARE_AGENT` 전체 문서를 먼저 참고한 뒤 작성/수정한다.
- 일반 사용자 페이지 API만 구현한다.
- 관리자 페이지는 이번 범위에서 제외한다.
- 모든 API는 `Authorization: Bearer <backend_app_access_token>`을 사용한다.
- 모든 API는 현재 로그인한 `userId` 기준으로 데이터 소유권을 검증한다.
- 모든 API 계약은 `COMMON/API-SPEC/CONTACT_API_DETAIL.md`의 계약 상태, transaction, observability 기준을 따른다.
- `Contact`는 반드시 `Company`에 소속된다.
- 담당자 목록은 `createdAt DESC`로 정렬한다.
- 담당자 목록 응답에는 `updatedAt`을 포함하지 않는다.
- 담당자 목록 xlsx 내보내기는 현재 검색어와 필터 조건을 적용하고 `page`는 적용하지 않는다.
- 담당자 필터용 회사/부서/직급 전체 조회 응답에는 `createdAt`을 포함하지 않는다.
- 담당자 생성 요청의 `contactMemo`는 값이 있을 때만 `ContactMemoLog` 첫 데이터로 저장한다.
- 담당자 생성 요청의 `contactMemo`로 만들어지는 첫 메모 로그는 `memoType`을 `초기 메모`로 저장한다.
- 담당자 일반 메모 로그 수정 API는 `memoType`, `memo` 중 최소 1개를 수정할 수 있다.
- 담당자 개인 비밀 메모는 DB에 평문으로 저장하지 않는다.

## BE 책임

BE는 DB, API, 비즈니스 규칙, 보안 정책을 책임진다.

- `Contact`, `ContactJobGrade`, `ContactDepartment`, `ContactMemoLog`, `ContactUserPrivateMemoLog` Prisma schema와 migration
- 담당자 목록 페이지네이션 API
- 담당자 목록 xlsx 내보내기 API
- 담당자 필터용 회사 전체 조회 API
- 담당자 필터용 직급 전체 조회 API
- 담당자 필터용 부서 전체 조회 API
- 담당자 단건 조회 API
- 담당자 생성 API
- 담당자 기본 정보 수정 API
- 담당자 직급 생성/삭제 API
- 담당자 부서 생성/삭제 API
- 담당자 일반 메모 로그 단건 생성 API
- 담당자 일반 메모 로그 10개씩 무한스크롤 조회 API
- 담당자 일반 메모 로그 단건 수정 API
- 담당자 개인 비밀 메모 로그 단건 생성 API
- 담당자 개인 비밀 메모 로그 10개씩 무한스크롤 조회 API
- 담당자 개인 비밀 메모 로그 단건 수정 API
- `contactMemo`가 있는 담당자 생성 요청의 transaction 처리
- 담당자 API 계약의 observability event key, request id, redaction 기준 유지
- 담당자 직급/부서 삭제 전 매핑 여부 검사
- 개인 비밀 메모 암호화/복호화 처리
- API 응답 shape와 status code 유지
- Backend 검증: Prisma validate/generate, typecheck, lint, test, build

BE가 하지 않는 일:

- FE 화면 구현
- 관리자 API 추가
- 담당자 휴지통 또는 soft delete 추가
- 담당자 삭제 API 추가
- 담당자 직급/부서 수정 API 추가
- 회사 없이 담당자 저장 허용
- 명함 OCR 저장 연동
- 담당자 상세에 딜 수, 제품 수, 일정 수, 회의록 수 추가

## FE 책임

FE는 사용자 화면, 상태, API client 연결을 책임진다.

- 담당자 목록 화면
- 담당자 이름 검색 입력
- 회사 필터 선택
- 담당자 부서 필터 선택
- 담당자 직급 필터 선택
- 10개 단위 페이지네이션 UI
- 담당자 목록 xlsx 내보내기 버튼
- 담당자 생성 화면 또는 모달
- 담당자 부서 생성/삭제 UI
- 담당자 직급 생성/삭제 UI
- 담당자 단건 상세 화면
- 회사/이름/핸드폰번호/이메일/부서/직급 수정 UI
- 담당자 일반 메모 로그 생성 UI
- 담당자 일반 메모 로그 10개씩 무한스크롤 조회 UI
- 담당자 일반 메모 로그 수정 UI
- 담당자 개인 비밀 메모 로그 생성 UI
- 담당자 개인 비밀 메모 로그 10개씩 무한스크롤 조회 UI
- 담당자 개인 비밀 메모 로그 수정 UI
- 생성/수정/삭제 API가 body 없이 성공하는 경우 필요한 목록 재조회

FE가 하지 않는 일:

- BE API shape 임의 변경
- BE 코드 수정
- DB schema 또는 migration 작성
- 관리자 화면 구현
- 담당자 휴지통 UI 추가
- 담당자 삭제 UI 추가
- 회사 없이 담당자 저장 UI 추가
- 담당자 목록에 최근 수정일 표시
- 현재 없는 딜 수, 제품 수, 일정 수, 회의록 수 표시
- export API에 `page`를 전달하거나 JSON 응답처럼 처리
- 비밀 메모 암호화 로직을 FE에서 직접 구현

## 실행 순서

1. BE goal 완료 결과와 현재 `BE/src/modules/contact` 구현을 확인한다.
2. FE goal은 `COMMON/API-SPEC/CONTACT_API.md`와 실제 BE 응답 shape를 기준으로 구현한다.
3. FE 작업 중 API 불일치가 발견되면 FE에서 우회하지 말고 API 계약과 BE 구현을 비교해 이슈로 남긴다.
4. API 계약을 변경해야 하면 `CONTACT_API.md`와 `CONTACT_API_DETAIL.md`의 transaction, observability 항목을 함께 갱신한다.

## 관련 goal

- `BE-TODO/G01-BE-CONTACT-DOMAIN.goal.md`
- `FE-TODO/G01-FE-CONTACT-PAGES.goal.md`
