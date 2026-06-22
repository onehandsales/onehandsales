# /goal G02 BE Company Contact List

## /goal 입력문

아래 문서를 먼저 읽고, 회사 단건 조회 페이지에서 사용할 회사 연결 Contact 전체 목록 API를 추가해줘.

필수 참고 문서:

- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/COMPANY_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/CONTACT_SCHEMA.md`
- `TODO/DONE/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API_DETAIL.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/COMPANY_CONTACT_LIST_API.md`

## 목표

`GET /api/companies/:companyId/contacts` API를 추가해 해당 회사에 연결된 Contact 전체 목록을 반환한다.

## 구현 범위

- `BE/src/modules/company/presentation/http/company.controller.ts`
- `BE/src/modules/company/application/ports/company.repository.ts`
- `BE/src/modules/company/application/services/company-application.service.ts`
- `BE/src/modules/company/infrastructure/persistence/prisma-company.repository.ts`
- 필요 시 Company 응답 타입 또는 mapper
- `TODO/DONE/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API.md`
- `TODO/DONE/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API_DETAIL.md`

## API 계약

- Method: `GET`
- Path: `/api/companies/:companyId/contacts`
- 인증: Backend App access token
- 권한: 본인 회사에 연결된 Contact만 조회
- 페이지네이션: 없음
- 정렬: `createdAt DESC`, `id DESC`

응답:

```json
{
  "items": [
    {
      "id": "contact-id",
      "username": "홍길동",
      "mobile": "010-1111-2222",
      "email": "hong@example.com",
      "contactDepartment": {
        "id": "department-id",
        "departmentName": "영업팀"
      },
      "contactJobGrade": {
        "id": "job-grade-id",
        "jobGradeName": "대리"
      }
    }
  ]
}
```

## 비즈니스 규칙

- `companyId`가 현재 사용자 소유 회사인지 먼저 확인한다.
- Contact 조회 조건은 `companyId`와 현재 사용자 `userId`를 모두 포함한다.
- `ContactDepartment`, `ContactJobGrade` relation을 함께 조회한다.
- 응답에는 `id`, `username`, `mobile`, `email`, `contactDepartment.id`, `contactDepartment.departmentName`, `contactJobGrade.id`, `contactJobGrade.jobGradeName`을 포함한다.
- 연결된 Contact가 없으면 `items: []`를 반환한다.

## 구현 제한

- 기존 `GET /api/companies/:companyId` 응답은 변경하지 않는다.
- 기존 Contact API는 변경하지 않는다.
- Product API는 변경하지 않는다.
- Frontend 화면은 이 goal에서 변경하지 않는다.
- 페이지네이션, 검색, 필터를 추가하지 않는다.

## 검증

필수 검증:

```bash
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

동작 검증:

- 본인 회사에 연결된 Contact 목록만 반환한다.
- 연결된 Contact가 없으면 빈 배열을 반환한다.
- 다른 사용자 회사 ID는 `CompanyNotFound`로 처리한다.
- 다른 사용자의 Contact가 섞이지 않는다.
- 정렬은 `createdAt DESC`, `id DESC` 기준이다.

## 완료 보고

- 변경한 파일
- 추가한 API와 응답 shape
- 실행한 검증 명령과 결과
- 남은 리스크 또는 후속 작업
