# /goal G01 FE Company Pages

## /goal 입력문

```text
User Web에서 회사 도메인 사용자 페이지를 구현해줘.

반드시 먼저 읽을 문서:
- AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md
- TODO/COMPANY_DOMAIN_PLAN/COMMON/WORK-SPLIT.md
- TODO/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API.md
- TODO/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API_DETAIL.md
- AGENT/PM_AGENT/DECISIONS/023_company_domain_basic_scope.md
- AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md
- AGENT/SOFTWARE_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md
- AGENT/SOFTWARE_AGENT/CONVENTION/FRONTEND.md
- FE/README.md
- FE/user-web/README.md
- FE/user-web/src/**

작업 범위:
- FE/user-web
- FE/user-web/src/features/company 또는 기존 User Web feature 구조에 맞는 회사 도메인 위치
- FE/user-web/src/lib/api-client.ts 또는 기존 API client 구조
- FE 문서가 필요하면 FE/user-web/README.md

작업 목표:
1. 회사 목록 화면을 만든다.
2. 회사 목록은 `GET /api/companies`를 사용한다.
3. 회사 목록은 20개 단위 페이지네이션 UI를 제공한다.
4. 회사 목록은 회사 이름 검색을 제공한다.
5. 회사 목록은 회사 분야 필터와 회사 지역 필터를 제공한다.
6. 회사 분야 필터 옵션은 `GET /api/company-fields`로 조회한다.
7. 회사 지역 필터 옵션은 `GET /api/company-regions`로 조회한다.
8. 회사 목록에는 회사 이름, 회사 분야, 회사 지역, 등록일만 표시한다.
9. 회사 목록에는 최근 수정일, 담당자 수, 딜 수를 표시하지 않는다.
10. 회사 생성 화면 또는 모달을 만든다.
11. 회사 생성은 `companyName`, `companyFieldId`, `companyRegionId`를 필수로 받고 `companyMemo`를 선택으로 받는다.
12. `companyMemo`는 Company 테이블 값이 아니라 회사 메모 로그 첫 데이터로 저장된다는 의미로 UI copy를 정한다.
13. 회사 생성 성공 `201 Created`를 받으면 response body를 기대하지 말고 목록을 재조회한다.
14. 회사 분야 생성 UI를 만든다.
15. 회사 분야 생성 성공 `201 Created`를 받으면 response body를 기대하지 말고 회사 분야 목록을 재조회한다.
16. 회사 분야 삭제 UI를 만든다.
17. 회사 분야 삭제 성공 `204 No Content`를 받으면 response body를 기대하지 말고 회사 분야 목록과 회사 목록을 필요한 범위에서 재조회한다.
18. 매핑된 회사가 있는 회사 분야 삭제 실패는 사용자에게 삭제 불가 상태로 표시한다.
19. 회사 지역 생성 UI를 만든다.
20. 회사 지역 생성 성공 `201 Created`를 받으면 response body를 기대하지 말고 회사 지역 목록을 재조회한다.
21. 회사 지역 삭제 UI를 만든다.
22. 회사 지역 삭제 성공 `204 No Content`를 받으면 response body를 기대하지 말고 회사 지역 목록과 회사 목록을 필요한 범위에서 재조회한다.
23. 매핑된 회사가 있는 회사 지역 삭제 실패는 사용자에게 삭제 불가 상태로 표시한다.
24. 회사 단건 상세 화면을 만든다.
25. 회사 단건 상세는 회사명, 회사분야, 회사지역, 등록일, 최근수정일을 표시한다.
26. 회사 단건 상세에는 아직 거래처 수와 딜 수를 표시하지 않는다.
27. 회사명/회사분야/회사지역 수정 UI를 만든다.
28. 회사 기본 정보 수정은 `PATCH /api/companies/:companyId`를 사용한다.
29. 회사 기본 정보 수정 성공 `201 Created`를 받으면 response body를 기대하지 말고 회사 단건과 회사 목록을 필요한 범위에서 재조회한다.
30. 회사 메모 로그 생성 UI를 만든다.
31. 회사 메모 로그 생성은 `memo`, `memoType`을 필수로 받는다.
32. 회사 메모 로그 생성 성공 `201 Created`를 받으면 response body를 기대하지 말고 메모 로그 목록을 재조회한다.
33. 회사 메모 로그는 `GET /api/companies/:companyId/memo-logs`로 10개씩 무한스크롤 조회한다.
34. 회사 메모 로그는 `memoType`, 메모, 등록일을 표시한다.
35. 회사 메모 로그 수정은 `PATCH /api/companies/:companyId/memo-logs/:memoLogId`를 사용한다.
36. 회사 메모 로그 수정 성공 `201 Created`를 받으면 response body를 기대하지 말고 해당 목록을 재조회하거나 로컬 상태를 갱신한다.
37. 회사 개인 비밀 메모 로그 생성 UI를 만든다.
38. 회사 개인 비밀 메모 로그 생성은 `memo`만 받는다.
39. 회사 개인 비밀 메모 로그 생성 성공 `201 Created`를 받으면 response body를 기대하지 말고 개인 비밀 메모 로그 목록을 재조회한다.
40. 회사 개인 비밀 메모 로그는 `GET /api/companies/:companyId/private-memo-logs`로 10개씩 무한스크롤 조회한다.
41. 회사 개인 비밀 메모 로그는 복호화된 메모와 등록일을 표시한다.
42. 회사 개인 비밀 메모 로그 수정은 `PATCH /api/companies/:companyId/private-memo-logs/:privateMemoLogId`를 사용한다.
43. 회사 개인 비밀 메모 로그 수정 성공 `201 Created`를 받으면 response body를 기대하지 말고 해당 목록을 재조회하거나 로컬 상태를 갱신한다.
44. API client type은 `COMMON/API-SPEC/COMPANY_API.md`의 request/response shape와 일치시킨다.

구현 제한:
- BE 코드를 수정하지 않는다.
- 관리자 페이지를 수정하지 않는다.
- 회사 휴지통 UI를 만들지 않는다.
- 회사 삭제 UI를 만들지 않는다.
- 회사 분야/지역 수정 UI를 만들지 않는다.
- 회사 목록에 최근 수정일을 표시하지 않는다.
- 회사 목록 또는 단건에 아직 없는 담당자 수와 딜 수를 표시하지 않는다.
- `initialMemo` 이름을 사용하지 않는다. 요청 필드명은 `companyMemo`다.
- 비밀 메모 암호화/복호화 로직을 FE에서 직접 구현하지 않는다.

검증:
- pnpm typecheck
- pnpm lint
- 가능한 경우 FE/user-web build
- 가능한 경우 회사 목록, 회사 생성, 회사 상세, 메모 로그 수정 흐름 수동 검증

완료 보고:
- 구현한 화면과 route 요약
- 추가한 API client 함수 요약
- response body 없는 API 처리 방식 요약
- 실행한 검증 명령과 결과
- BE API가 아직 없어서 못 돌린 검증이 있으면 명확히 기록
```

## 체크리스트

- [ ] 회사 목록 화면이 있다.
- [ ] 회사 이름 검색이 있다.
- [ ] 회사 분야 필터가 있다.
- [ ] 회사 지역 필터가 있다.
- [ ] 20개 단위 페이지네이션 UI가 있다.
- [ ] 회사 생성 UI가 있다.
- [ ] 회사 생성 요청 필드명이 `companyMemo`다.
- [ ] 회사 분야 생성/삭제 UI가 있다.
- [ ] 회사 지역 생성/삭제 UI가 있다.
- [ ] 회사 단건 상세 화면이 있다.
- [ ] 회사명/회사분야/회사지역 수정 UI가 있다.
- [ ] 회사 메모 로그 생성 UI가 있다.
- [ ] 회사 메모 로그 무한스크롤 조회 UI가 있다.
- [ ] 회사 메모 로그 수정 UI가 있다.
- [ ] 회사 개인 비밀 메모 로그 생성 UI가 있다.
- [ ] 회사 개인 비밀 메모 로그 무한스크롤 조회 UI가 있다.
- [ ] 회사 개인 비밀 메모 로그 수정 UI가 있다.
- [ ] response body 없는 201/204 API를 성공 status 기준으로 처리한다.
- [ ] 회사 목록에 `updatedAt`을 표시하지 않는다.
- [ ] 회사 분야/지역 목록에 `createdAt`을 사용하지 않는다.
- [ ] FE 검증 명령을 통과했다.

## 범위 밖

- Backend API 구현
- 관리자 페이지
- 회사 휴지통
- 회사 삭제
- 회사 분야/지역 수정
- 담당자 수와 딜 수 표시
