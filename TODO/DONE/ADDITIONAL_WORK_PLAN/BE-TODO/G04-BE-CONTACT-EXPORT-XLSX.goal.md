# /goal G04 BE Contact Export XLSX

## /goal 입력문

아래 문서를 먼저 읽고, 담당자 목록 페이지의 현재 필터 조건에 맞는 담당자 데이터를 xlsx로 내려받는 내보내기 API를 추가해줘.

필수 참고 문서:

- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/CONTACT_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/COMPANY_SCHEMA.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API_DETAIL.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/CONTACT_EXPORT_XLSX_API.md`

## 목표

`GET /api/contacts/export/xlsx` API를 추가해 담당자 목록 필터 조건에 맞는 전체 담당자 데이터를 xlsx 파일로 반환한다.

## 구현 범위

- `BE/src/modules/contact/presentation/http/contact.controller.ts`
- `BE/src/modules/contact/application/ports/contact.repository.ts`
- `BE/src/modules/contact/application/services/contact-application.service.ts`
- `BE/src/modules/contact/infrastructure/persistence/prisma-contact.repository.ts`
- xlsx 생성 adapter 또는 service
- 필요 시 xlsx 생성 dependency
- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API_DETAIL.md`

## API 계약

- Method: `GET`
- Path: `/api/contacts/export/xlsx`
- 인증: Backend App access token
- 권한: 본인 담당자만 내보내기 가능
- 응답: xlsx binary file
- 페이지네이션: 없음
- 정렬: `createdAt DESC`, `id DESC`

Query:

- `username`
- `companyId`
- `contactDepartmentId`
- `contactJobGradeId`

`page`는 전달하지 않는다.

## xlsx 컬럼

| 컬럼명 | 값 |
|---|---|
| `회사명` | `Company.companyName` |
| `담당자명` | `Contact.username` |
| `핸드폰번호` | `Contact.mobile` |
| `이메일` | `Contact.email` |
| `부서` | `ContactDepartment.departmentName` |
| `직급` | `ContactJobGrade.jobGradeName` |
| `등록일` | `Contact.createdAt`의 날짜 표시값 |

id 계열 값은 xlsx에 포함하지 않는다.

## 비즈니스 규칙

- 기존 담당자 목록 API와 동일한 검색어와 필터 조건을 사용한다.
- 검색어와 필터가 동시에 있으면 모든 조건을 만족하는 담당자 전체를 내보낸다.
- 필터가 있으면 필터링된 전체 담당자 데이터를 내보낸다.
- 필터가 없으면 현재 사용자의 전체 담당자 데이터를 내보낸다.
- 담당자 목록 화면의 `page`는 export에 적용하지 않는다.
- 다른 사용자의 담당자, 회사, 부서, 직급이 섞이면 안 된다.

## 구현 제한

- 기존 `GET /api/contacts` JSON 응답은 변경하지 않는다.
- 기존 Contact 단건 API는 변경하지 않는다.
- Company API는 변경하지 않는다.
- Product API는 변경하지 않는다.
- 범용 Import/Export 모듈, ExportJob, 비동기 queue는 이 goal에서 구현하지 않는다.
- 메모 원문과 개인 비밀 메모 원문은 조회하거나 파일에 포함하지 않는다.
- `export/xlsx` route가 `:contactId` route에 가로막히지 않도록 controller 선언 순서를 확인한다.

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

- 필터 없이 호출하면 현재 사용자의 전체 담당자가 xlsx에 포함된다.
- 담당자명 검색어, 회사, 부서, 직급 필터가 각각 적용된다.
- 담당자명 검색어, 회사, 부서, 직급 필터가 동시에 있으면 모든 조건을 만족하는 담당자만 포함된다.
- xlsx 컬럼명은 `회사명`, `담당자명`, `핸드폰번호`, `이메일`, `부서`, `직급`, `등록일`이다.
- id 계열 값은 xlsx에 포함되지 않는다.
- 정렬은 `createdAt DESC`, `id DESC` 기준이다.
- 다른 사용자의 데이터가 섞이지 않는다.

## 완료 보고

- 변경한 파일
- 추가한 API와 response header
- xlsx 컬럼과 필터 동작
- 실행한 검증 명령과 결과
- 남은 리스크 또는 후속 작업
