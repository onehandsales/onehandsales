# /goal G01 BE Contact Domain

## /goal 입력문

아래 문서를 먼저 읽고, 사용자 페이지 담당자(Contact) 도메인 백엔드 구현을 완료해줘.

필수 문서:
- `AGENT/README.md`
- `AGENT/AGENT_USAGE_RULES.md`
- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/README.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/WORK-SPLIT.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API_DETAIL.md`

현재 코드 확인:
- `BE/ARCHITECTURE.md`
- `BE/prisma/schema.prisma`
- `BE/src/modules/**`
- `BE/src/common/**`
- `BE/src/generated/prisma/**`

## 목표

사용자 페이지 담당자(Contact) 도메인의 DB 스키마, Prisma 마이그레이션, API, 비즈니스 로직, 관측성 로그, API 계약 문서를 구현한다.

담당자는 회사에 소속된 담당자다. `Contact.companyId`는 필수이며, 회사 없이 담당자를 생성하거나 저장하는 흐름은 만들지 않는다.

## 구현 범위

### 1. DB 스키마

다음 모델을 추가하거나 현재 코드 구조에 맞게 정리한다.

- `Contact`
- `ContactJobGrade`
- `ContactDepartment`
- `ContactMemoLog`
- `ContactUserPrivateMemoLog`

필드 기준:
- `Contact.id`: uuid
- `Contact.userId`: uuid FK
- `Contact.companyId`: uuid FK, 필수
- `Contact.username`: string, 필수
- `Contact.mobile`: string, 필수, `010-1111-2222` 형식
- `Contact.email`: string, 필수
- `Contact.contactJobGradeId`: uuid FK
- `Contact.contactDepartmentId`: uuid FK
- `Contact.createdAt`: 생성일
- `Contact.updatedAt`: 수정일
- `ContactJobGrade.id`: uuid
- `ContactJobGrade.userId`: uuid FK
- `ContactJobGrade.jobGradeName`: string
- `ContactJobGrade.createdAt`: 생성일
- `ContactDepartment.id`: uuid
- `ContactDepartment.userId`: uuid FK
- `ContactDepartment.departmentName`: string
- `ContactDepartment.createdAt`: 생성일
- `ContactMemoLog.id`: uuid
- `ContactMemoLog.contactId`: uuid FK
- `ContactMemoLog.userId`: uuid FK
- `ContactMemoLog.memoType`: string
- `ContactMemoLog.memo`: string
- `ContactMemoLog.createdAt`: 생성일
- `ContactMemoLog.updatedAt`: 수정일
- `ContactUserPrivateMemoLog.id`: uuid
- `ContactUserPrivateMemoLog.contactId`: uuid FK
- `ContactUserPrivateMemoLog.userId`: uuid FK
- `ContactUserPrivateMemoLog.memoCiphertext`: string
- `ContactUserPrivateMemoLog.memoKeyVersion`: string
- `ContactUserPrivateMemoLog.createdAt`: 생성일
- `ContactUserPrivateMemoLog.updatedAt`: 수정일

### 2. API 구현

`TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API_DETAIL.md`를 기준으로 아래 API를 구현한다.

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

### 3. 비즈니스 규칙

- 모든 API는 인증된 `userId` 소유 데이터만 접근한다.
- 담당자 목록 검색은 `username`만 대상으로 한다.
- 담당자 목록 필터는 `companyId`, `contactDepartmentId`, `contactJobGradeId`만 지원한다.
- 담당자 목록 페이지 크기 기본값은 10개다.
- 필터 옵션 API는 드롭다운 선택에 필요한 `id`와 표시명을 반환한다.
- `mobile`은 `010-1111-2222` 형식만 허용한다.
- `companyId`, `contactDepartmentId`, `contactJobGradeId`는 해당 사용자의 데이터인지 검증한다.
- 담당자 생성 시 `contactMemo`가 있으면 같은 트랜잭션에서 `ContactMemoLog`를 생성한다.
- 담당자 생성 시 `contactMemo`가 없으면 `ContactMemoLog`를 생성하지 않는다.
- 담당자 생성 시 초기 일반 메모의 `memoType`은 `"초기 메모"`로 저장한다.
- 담당자 일반 메모 수정 API는 `memoType`, `memo`를 모두 수정할 수 있어야 한다.
- 담당자 개인 비밀 메모는 평문을 DB에 저장하지 않는다.
- 담당자 개인 비밀 메모 목록/상세 응답은 복호화된 `memo`를 반환한다.
- 담당자 직급/부서 삭제는 사용 중이면 `409 Conflict`를 반환한다.
- 본 작업에 담당자 삭제/복구/영구삭제 API를 만들지 않는다.

### 4. 아키텍처 규칙

- 기존 백엔드의 모듈, 컨트롤러, 서비스, 저장소, DTO 패턴을 따른다.
- 컨트롤러는 인증/요청 매핑을 담당하고, 비즈니스 로직은 서비스 계층에 둔다.
- 저장소는 DB 접근만 담당한다.
- API별 주석을 컨트롤러 엔드포인트 위에 작성한다.
- API 내부 단계는 `# 1.`, `# 2.`, `# 3.` 형식으로 작성한다.
- API 내부 기능 메서드는 `"""기능 : ..."""` 주석을 작성한다.
- 모든 클래스와 인터페이스에는 역할 주석을 작성한다.
- 트랜잭션 경계는 서비스 계층에서 명확하게 보이도록 작성한다.
- 주요 생성/수정/삭제/비밀 메모 작업에는 구조화 로그를 남긴다.
- 로그에는 비밀 메모 평문, 암호문, 민감한 개인정보를 남기지 않는다.

### 5. API 계약 문서

백엔드 구현 후 실제 코드와 맞도록 아래 문서를 업데이트한다.

- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API_DETAIL.md`

## 완료 체크리스트

- [x] DB 모델과 관계가 구현되어 있다.
- [x] Prisma migration이 생성되어 있다.
- [x] 모든 Contact API가 구현되어 있다.
- [x] 담당자 생성 + 선택적 초기 메모 생성이 한 트랜잭션으로 처리된다.
- [x] 개인 비밀 메모는 암호화 저장되고 응답에서만 복호화된다.
- [x] 일반 메모 수정에서 `memoType`과 `memo`를 수정할 수 있다.
- [x] 개인 비밀 메모 수정 API가 존재한다.
- [x] 직급/부서 삭제 시 사용 중이면 `409 Conflict`를 반환한다.
- [x] API별 주석, 기능 주석, 클래스/인터페이스 역할 주석이 반영되어 있다.
- [x] 관측성 로그가 민감정보 없이 작성되어 있다.
- [x] API 계약 문서가 실제 구현과 일치한다.
- [x] 아래 검증 명령을 실행하고 결과를 보고했다.

## 구현 결과

- 구현 위치: `BE/src/modules/contact`
- DB schema: `BE/prisma/schema.prisma`
- migration: `BE/prisma/migrations/20260611010000_add_contact_domain/migration.sql`
- 모듈 등록: `BE/src/app.module.ts`
- 도메인 오류 HTTP 매핑: `BE/src/shared/presentation/filters/http-exception.filter.ts`

## 검증 결과

2026-06-11 기준으로 아래 명령을 실행했다. 현재 로컬 Node.js는 `v20.11.0`이라 `package.json`의 `>=24 <25` engine 경고가 출력됐지만, 명령 자체는 모두 성공했다.

- `pnpm.cmd run prisma:validate`: 성공
- `pnpm.cmd run prisma:generate`: 성공
- `pnpm.cmd run typecheck`: 성공
- `pnpm.cmd run lint`: 성공
- `pnpm.cmd run test`: 성공
- `pnpm.cmd run build`: 성공
- `rg -n "DELETE /api/contacts|permanentDeleteAt|initialMemo|ContactLog|PersonalMemo|companyId nullable" BE`: 결과 없음
- `rg -n "API :|기능 :|역할" BE/src/modules/contact`: 주석 존재 확인
- `git diff --check`: 성공

## 검증 명령

프로젝트 스크립트 이름은 현재 `BE/package.json`을 기준으로 확인한 뒤 실행한다.

권장 검증:

```powershell
cd D:\workspace_repository\sales_b2c_platform\Sales_b2c\BE
pnpm.cmd run prisma:validate
pnpm.cmd run prisma:generate
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run test
pnpm.cmd run build
```

문서/계약 확인:

```powershell
cd D:\workspace_repository\sales_b2c_platform\Sales_b2c
rg -n "companyId nullable|initialMemo|ContactLog|PersonalMemo|DELETE /api/contacts|permanentDeleteAt" BE TODO/DONE/CONTACT_DOMAIN_PLAN
rg -n "API :|기능 :|역할" BE/src/modules/contact BE/src/modules/contacts
git diff --check
```

## 제외 범위

- 프론트엔드 구현
- 관리자 페이지 구현
- 담당자 삭제/복구/영구삭제
- 회사 없이 저장되는 담당자
- 담당자 직급/부서 수정 API
- OCR, 명함 인식, 외부 주소록 연동
- 비밀 메모 평문 저장
