# Company Domain Plan

## 목적

사용자가 사용하는 회사 페이지의 기본 기능을 FE와 BE가 같은 계약으로 구현할 수 있게 실행 문서를 둔다.

관리자 페이지, 휴지통, soft delete는 현재 범위에서 제외한다. 회사 목록의 담당자 수(`contactCount`), 회사 목록의 딜 수(`dealCount`), 회사 단건 화면 보조 영역의 연결 Contact/Deal 목록은 추가 유지보수 범위에서 Backend API가 구현되어 FE 표시 범위에 포함한다.

## 필수 선행 정본

이 계획의 모든 문서는 `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`에 나열된 `AGENT/SOFTWARE_AGENT` 전체 문서를 먼저 참고한 뒤 작성/수정한다.

특히 API 계약과 goal 문서에는 계약 상태, 소비자, 요청값 형태, 응답값 형태, 내부 비즈니스 로직, 연결 DB 스키마, transaction, observability, 에러 응답, FE/BE 처리 기준을 상세하게 적는다.

## 문서 구조

```text
TODO/DONE/COMPANY_DOMAIN_PLAN/
  README.md
  COMMON/
    README.md
    WORK-SPLIT.md
    API-SPEC/
      COMPANY_API.md
      COMPANY_API_DETAIL.md
  FE-TODO/
    README.md
    G01-FE-COMPANY-PAGES.goal.md
  BE-TODO/
    README.md
    G01-BE-COMPANY-DOMAIN.goal.md
```

## 실행 순서

1. `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`로 Software Agent 전체 정본 선행 참조 규칙을 확인한다.
2. `COMMON/WORK-SPLIT.md`로 FE/BE 책임 경계를 확인한다.
3. `COMMON/API-SPEC/COMPANY_API.md`로 API 목록과 기본 계약을 확인한다.
4. `COMMON/API-SPEC/COMPANY_API_DETAIL.md`로 요청값, 응답값, 내부 비즈니스 로직, DB 연결, transaction, observability, 에러, FE/BE 처리 기준을 확인한다.
5. BE는 `[완료] BE-TODO/G01-BE-COMPANY-DOMAIN.goal.md`의 완료 결과를 확인한다.
6. FE는 `FE-TODO/G01-FE-COMPANY-PAGES.goal.md`를 실행해 사용자 페이지를 구현한다.

## 진행 상태

- BE: 완료
- BE 완료 확인일: 2026-06-11
- BE 완료 근거: `BE/prisma/schema.prisma`, `BE/prisma/migrations/20260611000000_add_company_domain/migration.sql`, `BE/src/modules/company`
- BE 검증: `prisma:validate`, `prisma:generate`, `typecheck`, `lint`, `test`, `build` 통과
- FE 회사 페이지: 완료
- FE 완료 확인일: 2026-06-14
- FE 완료 근거: `FE/user-web/src/features/company`, `FE/user-web/src/pages/companies`
- FE 검증: `FE/user-web` typecheck/lint/build 통과

## 현재 범위

BE가 책임지는 API:

- `GET /api/companies`
- `GET /api/companies/export/xlsx`
- `GET /api/companies/:companyId/contacts`
- `GET /api/companies/:companyId/deals`
- `GET /api/company-fields`
- `GET /api/company-regions`
- `GET /api/companies/:companyId`
- `POST /api/companies`
- `PATCH /api/companies/:companyId`
- `POST /api/company-fields`
- `DELETE /api/company-fields/:fieldId`
- `POST /api/company-regions`
- `DELETE /api/company-regions/:regionId`
- `POST /api/companies/:companyId/memo-logs`
- `GET /api/companies/:companyId/memo-logs`
- `PATCH /api/companies/:companyId/memo-logs/:memoLogId`
- `POST /api/companies/:companyId/private-memo-logs`
- `GET /api/companies/:companyId/private-memo-logs`
- `PATCH /api/companies/:companyId/private-memo-logs/:privateMemoLogId`

FE가 책임지는 화면:

- 회사 목록
- 회사 이름 검색
- 회사 분야 필터
- 회사 지역 필터
- 회사 목록 담당자 수 표시
- 회사 목록 딜 수 표시
- 회사 목록 xlsx 내보내기
- 회사 생성
- 회사 분야 생성/삭제
- 회사 지역 생성/삭제
- 회사 단건 상세
- 회사 단건 연결 Contact 목록 표시
- 회사 단건 연결 Deal 목록 표시
- 회사명/회사분야/회사지역 수정
- 회사 메모 로그 생성/조회/수정
- 회사 개인 비밀 메모 로그 생성/조회/수정

## 현재 만들지 않는 기능

- 관리자 회사 관리 화면
- 회사 휴지통
- 회사 soft delete
- 회사 삭제 API
- 회사 분야 수정 API
- 회사 지역 수정 API
- 회사 목록의 최근 수정일 표시
- 회사 단건 응답 자체에 담당자 수를 병합하는 변경
- 회사 단건 응답 자체에 딜 수를 병합하는 변경

## 완료 기준

- FE와 BE가 같은 API 계약을 기준으로 구현한다.
- `COMMON/API-SPEC/COMPANY_API_DETAIL.md`에 모든 API의 요청값, 응답값, 내부 비즈니스 로직이 적혀 있다.
- `COMMON/API-SPEC/COMPANY_API_DETAIL.md`에 모든 API의 계약 상태, transaction, observability 기준이 적혀 있다.
- 회사 목록은 기본 등록일 DESC로 정렬되며 담당자 수/딜 수 정렬을 지원한다.
- 회사 목록에는 `updatedAt`이 나오지 않는다.
- 회사 목록 item에는 `contactCount`와 `dealCount`가 있고, FE는 이를 담당자 수와 딜 수로 표시한다.
- 회사 단건 페이지의 연결 Contact 목록은 `GET /api/companies/:companyId/contacts` 별도 API로 조회한다.
- 회사 단건 페이지의 연결 Deal 목록은 `GET /api/companies/:companyId/deals` 별도 API로 조회한다.
- 회사 목록 xlsx 내보내기는 현재 검색어, 필터, 정렬을 반영하고 `page`는 제외한다.
- 회사 분야/지역 전체 조회에는 `createdAt`이 나오지 않는다.
- 회사 생성의 `companyMemo`는 `CompanyMemoLog` 첫 데이터로 저장된다.
- 회사 생성의 `companyMemo`로 만들어진 첫 메모 로그는 `memoType`이 `초기 메모`다.
- 독립적인 회사 메모 로그 생성은 `memo`, `memoType`을 받는다.
- 독립적인 회사 개인 비밀 메모 로그 생성은 `memo`만 받는다.
- 비밀 메모는 DB에 평문으로 저장되지 않는다.
