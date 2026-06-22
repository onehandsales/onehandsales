# /goal G01 FE Contact Pages

## /goal 입력문

아래 문서를 먼저 읽고, 사용자 페이지 담당자(Contact) 화면과 API 연동을 완료해줘.

필수 문서:
- `AGENT/README.md`
- `AGENT/AGENT_USAGE_RULES.md`
- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/README.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/WORK-SPLIT.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API_DETAIL.md`

현재 코드 확인:
- `FE/user-web/package.json`
- `FE/user-web/src/**`
- 기존 담당자/회사/메모 관련 화면과 API 클라이언트

## 목표

사용자 페이지에서 담당자(Contact) 목록, 생성, 상세, 수정, 일반 메모, 개인 비밀 메모, 필터 옵션 관리를 실제 백엔드 API 계약에 맞게 구현한다.

담당자는 회사에 소속된 담당자다. 회사 선택 없이 담당자를 저장하는 UI 흐름은 만들지 않는다.

## 구현 범위

### 1. 담당자 목록 페이지

구현 API:
- `GET /api/contacts`
- `GET /api/contacts/export/xlsx`
- `GET /api/contacts/company-options`
- `GET /api/contact-job-grades`
- `GET /api/contact-departments`

화면 기준:
- 10개 단위 페이지네이션을 사용한다.
- 검색은 담당자 이름 `username`만 대상으로 한다.
- 필터는 회사, 담당자 부서, 정렬을 제공한다. Backend API는 `contactJobGradeId`도 지원하지만 현재 FE 목록 화면은 직급 필터를 노출하지 않는다.
- 목록 컬럼은 회사, 이름, 핸드폰번호, 이메일, 담당자 부서, 담당자 직급, 등록일을 표시한다.
- 내보내기 버튼은 현재 `username`, `companyId`, `contactDepartmentId`, `sort` 조건을 export API에 전달하고 `page`는 전달하지 않는다.
- 내보내기 응답은 JSON이 아니라 blob으로 처리하고 Backend `Content-Disposition` 파일명을 우선 사용한다.
- 목록에는 담당자 삭제/복구/휴지통 UI를 만들지 않는다.

### 2. 담당자 생성

구현 API:
- `POST /api/contacts`
- `POST /api/contact-departments`
- `DELETE /api/contact-departments/:departmentId`
- `POST /api/contact-job-grades`
- `DELETE /api/contact-job-grades/:jobGradeId`

입력 기준:
- `username`: 필수
- `mobile`: 필수, `010-1111-2222` 형식
- `email`: 필수
- `companyId`: 필수
- `contactDepartmentId`: 기존 선택 또는 새로 생성 후 선택
- `contactJobGradeId`: 기존 선택 또는 새로 생성 후 선택
- `contactMemo`: 선택 입력

동작 기준:
- `contactMemo`를 입력하면 백엔드가 `ContactMemoLog`에 초기 메모를 기록한다.
- `contactMemo`를 입력하지 않으면 일반 메모 로그가 생성되지 않는다.
- 생성 성공 응답은 본문 없는 `201 Created`로 처리한다.
- 생성 모달의 옵션 관리 CTA는 `새 부서 생성`, `새 직급 생성`으로 표시한다.
- 직급/부서 생성 성공 응답은 본문 없는 `201 Created`로 처리하고 옵션 목록을 다시 조회한다.
- 직급/부서 삭제 성공 응답은 본문 없는 `204 No Content`로 처리하고 옵션 목록을 다시 조회한다.
- 직급/부서가 사용 중이라 삭제 실패하면 `409 Conflict`를 사용자에게 명확하게 표시한다.

### 3. 담당자 상세/수정

구현 API:
- `GET /api/contacts/:contactId`
- `PATCH /api/contacts/:contactId`

상세 표시:
- 회사
- 이름
- 핸드폰번호
- 이메일
- 담당자 직급
- 담당자 부서
- 등록일. 시간과 분까지 표시한다.
- 최근수정일. 시간과 분까지 표시한다.

수정 기준:
- `username`, `mobile`, `email`, `companyId`, `contactDepartmentId`, `contactJobGradeId`를 수정할 수 있다.
- 수정 성공 응답은 본문 없는 `201 Created`로 처리하고 상세 데이터를 다시 조회한다.
- `mobile` 형식 검증을 프론트에서도 수행한다.

### 4. 담당자 일반 메모

구현 API:
- `POST /api/contacts/:contactId/memo-logs`
- `GET /api/contacts/:contactId/memo-logs`
- `PATCH /api/contacts/:contactId/memo-logs/:memoLogId`

화면 기준:
- 일반 메모 무한스크롤 목록을 제공한다.
- 목록에는 `memoType`, `memo`, `createdAt`을 표시한다.
- 생성 입력은 `memoType`, `memo`를 받는다.
- 수정 입력은 `memoType`, `memo`를 모두 수정할 수 있어야 한다.
- 생성/수정 성공 응답은 본문 없는 `201 Created`로 처리하고 목록을 다시 조회한다.

### 5. 담당자 개인 비밀 메모

구현 API:
- `POST /api/contacts/:contactId/private-memo-logs`
- `GET /api/contacts/:contactId/private-memo-logs`
- `PATCH /api/contacts/:contactId/private-memo-logs/:privateMemoLogId`

화면 기준:
- 개인 비밀 메모 무한스크롤 목록을 제공한다.
- 목록에는 복호화된 `memo`, `createdAt`을 표시한다.
- 생성 입력은 `memo`를 받는다.
- 수정 입력은 `memo`를 받는다.
- 생성/수정 성공 응답은 본문 없는 `201 Created`로 처리하고 목록을 다시 조회한다.
- 암호화/복호화 책임은 백엔드에 있으며 프론트는 평문 입력과 응답 표시만 담당한다.

## 기존 코드 정리 기준

기존 프론트 코드에 아래 개념이 있으면 이번 API 계약에 맞게 제거하거나 이름을 변경한다.

- `initialMemo` 대신 `contactMemo` 사용
- `phone` 대신 `mobile` 사용
- `name` 대신 `username` 사용
- `department` 문자열 대신 `contactDepartmentId` 사용
- `position` 문자열 대신 `contactJobGradeId` 사용
- `address`는 담당자 범위에서 사용하지 않음
- 담당자 삭제/복구/영구삭제 UI 제거
- `permanentDeleteAt`, 휴지통, 복구 상태 표시 제거
- `ContactLog`, `PersonalMemo` 같은 오래된 명칭을 새 API 계약에 맞게 정리

## 완료 체크리스트

- [x] 담당자 목록 화면이 API 계약과 일치한다.
- [x] 담당자 이름 검색만 제공한다.
- [x] 회사/담당자 부서 필터와 정렬이 동작한다.
- [x] 담당자 목록 xlsx 내보내기가 현재 검색어, 필터, 정렬을 반영한다.
- [x] export API 응답을 blob 다운로드로 처리한다.
- [x] 담당자 생성에서 회사 선택이 필수다.
- [x] 담당자 생성에서 선택적 `contactMemo`가 전송된다.
- [x] 담당자 부서 생성/삭제 UI가 동작한다.
- [x] 담당자 직급 생성/삭제 UI가 동작한다.
- [x] 담당자 상세 화면이 계약 응답값을 표시한다.
- [x] 담당자 수정 화면이 계약 요청값만 전송한다.
- [x] 일반 메모 생성/조회/수정이 동작한다.
- [x] 일반 메모 수정에서 `memoType`과 `memo`를 모두 수정할 수 있다.
- [x] 개인 비밀 메모 생성/조회/수정이 동작한다.
- [x] 본문 없는 `201 Created`, `204 No Content` 응답을 정상 처리한다.
- [x] 오래된 필드명과 삭제/복구 UI가 제거되어 있다.
- [x] 아래 검증 명령을 실행하고 결과를 보고했다.

## 검증 명령

프로젝트 스크립트 이름은 현재 `FE/user-web/package.json`을 기준으로 확인한 뒤 실행한다.

권장 검증:

```powershell
cd D:\workspace_repository\sales_b2c_platform\Sales_b2c\FE\user-web
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run build
```

문서/계약 확인:

```powershell
cd D:\workspace_repository\sales_b2c_platform\Sales_b2c
rg -n "initialMemo|phone|position|address|permanentDeleteAt|DELETE /api/contacts|restore|trash" FE/user-web/src TODO/DONE/CONTACT_DOMAIN_PLAN
git diff --check
```

## 제외 범위

- 백엔드 구현
- 관리자 페이지 구현
- 담당자 삭제/복구/영구삭제
- 회사 없이 저장되는 담당자
- 범용 ExportJob 또는 비동기 내보내기 화면
- OCR, 명함 인식, 외부 주소록 연동
- 프론트엔드에서 비밀 메모 암호화/복호화 직접 구현
