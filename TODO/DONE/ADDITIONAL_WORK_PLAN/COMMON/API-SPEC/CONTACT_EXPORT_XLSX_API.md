# Contact Export XLSX API Spec

## 1. 목적

이 문서는 담당자 목록 페이지의 내보내기 버튼에서 사용할 xlsx 다운로드 API 계약을 정의한다.

작성 기준:

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/CONTACT_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/COMPANY_SCHEMA.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API_DETAIL.md`

## 2. 계약 상태

- API: `GET /api/contacts/export/xlsx`
- 소비자: User Web
- 계약 상태: implemented
- 호환성: 신규 API
- 대상 화면: 담당자 목록 페이지
- 응답 형식: xlsx binary file

## 3. API 요약

담당자 목록 페이지에서 현재 적용된 검색/필터 조건에 맞는 담당자 전체 데이터를 xlsx 파일로 다운로드한다.

- 페이지네이션 없음
- `page` query는 사용하지 않는다.
- `username` 검색어는 export에도 적용한다.
- `companyId`, `contactDepartmentId`, `contactJobGradeId` 필터는 export에도 적용한다.
- 검색어와 필터가 동시에 있으면 모든 조건을 만족하는 담당자 전체를 내보낸다.
- 필터가 있으면 필터링된 전체 담당자 데이터를 내보낸다.
- 필터가 없으면 현재 사용자의 전체 담당자 데이터를 내보낸다.
- 정렬: `createdAt DESC`, 보조 정렬 `id DESC`
- id 계열 값은 파일에 포함하지 않는다.

## 4. Request

- Request 이름: `ExportContactsXlsxRequest`
- Method: `GET`
- Path: `/api/contacts/export/xlsx`
- 인증: Backend App access token 필요
- 권한: 본인 담당자만 내보내기 가능

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` | 인증 header |
| query | `username` | string | 아니오 | trim 후 빈 문자열이면 미적용 | 담당자 이름 부분 검색어 |
| query | `companyId` | string | 아니오 | UUID | 회사 필터 ID |
| query | `contactDepartmentId` | string | 아니오 | UUID | 담당자 부서 필터 ID |
| query | `contactJobGradeId` | string | 아니오 | UUID | 담당자 직급 필터 ID |
| query | `page` | 없음 | 아니오 | 전송하지 않음 | 내보내기는 페이지네이션을 적용하지 않음 |
| body | 없음 | 없음 | 아니오 | 없음 | body 없음 |

FE는 담당자 목록 화면의 현재 검색어와 필터 query를 전달하되 `page`는 제거한다.

## 5. Response

- Response 이름: `ContactExportXlsxFile`
- Status: `200 OK`
- Body: xlsx binary

권장 header:

| Header | Value |
|---|---|
| `Content-Type` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| `Content-Disposition` | `attachment; filename="contacts_YYYYMMDD_HHmmss.xlsx"` |

파일 컬럼:

| 컬럼명 | 값 기준 | 설명 |
|---|---|---|
| `회사명` | `Company.companyName` | 담당자가 속한 회사 이름 |
| `담당자명` | `Contact.username` | 담당자 이름 |
| `핸드폰번호` | `Contact.mobile` | 담당자 핸드폰번호 |
| `이메일` | `Contact.email` | 담당자 이메일 |
| `부서` | `ContactDepartment.departmentName` | 담당자 부서명 |
| `직급` | `ContactJobGrade.jobGradeName` | 담당자 직급명 |
| `등록일` | `Contact.createdAt` | `yyyy-mm-dd` 표시 형식 |

파일에 포함하지 않는 값:

- `Contact.id`
- `Company.id`
- `ContactDepartment.id`
- `ContactJobGrade.id`
- 내부 userId
- 메모 원문
- 개인 비밀 메모 원문 또는 암호문

## 6. 필터링 예시

담당자 목록 화면에서 다음 조건이 적용된 상태라고 가정한다.

- 담당자명 검색어: `홍`
- 회사: `오픈AI코리아`
- 부서: `영업팀`
- 직급: `팀장`

담당자 목록 API:

```http
GET /api/contacts?page=1&username=홍&companyId=company-1&contactDepartmentId=dept-1&contactJobGradeId=grade-1
```

내보내기 API:

```http
GET /api/contacts/export/xlsx?username=홍&companyId=company-1&contactDepartmentId=dept-1&contactJobGradeId=grade-1
```

이때 `page=1`은 export에 적용하지 않는다. xlsx에는 담당자명에 `홍`이 포함되고, 회사/부서/직급 필터를 모두 만족하는 담당자 전체가 들어간다.

xlsx 예시:

| 회사명 | 담당자명 | 핸드폰번호 | 이메일 | 부서 | 직급 | 등록일 |
|---|---|---|---|---|---|---|
| 오픈AI코리아 | 홍길동 | 010-1111-2222 | hong@example.com | 영업팀 | 팀장 | 2026-06-12 |
| 오픈AI코리아 | 홍민수 | 010-2222-3333 | minsu@example.com | 영업팀 | 팀장 | 2026-06-10 |

회사만 필터링한 경우:

```http
GET /api/contacts/export/xlsx?companyId=company-1
```

xlsx 예시:

| 회사명 | 담당자명 | 핸드폰번호 | 이메일 | 부서 | 직급 | 등록일 |
|---|---|---|---|---|---|---|
| 오픈AI코리아 | 김영업 | 010-3333-4444 | sales@example.com | 영업팀 | 팀장 | 2026-06-11 |
| 오픈AI코리아 | 이지원 | 010-4444-5555 | support@example.com | 지원팀 | 사원 | 2026-06-08 |

필터가 없는 경우:

```http
GET /api/contacts/export/xlsx
```

현재 사용자의 전체 담당자가 `createdAt DESC` 기준으로 내려간다.

## 7. 비즈니스 로직

1. AuthGuard로 현재 사용자를 확인한다.
2. export query를 validation한다.
3. `companyId`가 있으면 현재 사용자 소유 회사인지 검증한다.
4. `contactDepartmentId`가 있으면 현재 사용자 소유 부서인지 검증한다.
5. `contactJobGradeId`가 있으면 현재 사용자 소유 직급인지 검증한다.
6. 기존 담당자 목록과 같은 검색어와 필터 조건을 구성한다.
7. `Contact.userId = currentUserId` ownership 조건을 기본으로 적용한다.
8. 페이지네이션 없이 조건에 맞는 전체 담당자를 조회한다.
9. `Company`, `ContactDepartment`, `ContactJobGrade` relation을 함께 조회한다.
10. `createdAt DESC`, `id DESC`로 정렬한다.
11. id 계열 값과 민감 원문을 제외하고 xlsx row를 만든다.
12. xlsx binary와 다운로드 header를 반환한다.

## 8. 연결 DB 스키마

- 조회: `Contact`, `Company`, `ContactDepartment`, `ContactJobGrade`
- 생성: 없음
- 수정: 없음
- 삭제: 없음
- transaction: 없음

관계 기준:

- `Contact.companyId`는 `Company.id`를 참조한다.
- `Contact.contactDepartmentId`는 `ContactDepartment.id`를 참조한다.
- `Contact.contactJobGradeId`는 `ContactJobGrade.id`를 참조한다.
- `Contact`, `Company`, `ContactDepartment`, `ContactJobGrade`는 모두 `userId`를 가진 사용자 소유 데이터다.

## 9. Transaction

- 필요 여부: 없음
- 이유: 조회 전용 파일 생성 API다.
- rollback 범위: 없음
- 외부 Provider 호출: 없음

## 10. Observability

- event key: `contact.exported`
- audit log: 없음
- request id: 사용
- redaction: 담당자명, 핸드폰번호, 이메일, 메모 원문, 개인 비밀 메모 원문 logging 금지
- log context 권장값: `userId`, `filterKeys`, `rowCount`

## 11. Error

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |
| 잘못된 UUID query | `ValidationError` | 400 | 내보내기 실패 안내 | log |
| 본인 소유가 아닌 회사 ID | `CompanyNotFound` | 404 | 필터 초기화 또는 내보내기 실패 안내 | log |
| 본인 소유가 아닌 부서 ID | `ContactDepartmentNotFound` | 404 | 필터 초기화 또는 내보내기 실패 안내 | log |
| 본인 소유가 아닌 직급 ID | `ContactJobGradeNotFound` | 404 | 필터 초기화 또는 내보내기 실패 안내 | log |
| xlsx 생성 실패 | `ContactExportFailed` | 500 | 내보내기 실패 안내 | error |

## 12. FE/BE 처리 기준

FE:

- 담당자 목록 화면의 현재 검색어와 필터 query를 export API에 전달한다.
- `page`는 전달하지 않는다.
- 응답은 JSON이 아니라 blob으로 처리한다.
- 다운로드 파일명은 Backend의 `Content-Disposition` header를 우선 사용한다.

BE:

- 기존 `GET /api/contacts` JSON 응답은 변경하지 않는다.
- export API는 xlsx binary를 반환한다.
- 파일 컬럼명은 `회사명`, `담당자명`, `핸드폰번호`, `이메일`, `부서`, `직급`, `등록일`로 고정한다.
- 범용 `ExportJob`이나 비동기 export queue는 이 API 범위에 포함하지 않는다.
- 구현 시 static route인 `export/xlsx`가 `:contactId` path보다 먼저 매칭되도록 route 선언 순서를 주의한다.

## 13. 검증 기준

- 필터가 없으면 현재 사용자의 전체 담당자가 xlsx에 포함된다.
- `username` 필터가 있으면 해당 검색어 조건에 맞는 담당자만 포함된다.
- `companyId`, `contactDepartmentId`, `contactJobGradeId` 필터가 있으면 해당 조건에 맞는 담당자만 포함된다.
- `username`, `companyId`, `contactDepartmentId`, `contactJobGradeId`가 함께 있으면 네 조건을 모두 만족하는 담당자만 포함된다.
- xlsx 컬럼명은 `회사명`, `담당자명`, `핸드폰번호`, `이메일`, `부서`, `직급`, `등록일`이다.
- id 계열 값은 xlsx에 포함되지 않는다.
- 정렬은 `createdAt DESC`, `id DESC` 기준이다.
- 다른 사용자의 담당자, 회사, 부서, 직급이 섞이지 않는다.
