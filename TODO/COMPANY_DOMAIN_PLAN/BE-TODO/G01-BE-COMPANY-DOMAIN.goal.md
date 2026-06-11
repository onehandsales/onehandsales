# /goal G01 BE Company Domain

## /goal 입력문

```text
Backend에서 사용자 페이지 회사 도메인의 DB schema와 API를 구현해줘.

반드시 먼저 읽을 문서:
- AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md
- TODO/COMPANY_DOMAIN_PLAN/COMMON/WORK-SPLIT.md
- TODO/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API.md
- TODO/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API_DETAIL.md
- AGENT/PM_AGENT/DECISIONS/023_company_domain_basic_scope.md
- AGENT/PM_AGENT/PLANNING/DATA_MODEL.md
- AGENT/SOFTWARE_AGENT/DB_SCHEMA/COMPANY_SCHEMA.md
- AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md
- AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md
- AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md
- AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md
- AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md
- AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md
- AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md
- BE/ARCHITECTURE.md
- BE/prisma/schema.prisma
- BE/src/modules/**

작업 범위:
- BE/prisma/schema.prisma
- BE/prisma/migrations
- BE/src/modules/company 또는 기존 Backend module 구조에 맞는 회사 도메인 위치
- BE/src/common 또는 shared layer 중 암호화 port가 필요한 최소 범위
- BE 문서가 필요하면 BE/README.md 또는 관련 module README

작업 목표:
1. `Company`, `CompanyField`, `CompanyRegion`, `CompanyMemoLog`, `CompanyUserPrivateMemoLog` schema를 추가한다.
2. schema와 코드에 필요한 주석을 단다. 관계/용도 주석은 `/// 기능 : ...`, 함수/메서드는 `// 기능 : ...` 형식을 따른다.
3. `Company`는 `companyName`, `companyFieldId`, `companyRegionId`, `createdAt`, `updatedAt`을 가진다.
4. `CompanyField`는 `field`, `createdAt`을 가진다.
5. `CompanyRegion`은 `region`, `createdAt`을 가진다.
6. `CompanyMemoLog`는 일반 메모 원문 `memo`와 메모 설명 `memoType`을 가진다.
7. `CompanyUserPrivateMemoLog`는 평문 `memo`가 아니라 암호화된 본문과 key version을 가진다.
8. 회사 목록 API는 회사명 검색, 회사 분야 ID 필터, 회사 지역 ID 필터, 20개 페이지네이션, `createdAt DESC` 정렬을 제공한다.
9. 회사 목록 응답에는 `updatedAt`을 넣지 않는다.
10. 회사 분야 전체 조회 응답에는 `createdAt`을 넣지 않는다.
11. 회사 지역 전체 조회 응답에는 `createdAt`을 넣지 않는다.
12. 회사 단건 조회 응답에는 회사명, 회사분야, 회사지역, 등록일, 최근수정일을 넣는다.
13. 회사 생성 API는 `companyName`, `companyFieldId`, `companyRegionId`를 필수로 받고 `companyMemo`를 선택으로 받는다.
14. 회사 생성 시 `companyMemo`가 있으면 같은 transaction에서 `CompanyMemoLog` 첫 데이터로 저장한다. 이때 `memoType`은 `초기 메모`로 저장한다.
15. 회사 생성 성공은 `201 Created`와 빈 body를 반환한다.
16. 회사 기본 정보 수정 API는 `companyName`, `companyFieldId`, `companyRegionId` 중 최소 1개를 받고 성공 시 `201 Created`와 빈 body를 반환한다.
17. 회사 분야 생성 성공은 `201 Created`와 빈 body를 반환한다.
18. 회사 분야 삭제 성공은 `204 No Content`와 빈 body를 반환한다.
19. 회사 지역 생성 성공은 `201 Created`와 빈 body를 반환한다.
20. 회사 지역 삭제 성공은 `204 No Content`와 빈 body를 반환한다.
21. 회사 분야나 회사 지역이 회사에 매핑되어 있으면 삭제를 막고 409 계열 domain error를 반환한다.
22. 회사 메모 로그 생성은 `memo`, `memoType`을 필수로 받고 성공 시 `201 Created`와 빈 body를 반환한다.
23. 회사 메모 로그 조회는 10개씩 cursor 기반 무한스크롤로 제공하고 `memoType`을 함께 반환한다.
24. 회사 메모 로그 수정은 `memoType`, `memo`를 수정하고 성공 시 `201 Created`와 빈 body를 반환한다.
25. 회사 개인 비밀 메모 로그 생성은 `memo`만 필수로 받고 저장 시 암호화한다. 성공 시 `201 Created`와 빈 body를 반환한다.
26. 회사 개인 비밀 메모 로그 조회는 본인이 작성한 로그만 복호화해 10개씩 cursor 기반 무한스크롤로 제공한다.
27. 회사 개인 비밀 메모 로그 수정은 `memo`만 수정하고 저장 시 다시 암호화한다. 성공 시 `201 Created`와 빈 body를 반환한다.
28. 모든 조회/수정/삭제는 현재 userId ownership을 검증한다.
29. API 계약 문서와 실제 응답 shape를 일치시킨다.
30. API 계약의 transaction, observability, request id, redaction 기준을 확인한다.

API 계약:
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

구현 제한:
- FE 코드를 수정하지 않는다.
- 관리자 API를 추가하지 않는다.
- 회사 휴지통이나 soft delete를 추가하지 않는다.
- 회사 삭제 API를 추가하지 않는다.
- 회사 분야/지역 수정 API를 추가하지 않는다.
- 회사 목록에 담당자 수와 딜 수를 추가하지 않는다.
- 회사 단건에 거래처 수와 딜 수를 추가하지 않는다.
- `initialMemo` 이름을 사용하지 않는다. 요청 필드명은 `companyMemo`다.
- `CompanyLog` 모델을 만들지 않는다.
- 회사 메모를 `PersonalMemo(targetType=COMPANY)`로 저장하지 않는다.
- 개인 비밀 메모 평문을 DB에 저장하지 않는다.

검증:
- pnpm.cmd run prisma:validate
- pnpm.cmd run prisma:generate
- pnpm.cmd run typecheck
- pnpm.cmd run lint
- pnpm.cmd run test
- pnpm.cmd run build
- rg로 `initialMemo`, `CompanyLog`, `PersonalMemo(targetType=COMPANY)` 참조가 새 구현에 남지 않았는지 확인
- rg로 회사 controller의 `// API :`, service/repository의 `// 기능 :`, class/interface의 `// 역할 :` 주석 누락이 없는지 확인

완료 보고:
- 추가한 DB model과 migration 요약
- 구현한 API 목록과 status code 요약
- `companyMemo` 저장 흐름 요약
- 개인 비밀 메모 암호화 방식 요약
- 실행한 검증 명령과 결과
- FE가 사용해야 할 최종 API 목록
```

## 체크리스트

- [x] Company schema와 migration이 있다.
- [x] CompanyField schema와 migration이 있다.
- [x] CompanyRegion schema와 migration이 있다.
- [x] CompanyMemoLog schema와 migration이 있다.
- [x] CompanyUserPrivateMemoLog schema와 migration이 있다.
- [x] 회사 목록 API가 있다.
- [x] 회사 분야 전체 조회 API가 있다.
- [x] 회사 지역 전체 조회 API가 있다.
- [x] 회사 단건 조회 API가 있다.
- [x] 회사 생성 API가 있다.
- [x] 회사 기본 정보 수정 API가 있다.
- [x] 회사 분야 생성/삭제 API가 있다.
- [x] 회사 지역 생성/삭제 API가 있다.
- [x] 회사 메모 로그 생성/조회/수정 API가 있다.
- [x] 회사 개인 비밀 메모 로그 생성/조회/수정 API가 있다.
- [x] 회사 목록 응답에 `updatedAt`이 없다.
- [x] 회사 분야/지역 전체 조회 응답에 `createdAt`이 없다.
- [x] 회사 생성의 `companyMemo`가 `CompanyMemoLog` 첫 데이터로 들어가고 `memoType`은 `초기 메모`다.
- [x] 회사 메모 로그 생성 API가 `memo`, `memoType`을 받는다.
- [x] 회사 개인 비밀 메모 로그 생성 API가 `memo`만 받는다.
- [x] 회사 분야/지역 삭제 시 매핑된 회사가 있으면 실패한다.
- [x] 개인 비밀 메모가 DB에 평문으로 저장되지 않는다.
- [x] Backend 검증 명령을 통과했다.

## 범위 밖

- FE 회사 화면 구현
- 관리자 회사 API
- 회사 휴지통
- 회사 삭제
- 회사 분야/지역 수정
- 거래처 수와 딜 수 계산
