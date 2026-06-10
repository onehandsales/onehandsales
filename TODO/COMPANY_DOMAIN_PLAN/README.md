# Company Domain Plan

## 목적

사용자가 사용하는 회사 페이지의 기본 기능을 FE와 BE가 같은 계약으로 구현할 수 있게 실행 문서를 둔다.

관리자 페이지, 휴지통, soft delete, 거래처 수와 딜 수 계산은 현재 범위에서 제외한다.

## 필수 선행 정본

이 계획의 모든 문서는 `TODO/SOFTWARE_AGENT_REFERENCE.md`에 나열된 `AGENT/SOFTWARE_AGENT` 전체 문서를 먼저 참고한 뒤 작성/수정한다.

특히 API 계약과 goal 문서에는 요청값 형태, 응답값 형태, 내부 비즈니스 로직, 연결 DB 스키마, 에러 응답, FE/BE 처리 기준을 상세하게 적는다.

## 문서 구조

```text
TODO/COMPANY_DOMAIN_PLAN/
  README.md
  COMMON/
    README.md
    WORK-SPLIT.md
    API-SPEC/
      COMPANY_API.md
  FE-TODO/
    README.md
    G01-FE-COMPANY-PAGES.goal.md
  BE-TODO/
    README.md
    G01-BE-COMPANY-DOMAIN.goal.md
```

## 실행 순서

1. `TODO/SOFTWARE_AGENT_REFERENCE.md`로 Software Agent 전체 정본 선행 참조 규칙을 확인한다.
2. `COMMON/WORK-SPLIT.md`로 FE/BE 책임 경계를 확인한다.
3. `COMMON/API-SPEC/COMPANY_API.md`로 API 계약을 확인한다.
4. BE는 `BE-TODO/G01-BE-COMPANY-DOMAIN.goal.md`를 실행해 DB와 API를 구현한다.
5. FE는 `FE-TODO/G01-FE-COMPANY-PAGES.goal.md`를 실행해 사용자 페이지를 구현한다.

## 현재 범위

BE가 책임지는 API:

- `GET /api/companies`
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
- 회사 생성
- 회사 분야 생성/삭제
- 회사 지역 생성/삭제
- 회사 단건 상세
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
- 회사 목록의 담당자 수와 딜 수
- 회사 단건의 거래처 수와 딜 수

## 완료 기준

- FE와 BE가 같은 API 계약을 기준으로 구현한다.
- 회사 목록은 등록일 기준 DESC로 정렬된다.
- 회사 목록에는 `updatedAt`이 나오지 않는다.
- 회사 분야/지역 전체 조회에는 `createdAt`이 나오지 않는다.
- 회사 생성의 `companyMemo`는 `CompanyMemoLog` 첫 데이터로 저장된다.
- 회사 생성의 `companyMemo`로 만들어진 첫 메모 로그는 `memoType`이 `초기 메모`다.
- 독립적인 회사 메모 로그 생성은 `memo`, `memoType`을 받는다.
- 독립적인 회사 개인 비밀 메모 로그 생성은 `memo`만 받는다.
- 비밀 메모는 DB에 평문으로 저장되지 않는다.
