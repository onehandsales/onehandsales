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
- AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md
- AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md
- AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md
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
8. 회사 목록에는 회사 이름, 회사 분야, 회사 지역, 거래처 수, 등록일을 표시한다.
9. 회사 목록에는 최근 수정일과 딜 수를 표시하지 않는다.
10. 회사 목록의 거래처 수는 `items[].contactCount`를 사용하고, `totalCount`와 혼동하지 않는다.
11. 회사 목록 내보내기 버튼을 만든다.
12. 회사 목록 내보내기는 `GET /api/companies/export/xlsx`를 사용한다.
13. 내보내기 요청에는 현재 회사 이름 검색어, 회사 분야 필터, 회사 지역 필터를 전달하고 `page`는 전달하지 않는다.
14. 내보내기 응답은 JSON이 아니라 blob으로 처리하고 Backend `Content-Disposition` 파일명을 우선 사용한다.
15. 회사 생성 화면 또는 모달을 만든다.
16. 회사 생성은 `companyName`, `companyFieldId`, `companyRegionId`를 필수로 받고 `companyMemo`를 선택으로 받는다.
17. `companyMemo`는 Company 테이블 값이 아니라 회사 메모 로그 첫 데이터로 저장된다는 의미로 UI copy를 정한다.
18. 회사 생성 성공 `201 Created`를 받으면 response body를 기대하지 말고 목록을 재조회한다.
19. 회사 분야 생성 UI를 만든다.
20. 회사 분야 생성 성공 `201 Created`를 받으면 response body를 기대하지 말고 회사 분야 목록을 재조회한다.
21. 회사 분야 삭제 UI를 만든다.
22. 회사 분야 삭제 성공 `204 No Content`를 받으면 response body를 기대하지 말고 회사 분야 목록과 회사 목록을 필요한 범위에서 재조회한다.
23. 매핑된 회사가 있는 회사 분야 삭제 실패는 사용자에게 삭제 불가 상태로 표시한다.
24. 회사 지역 생성 UI를 만든다.
25. 회사 지역 생성 성공 `201 Created`를 받으면 response body를 기대하지 말고 회사 지역 목록을 재조회한다.
26. 회사 지역 삭제 UI를 만든다.
27. 회사 지역 삭제 성공 `204 No Content`를 받으면 response body를 기대하지 말고 회사 지역 목록과 회사 목록을 필요한 범위에서 재조회한다.
28. 매핑된 회사가 있는 회사 지역 삭제 실패는 사용자에게 삭제 불가 상태로 표시한다.
29. 회사 단건 상세 화면을 만든다.
30. 회사 단건 상세는 회사명, 회사분야, 회사지역, 등록일, 최근수정일을 표시한다.
31. 회사 단건 상세에는 연결 Contact 요약 영역을 둔다.
32. 연결 Contact 요약은 `GET /api/companies/:companyId/contacts`를 사용한다.
33. 연결 Contact 요약은 페이지네이션을 만들지 않고 전체 목록을 표시한다.
34. 연결 Contact 요약은 거래처 이름과 `contactDepartment.departmentName`을 표시한다.
35. 회사 단건 상세에는 딜 수를 표시하지 않는다.
36. 회사명/회사분야/회사지역 수정 UI를 만든다.
37. 회사 기본 정보 수정은 `PATCH /api/companies/:companyId`를 사용한다.
38. 회사 기본 정보 수정 성공 `201 Created`를 받으면 response body를 기대하지 말고 회사 단건과 회사 목록을 필요한 범위에서 재조회한다.
39. 회사 메모 로그 생성 UI를 만든다.
40. 회사 메모 로그 생성은 `memo`, `memoType`을 필수로 받는다.
41. 회사 메모 로그 생성 성공 `201 Created`를 받으면 response body를 기대하지 말고 메모 로그 목록을 재조회한다.
42. 회사 메모 로그는 `GET /api/companies/:companyId/memo-logs`로 10개씩 무한스크롤 조회한다.
43. 회사 메모 로그는 `memoType`, 메모, 등록일을 표시한다.
44. 회사 메모 로그 수정은 `PATCH /api/companies/:companyId/memo-logs/:memoLogId`에 `memoType`, `memo`를 보낸다.
45. 회사 메모 로그 수정 성공 `201 Created`를 받으면 response body를 기대하지 말고 해당 목록을 재조회하거나 로컬 상태를 갱신한다.
46. 회사 개인 비밀 메모 로그 생성 UI를 만든다.
47. 회사 개인 비밀 메모 로그 생성은 `memo`만 받는다.
48. 회사 개인 비밀 메모 로그 생성 성공 `201 Created`를 받으면 response body를 기대하지 말고 개인 비밀 메모 로그 목록을 재조회한다.
49. 회사 개인 비밀 메모 로그는 `GET /api/companies/:companyId/private-memo-logs`로 10개씩 무한스크롤 조회한다.
50. 회사 개인 비밀 메모 로그는 복호화된 메모와 등록일을 표시한다.
51. 회사 개인 비밀 메모 로그 수정은 `PATCH /api/companies/:companyId/private-memo-logs/:privateMemoLogId`를 사용한다.
52. 회사 개인 비밀 메모 로그 수정 성공 `201 Created`를 받으면 response body를 기대하지 말고 해당 목록을 재조회하거나 로컬 상태를 갱신한다.
53. API client type은 `COMMON/API-SPEC/COMPANY_API.md`와 `COMMON/API-SPEC/COMPANY_API_DETAIL.md`의 request/response shape와 일치시킨다.

구현 제한:
- BE 코드를 수정하지 않는다.
- 관리자 페이지를 수정하지 않는다.
- 회사 휴지통 UI를 만들지 않는다.
- 회사 삭제 UI를 만들지 않는다.
- 회사 분야/지역 수정 UI를 만들지 않는다.
- 회사 목록에 최근 수정일을 표시하지 않는다.
- 회사 목록 또는 단건에 딜 수를 표시하지 않는다.
- 회사 단건 응답에 연결 Contact 목록을 임의로 병합하지 않는다.
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
- Backend API는 완료되어 있으므로, 인증 세션이나 테스트 데이터 준비 부족으로 못 돌린 검증이 있으면 명확히 기록
```

## 체크리스트

- [x] 회사 목록 화면이 있다.
- [x] 회사 이름 검색이 있다.
- [x] 회사 분야 필터가 있다.
- [x] 회사 지역 필터가 있다.
- [x] 20개 단위 페이지네이션 UI가 있다.
- [x] 회사 목록에 `contactCount`가 거래처 수로 표시된다.
- [x] 회사 목록 xlsx 내보내기가 현재 검색어와 필터를 반영한다.
- [x] 회사 생성 UI가 있다.
- [x] 회사 생성 요청 필드명이 `companyMemo`다.
- [x] 회사 분야 생성/삭제 UI가 있다.
- [x] 회사 지역 생성/삭제 UI가 있다.
- [x] 회사 단건 상세 화면이 있다.
- [x] 회사 단건 상세에 연결 Contact 목록이 표시된다.
- [x] 회사명/회사분야/회사지역 수정 UI가 있다.
- [x] 회사 메모 로그 생성 UI가 있다.
- [x] 회사 메모 로그 무한스크롤 조회 UI가 있다.
- [x] 회사 메모 로그 수정 UI가 있다.
- [x] 회사 개인 비밀 메모 로그 생성 UI가 있다.
- [x] 회사 개인 비밀 메모 로그 무한스크롤 조회 UI가 있다.
- [x] 회사 개인 비밀 메모 로그 수정 UI가 있다.
- [x] response body 없는 201/204 API를 성공 status 기준으로 처리한다.
- [x] 회사 목록에 `updatedAt`을 표시하지 않는다.
- [x] 회사 분야/지역 목록에 `createdAt`을 사용하지 않는다.
- [x] export API 응답을 blob 다운로드로 처리한다.
- [x] FE 검증 명령을 통과했다.

## 작업 전에 먼저 해야 할 일

1. 현재 기준 브랜치를 확인한다.
2. 이 goal은 `main` 기준 새 feature 브랜치에서 진행한다.
3. `/goal`로 이번 턴 목표를 고정한다.
4. 아래 문서를 먼저 읽고, 구현 중 임의 해석이 생기면 다시 참조한다.

우선 읽을 문서:

- `AGENT/README.md`
- `AGENT/PM_AGENT/README.md`
- `AGENT/UXUI_AGENT/README.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `UX Design/PEN_UI_01_FRONTEND_PLAN.md`
- `UX Design/PEN_UI_03_COMMON_DECISIONS.md`
- `UX Design/PEN_UI_04_IMPLEMENTATION_LOG.md`
- `TODO/COMPANY_DOMAIN_PLAN/COMMON/WORK-SPLIT.md`
- `TODO/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API.md`
- `TODO/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API_DETAIL.md`

## 이번 goal의 최종 산출물

이번 goal이 끝났을 때 아래 결과가 나와 있어야 한다.

1. User Web 회사 목록 화면
2. User Web 회사 상세 화면
3. 회사 생성 UI
4. 회사 분야 생성/삭제 UI
5. 회사 지역 생성/삭제 UI
6. 회사 메모 로그 / 개인 비밀 메모 로그 UI
7. 회사 목록 xlsx 내보내기
8. 관련 API client, type, hook 정리
9. 구현 로그와 관련 문서 업데이트
10. 커밋 가능한 작업 상태

## 실제 작업 순서

### 1단계. 현재 코드 구조 파악

먼저 아래 파일과 폴더를 읽고 현재 회사 도메인 구현 상태를 파악한다.

- `FE/user-web/src/pages/companies/index.tsx`
- `FE/user-web/src/pages/companies/detail.tsx`
- `FE/user-web/src/features/company/index.ts`
- `FE/user-web/src/features/company/api/*`
- `FE/user-web/src/features/company/hooks/*`
- `FE/user-web/src/features/company/components/*`
- `FE/user-web/src/features/company/types/*`
- `FE/user-web/src/components/layout/*`
- `FE/user-web/src/components/navigation/*`
- `FE/user-web/src/styles/global.css`

확인할 것:

- 기존 company 페이지가 목록/상세 어디까지 구현돼 있는지
- 기존 company API client가 현재 Backend 계약과 어디가 다른지
- 기존 회사 화면이 pen 리디자인 구조와 어느 정도 충돌하는지
- 공통 shell / state UI / token을 재사용할 수 있는지

### 2단계. 구현 범위 쪼개기

회사 도메인은 한 번에 다 건드리지 말고 아래 순서로 구현한다.

1. 회사 목록
2. 회사 생성
3. 회사 분야/지역 관리
4. 회사 상세
5. 연결 Contact 요약
6. 메모 로그
7. 개인 비밀 메모 로그
8. xlsx 내보내기
9. 상태 UI 정리

이 순서를 유지하는 이유:

- 목록과 필터가 먼저 보여야 회사 도메인 화면 골격이 잡힌다.
- 상세는 목록에서 진입하는 흐름이므로 두 번째가 아니라 그 다음 단계다.
- 메모와 비밀 메모는 상세 화면 문법이 먼저 잡힌 뒤 붙이는 편이 안전하다.

### 3단계. 파일별 작업 계획

#### A. pages 레이어

수정/확인 대상:

- `FE/user-web/src/pages/companies/index.tsx`
- `FE/user-web/src/pages/companies/detail.tsx`

해야 할 일:

- `pages`는 라우트 진입점 역할만 하게 유지한다.
- 실제 UI는 `features/company/components/*`로 이동/유지한다.
- 상세 페이지는 route param 기준으로 companyId를 넘기는 역할만 하게 정리한다.

#### B. feature API 레이어

수정/추가 대상:

- `FE/user-web/src/features/company/api/company-api.ts`
- `FE/user-web/src/features/company/api/company-query-keys.ts`

해야 할 일:

- 목록 조회
- 분야 목록 조회
- 지역 목록 조회
- xlsx 내보내기
- 회사 생성
- 회사 기본 정보 수정
- 연결 Contact 조회
- 메모 로그 조회/생성/수정
- 개인 비밀 메모 로그 조회/생성/수정
- 회사 분야 생성/삭제
- 회사 지역 생성/삭제

주의:

- `201` 또는 `204` 후 response body가 없을 수 있으므로 body 파싱을 기대하지 않는다.
- export는 blob 다운로드로 처리하고 `Content-Disposition` 파일명을 우선 사용한다.

#### C. feature hooks 레이어

수정/추가 대상:

- `FE/user-web/src/features/company/hooks/*`

해야 할 일:

- 회사 목록 query hook
- 분야/지역 option query hook
- 회사 생성 mutation
- 회사 기본 정보 수정 mutation
- 회사 분야/지역 create/delete mutation
- 회사 메모 로그 / 개인 비밀 메모 로그 infinite query hook
- 연결 Contact 요약 query hook

주의:

- mutation 성공 후 invalidate 범위를 과하게 넓히지 않는다.
- 최소한 필요한 query key만 재조회한다.

#### D. feature types / schema 레이어

수정/추가 대상:

- `FE/user-web/src/features/company/types/company.ts`
- 필요 시 `FE/user-web/src/features/company/schemas/*`

해야 할 일:

- Backend 계약과 정확히 맞는 response type 정의
- 회사 생성/수정 form input type 정리
- 메모 로그와 private memo log 타입 분리
- export 요청 파라미터 shape 정리

금지:

- 오래된 `initialMemo`, `name`, 임의 field명 사용 금지

#### E. feature components 레이어

수정/추가 대상:

- `FE/user-web/src/features/company/components/company-list-screen.tsx`
- `FE/user-web/src/features/company/components/company-detail-screen.tsx`
- `FE/user-web/src/features/company/components/company-create-dialog.tsx`
- `FE/user-web/src/features/company/components/company-edit-form.tsx`
- `FE/user-web/src/features/company/components/company-log-section.tsx`
- 필요 시 새 company 전용 하위 컴포넌트

해야 할 일:

- pen 리디자인 계층과 시각 톤을 최대한 맞춘다.
- 목록은 현재 deal 리디자인 shell과 어울리게 만든다.
- 목록에서 회사명 검색 / 분야 / 지역 필터 / 페이지네이션 / export / create action을 제공한다.
- 상세는 핵심 정보 카드, 연결 Contact 요약, 메모 로그, 개인 비밀 메모 로그 섹션을 가진다.
- 생성/수정은 모달 또는 panel form 방식으로 정리한다.

디자인 원칙:

- desktop/mobile은 레이아웃을 억지로 하나로 합치지 않는다.
- 공통 button, chip, state UI는 재사용하되 company 화면의 정보 우선순위는 별도로 맞춘다.
- decorative card보다 업무 데이터 스캔 속도를 우선한다.

### 4단계. 화면별 필수 요구사항

#### 회사 목록

- 검색 input
- 회사 분야 필터
- 회사 지역 필터
- 20개 단위 페이지네이션
- 회사 생성 버튼
- xlsx export 버튼
- 목록 row/card에 회사 이름, 회사 분야, 회사 지역, 거래처 수, 등록일 표시

표시 금지:

- 최근 수정일
- 딜 수

#### 회사 생성

- 필수: `companyName`, `companyFieldId`, `companyRegionId`
- 선택: `companyMemo`
- `companyMemo` copy는 "첫 회사 메모로 저장"이라는 의미가 드러나야 함

#### 회사 상세

- 회사명
- 회사분야
- 회사지역
- 등록일
- 최근수정일
- 연결 Contact 요약
- 메모 로그 섹션
- 개인 비밀 메모 섹션

표시 금지:

- 딜 수

### 5단계. 상태 UI 요구사항

각 화면에는 최소 아래 상태가 있어야 한다.

- loading
- empty
- error
- mutation pending
- mutation success feedback

구현 원칙:

- 기존 deal 리디자인 state UI와 톤을 맞춘다.
- 회사 목록 empty 상태는 "아직 등록된 회사가 없음"과 "검색/필터 결과 없음"을 구분한다.
- 메모 로그 empty 상태와 private memo empty 상태를 별도로 보여줄 수 있어야 한다.

### 6단계. 문서 업데이트

구현 후 반드시 아래 문서를 갱신한다.

- `UX Design/PEN_UI_04_IMPLEMENTATION_LOG.md`
- 필요 시 `UX Design/PEN_UI_01_FRONTEND_PLAN.md`
- 필요 시 `UX Design/PEN_UI_02_BACKEND_IMPACT.md`
- 필요 시 `UX Design/PEN_UI_05_API_CHANGE_TRACKER.md`
- `TODO/COMPANY_DOMAIN_PLAN/FE-TODO/README.md`

로그에 남길 것:

- 작업 일시
- 구현한 화면
- 변경한 주요 파일
- 재사용한 API/로직
- 남은 이슈
- 다음 작업

### 7단계. 검증 순서

아래 순서로 검증한다.

1. `pnpm --dir FE/user-web typecheck`
2. `pnpm --dir FE/user-web lint`
3. `pnpm --dir FE/user-web build`
4. 가능하면 회사 목록/상세/생성/메모 흐름 수동 확인

검증 중 기록할 것:

- 실패 명령
- 실패 원인
- 해결 여부
- 해결하지 못한 경우 남은 리스크

### 8단계. 커밋 전 체크

커밋 전에 아래를 다시 확인한다.

- 범위가 company FE를 넘어 퍼지지 않았는지
- 불필요한 auth 수정이 섞이지 않았는지
- TODO 문서와 구현 내용이 어긋나지 않는지
- 문서 업데이트가 빠지지 않았는지
- typecheck/lint/build 결과를 기록했는지

## 범위 밖

- Backend API 구현 또는 수정
- 관리자 페이지
- 회사 휴지통
- 회사 삭제
- 회사 분야/지역 수정
- 딜 수 표시
- 회사 단건 응답 shape 변경
