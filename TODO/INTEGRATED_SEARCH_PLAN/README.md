# Integrated Search Plan

## 1. 목적

User Web 상단 통합검색에서 회사, 담당자, 제품, 딜, 일정, 회의록을 한 번에 찾고, 선택한 결과의 상세 화면으로 이동할 수 있게 한다.

## 2. 현재 구현 상태

상태 기준일: 2026-06-18

- Backend: `GET /api/search` 구현 완료.
- Backend: `SearchModule`을 `AppModule`에 등록 완료.
- Backend: 검색 대상 `COMPANY`, `CONTACT`, `PRODUCT`, `DEAL`, `SCHEDULE`, `MEETING_NOTE` 지원.
- Backend: `q`, `types`, `limit` query validation과 `userId` ownership 필터 적용.
- Frontend: User Web `features/search`와 상단 검색 UI는 존재한다.
- Frontend: 일정 검색 결과 이동을 위해 `/schedules/:scheduleId` route와 schedule detail 화면은 추가되어 있다.
- Frontend: 상단 통합검색의 최종 API 연결, 결과 선택 end-to-end 동작, loading/empty/error UX 검수는 아직 완료로 보지 않는다.

## 3. 범위

포함:

- `GET /api/search` User API
- 도메인별 grouped response
- `title`, `subtitle`, `targetId`, `targetPath`
- Search API contract
- Backend Clean Architecture 계층 분리
- User Web API client와 상단 검색 UI 최종 연결/검수

제외:

- 전용 `/search` 페이지
- Admin 통합검색 API
- full-text index 또는 별도 search engine
- 최근 검색어/인기 검색어 저장
- 검색어 원문 DB 저장
- cross-user 검색

## 4. Goal 상태

- `G01-BE-INTEGRATED-SEARCH`: completed
- `G02-FE-INTEGRATED-SEARCH`: in_progress

## 5. 검증 기준

- `GET /api/search`가 인증된 사용자에서 200 응답을 반환한다.
- 두 글자 이상 입력 시 User Web이 통합검색 API를 호출한다.
- 회사/담당자/제품/딜/일정/회의록 결과가 기존 상세 화면으로 이동한다.
- loading, empty, error 상태가 실제 UI에서 자연스럽게 표시된다.
- Search query raw text를 structured log에 남기지 않는다.

## 6. 관련 문서

- `TODO/INTEGRATED_SEARCH_PLAN/COMMON/API-SPEC/SEARCH_API.md`
- `TODO/INTEGRATED_SEARCH_PLAN/BE-TODO/G01-BE-INTEGRATED-SEARCH.goal.md`
- `TODO/INTEGRATED_SEARCH_PLAN/FE-TODO/G02-FE-INTEGRATED-SEARCH.goal.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
