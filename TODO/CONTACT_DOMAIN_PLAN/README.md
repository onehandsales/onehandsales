# Contact Domain Plan

## 목적

사용자가 사용하는 거래처(담당자) 페이지의 기본 기능을 FE와 BE가 같은 계약으로 구현할 수 있게 실행 문서를 둔다.

이 계획에서 `거래처`, `담당자`, `Contact`는 같은 의미다. `Contact`는 반드시 `Company`에 소속된 사람이며, 회사 없이 저장하지 않는다.

관리자 페이지, 휴지통, soft delete, 명함 OCR, 딜/제품/일정/회의록 연결 수 계산은 현재 범위에서 제외한다.

## 필수 선행 정본

이 계획의 모든 문서는 `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`에 나열된 `AGENT/SOFTWARE_AGENT` 전체 문서를 먼저 참고한 뒤 작성/수정한다.

특히 API 계약과 goal 문서에는 계약 상태, 소비자, 요청값 형태, 응답값 형태, 내부 비즈니스 로직, 연결 DB 스키마, transaction, observability, 에러 응답, FE/BE 처리 기준을 상세하게 적는다.

## 문서 구조

```text
TODO/CONTACT_DOMAIN_PLAN/
  README.md
  COMMON/
    README.md
    WORK-SPLIT.md
    API-SPEC/
      CONTACT_API.md
      CONTACT_API_DETAIL.md
  FE-TODO/
    README.md
    G01-FE-CONTACT-PAGES.goal.md
  BE-TODO/
    README.md
    G01-BE-CONTACT-DOMAIN.goal.md
```

## 실행 순서

1. `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`로 Software Agent 전체 정본 선행 참조 규칙을 확인한다.
2. `COMMON/WORK-SPLIT.md`로 FE/BE 책임 경계를 확인한다.
3. `COMMON/API-SPEC/CONTACT_API.md`로 API 목록과 기본 계약을 확인한다.
4. `COMMON/API-SPEC/CONTACT_API_DETAIL.md`로 요청값, 응답값, 내부 비즈니스 로직, DB 연결, transaction, observability, 에러, FE/BE 처리 기준을 확인한다.
5. BE는 `BE-TODO/G01-BE-CONTACT-DOMAIN.goal.md`를 실행해 DB와 API를 구현한다.
6. FE는 BE 완료 후 `FE-TODO/G01-FE-CONTACT-PAGES.goal.md`를 실행해 사용자 페이지를 구현한다.

## 진행 상태

- BE: 완료
- FE 거래처 페이지: 미완료

## 현재 범위

BE가 책임지는 API:

- `GET /api/contacts`
- `GET /api/contacts/company-options`
- `GET /api/contact-job-grades`
- `POST /api/contact-job-grades`
- `DELETE /api/contact-job-grades/:jobGradeId`
- `GET /api/contact-departments`
- `POST /api/contact-departments`
- `DELETE /api/contact-departments/:departmentId`
- `POST /api/contacts`
- `GET /api/contacts/:contactId`
- `PATCH /api/contacts/:contactId`
- `POST /api/contacts/:contactId/memo-logs`
- `GET /api/contacts/:contactId/memo-logs`
- `PATCH /api/contacts/:contactId/memo-logs/:memoLogId`
- `POST /api/contacts/:contactId/private-memo-logs`
- `GET /api/contacts/:contactId/private-memo-logs`
- `PATCH /api/contacts/:contactId/private-memo-logs/:privateMemoLogId`

FE가 책임지는 화면:

- 거래처 목록
- 거래처 이름 검색
- 회사 필터
- 거래처 부서 필터
- 거래처 직급 필터
- 거래처 생성
- 거래처 부서 생성/삭제
- 거래처 직급 생성/삭제
- 거래처 단건 상세
- 회사/이름/핸드폰번호/이메일/부서/직급 수정
- 거래처 일반 메모 로그 생성/조회/수정
- 거래처 개인 비밀 메모 로그 생성/조회/수정

## 현재 만들지 않는 기능

- 관리자 거래처 관리 화면
- 거래처 휴지통
- 거래처 soft delete
- 거래처 삭제 API
- 거래처 부서 수정 API
- 거래처 직급 수정 API
- 회사 없이 거래처 저장
- 명함 OCR 저장 연동
- 거래처 목록의 최근 수정일 표시
- 거래처 상세의 딜 수, 제품 수, 일정 수, 회의록 수 표시

## 완료 기준

- BE는 같은 API 계약을 기준으로 구현됐다.
- FE는 같은 API 계약을 기준으로 구현한다.
- `COMMON/API-SPEC/CONTACT_API_DETAIL.md`에 모든 API의 요청값, 응답값, 내부 비즈니스 로직이 적혀 있다.
- `COMMON/API-SPEC/CONTACT_API_DETAIL.md`에 모든 API의 계약 상태, transaction, observability 기준이 적혀 있다.
- 거래처는 반드시 회사에 소속된다.
- 거래처 목록은 등록일 기준 DESC로 정렬된다.
- 거래처 목록에는 `updatedAt`이 나오지 않는다.
- 거래처 필터용 회사/부서/직급 전체 조회에는 `createdAt`이 나오지 않는다.
- 거래처 생성의 `contactMemo`는 값이 있을 때만 `ContactMemoLog` 첫 데이터로 저장된다.
- 거래처 생성의 `contactMemo`로 만들어진 첫 메모 로그는 `memoType`이 `초기 메모`다.
- 독립적인 거래처 일반 메모 로그 생성은 `memo`, `memoType`을 받는다.
- 거래처 일반 메모 로그 수정은 `memo`, `memoType` 중 최소 1개를 수정할 수 있다.
- 독립적인 거래처 개인 비밀 메모 로그 생성/수정은 `memo`만 받는다.
- 비밀 메모는 DB에 평문으로 저장되지 않는다.

## 관련 문서

- `TODO/CONTACT_DOMAIN_PLAN/COMMON/WORK-SPLIT.md`
- `TODO/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API.md`
- `TODO/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API_DETAIL.md`
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
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CHECKLIST/FRONTEND_USER_WEB_CHECKLIST.md`
