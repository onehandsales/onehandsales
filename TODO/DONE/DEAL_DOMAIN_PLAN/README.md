# Deal Domain Plan

## 1. 목적

이 계획은 User Web의 딜 목록/상세 화면과 Backend Deal API를 현재 프로젝트 구조에 맞게 새로 구현하기 위한 실행 문서다.

딜은 회사, 담당자, 제품을 연결해 영업 기회를 관리하는 핵심 도메인이다. 목록 화면은 가운데에 딜 목록을 보여주고, 선택한 딜의 상세 정보를 옆에서 바로 확인하는 split view를 기본으로 한다.

## 2. 현재 상태

- Backend에는 `deal` 모듈, Prisma `Deal`, `DealProduct`, `DealFollowingActionLog`, `DealMemoLog` 모델과 User API가 구현되어 있다.
- User Web 딜 목록/상세/생성/수정/로그/export 화면은 현재 Backend Deal API와 연결되어 있다.
- 딜 목록은 10개 단위 page-number pagination, 딜명 검색, 회사/담당자/상태 필터, 정렬 select를 사용한다.
- 딜 stage counts는 딜명 검색과 회사/담당자 필터를 반영한다.
- 본 계획의 Backend API 계약은 구현 검증을 거쳐 `implemented` 상태로 둔다.
- FE/BE goal은 모두 완료됐다.
- 완료 확인일: 2026-06-14
- 검증: `FE/user-web` typecheck/lint/build 통과

## 3. 범위

포함:

- Deal DB 모델 4개 추가
- Deal 상태 코드 enum을 코드 단에서 관리
- 딜 목록/단건/생성/수정/단계별 개수 API
- 회사/담당자/제품 선택 옵션 API
- 딜 xlsx export API
- 딜 다음 행동 로그 목록/생성/수정 API
- 딜 메모 로그 목록/생성/수정 API
- User Web 딜 목록 split view, 생성/수정, 로그 UI 연동

제외:

- Admin Deal API
- 딜 삭제, 휴지통, soft delete
- 일정, 회의록, 자동화와의 연동
- 딜 활동 타임라인 별도 모델
- DB enum 사용
- 금액 통화, 성공 확률, 예상 종료 시각

## 4. 문서 지도

- 공통 사용자 흐름: `COMMON/USER-FLOW.md`
- 작업 순서: `COMMON/GOAL-WORK-ORDER.md`
- 계획 검토 결과: `COMMON/PLANNING-REVIEW.md`
- API 요약: `COMMON/API-SPEC/DEAL_API.md`
- API 상세: `COMMON/API-SPEC/DEAL_API_DETAIL.md`
- BE goal 상세: `COMMON/GOAL-SPECS/G01-BE-DEAL-DOMAIN.md`
- FE goal 상세: `COMMON/GOAL-SPECS/G02-FE-DEAL-PAGES.md`
- BE 실행 문서: `BE-TODO/G01-BE-DEAL-DOMAIN.goal.md`
- FE 실행 문서: `FE-TODO/G02-FE-DEAL-PAGES.goal.md`

## 5. `/goal` 실행 순서

1. `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/GOAL-WORK-ORDER.md`를 읽는다.
2. 해당 goal의 `COMMON/GOAL-SPECS/*.md`를 읽는다.
3. API 구현 또는 연동이 있으면 `COMMON/API-SPEC/DEAL_API.md`와 `COMMON/API-SPEC/DEAL_API_DETAIL.md`를 읽는다.
4. Backend 작업은 `BE-TODO/G01-BE-DEAL-DOMAIN.goal.md`를 따른다.
5. Frontend 작업은 `FE-TODO/G02-FE-DEAL-PAGES.goal.md`를 따른다.

## 6. 완료 기준

- Backend Deal API가 명세대로 구현되고 테스트가 통과한다.
- User Web 딜 화면이 새 API 계약만 사용한다.
- 딜 목록, 상세, 생성, 수정, export, 다음 행동 로그, 메모 로그가 실제 Backend와 연결된다.
- 딜 상세와 생성/수정 form은 `products`/`productIds` 다중 제품 계약을 사용한다.
- export에는 id, 제품, 최근수정일이 포함되지 않는다.
- 완료 후 TODO_LOG에 작업 결과와 검증 결과를 남긴다.
