# FE 도메인 완료 현황

## 목적

이 문서는 현재 `BE`와 `FE/user-web` 코드 기준으로 도메인별 구현 상태를 추적한다.

작업자가 다음 FE/BE 작업을 고를 때 완료된 도메인, FE만 존재하는 도메인, Backend가 아직 없는 도메인을 혼동하지 않게 하는 기준 문서다.

## 최종 업데이트

- 날짜: 2026-07-03
- 기준:
  - Backend: `BE/src/modules`, `BE/prisma/schema.prisma`
  - User Web: `FE/user-web/src/features`, `FE/user-web/src/pages`
  - User Web Router: `FE/user-web/src/app/router/router.tsx`
  - UX 기준: `FE/user-web/src/components`, `FE/user-web/src/features/*/components`
  - 완료 계획: `TODO/DONE`

## 도메인별 BE x FE 현황

| 도메인 | BE 상태 | FE 상태 | 라우트 | 현재 판정 |
|---|---|---|---|---|
| Auth/User | 완료 | 완료 | `/login`, `/settings` | 완료 |
| Company | 완료 | 완료 | `/companies` | 완료 |
| Contact | 완료 | 완료 | `/contacts` | 완료 |
| Product | 완료 | 완료 | `/products` | 완료 |
| Home | 완료 API 조합 사용 | 완료 | `/` | 완료 |
| Deal | 완료 | 완료 | `/deals` | 완료 |
| Schedule | 완료 | 완료 | `/schedules`, `/schedules/week` | 기본 일정 완료. `/schedules/week`는 현재 `/schedules`로 redirect |
| MeetingNote | 완료 | 완료 | `/meeting-notes` | 완료 |
| BusinessCard OCR | 완료 | 완료 | `/business-cards`, `/contacts/scan` | 완료. `/contacts/scan`은 `/business-cards`로 redirect |
| Import | 완료 | 완료 | `/import`, `/import/:importUserLogId` | 완료. 회사/담당자/제품/딜 지원, 확정 전 job 영속화는 후속 |
| Export | Company/Contact/Product/Deal 도메인별 xlsx export 구현. 범용 ExportJob 없음 | 도메인별 다운로드 버튼 구현, 범용 `/export` page 존재 | `/companies`, `/contacts`, `/products`, `/deals`, `/export` | 도메인별 완료, 범용 화면 보류 |
| Notification | 현재 BE module 없음 | FE feature/page 존재 | `/notifications` | BE 재검토 필요 |
| Trash | 완료 | 완료 | `/trash` | 완료 |
| Search | 완료 | 완료 | GlobalSearch | 완료 |

## Backend 완료 도메인

현재 `BE/src/modules` 기준 완료된 업무 도메인은 다음이다.

- `auth`: 외부 인증 토큰 교환, App token, session, device
- `user`: 현재 사용자 profile, 등록 기기
- `company`: 회사, 분야/지역, 일반 메모, 개인 비밀 메모, xlsx export, 연결 목록
- `contact`: 담당자, 부서/직급, 일반 메모, 개인 비밀 메모, xlsx export, 연결 딜 목록
- `product`: 제품, 카테고리/상태, 일반 메모, 개인 비밀 메모, xlsx export, 연결 딜 목록
- `deal`: 딜, 딜-제품 연결, 다음 행동 로그, 메모 로그, xlsx export
- `schedule`: 일정, 월간/주간 조회, 일정-딜 연결, 생성/수정/삭제
- `meeting-note`: 수동 회의록 목록/상세/생성/수정, 회사/담당자 필터 옵션, 회사/담당자/제품/딜 snapshot 연결, AI/STT 초안 생성, 저장 후 딜 추가 연동
- `search`: 회사/담당자/제품/딜/일정/회의록 통합검색
- `business-card`: 명함 이미지 OCR, 성공/실패/확정 로그, 확인/수정 후 회사/담당자 저장
- `trash`: 회사/담당자/제품/딜/회의록과 지원 로그의 휴지통 목록/상세/7일 이내 복구
- `data-import`: 회사/담당자/제품/딜 양식 다운로드, CSV/XLSX 업로드, AI 매핑, 보정/검증, 확정 저장, 성공 내역 조회

## User Web 현재 UX/UI 기준

2026-06-22 기준 User Web의 핵심 UX는 다음 상태를 기준으로 한다.

- `/` 홈은 실제 대시보드 화면이다. Schedule, Deal, Deal stage count, MeetingNote API를 조합해 오늘 일정, 진행 딜, 마감 임박, 최근 회의록, 빠른 실행, 최근 활동을 표시한다.
- 딜 파이프라인은 `/deals`에서 운영한다.
- 좌측 사이드바에서 `/import`는 `데이터 업로드`로 노출한다. 범용 `Export`는 후순위/비정본 기능으로 숨김 처리한다. `휴지통`은 실제 삭제/복구 흐름이 있으므로 관리 섹션에 노출한다.
- 회사/담당자/제품/딜/회의록 목록 페이지네이션은 `hasNext`가 아니라 `totalPages`, `totalCount` 기준이다.
- 회사/담당자/제품/딜/회의록 목록은 10개 단위 page-number pagination을 기준으로 한다.
- `hasNext`는 회사/담당자/제품 상세의 메모 로그처럼 cursor/infinite loading 계약에서만 사용한다.
- 회사 목록 필터는 `useCompanyFields`, `useCompanyRegions` 전체 조회 결과를 `분야`, `지역` select 옵션으로 사용하고, select 안의 `+ 추가`로 회사 분류 관리 다이얼로그를 열 수 있다.
- 담당자 목록 필터는 `useContactDepartments`, `useContactJobGrades` 전체 조회 결과를 `부서`, `직급` select 옵션으로 사용하고, select 안의 `+ 추가`로 담당자 분류 관리 다이얼로그를 열 수 있다.
- 제품 목록 필터는 `useProductCategories`, `useProductStatuses` 전체 조회 결과를 `카테고리`, `판매 상태` select 옵션으로 사용하고, select 안의 `+ 추가`로 제품 분류 관리 다이얼로그를 열 수 있다.
- 회사 추가 모달의 `분야`, `지역`은 검색 입력형 선택 필드이며, 검색 결과가 없으면 입력값으로 바로 분류를 추가하고 자동 선택한다.
- 담당자 추가 모달의 `회사`는 검색 입력형 선택 필드이며, 검색 결과가 없으면 회사 생성 모달을 열고 생성 후 자동 선택한다. `부서`, `직급`도 검색 입력형 선택 + 즉시 추가를 사용한다.
- 제품 추가 모달의 `카테고리`, `상태`는 검색 입력형 선택 필드이며, 검색 결과가 없으면 입력값으로 바로 추가하고 자동 선택한다.
- 딜 목록 필터는 검색 다음에 `전체`, `회사`, `담당자`, 정렬 select 순서로 제공한다. 회사/담당자는 `GET /api/deals/company-options`, `GET /api/deals/contact-options`를 사용하며, 회사 선택 시 담당자 select는 같은 회사의 담당자로 좁힌다.
- 통합검색은 `GET /api/search`와 User Web `GlobalSearch`를 사용한다. 검색 대상은 회사/담당자/제품/딜/일정/회의록이며, 상단 검색 UI와 모바일 검색 UI에서 같은 API를 사용한다.
- MeetingNote는 수동 회의록 흐름과 AI/STT draft UI가 User Web에 연결되어 있다. `POST /api/meeting-notes/ai-draft`, `POST /api/meeting-notes/stt-draft`는 작성 화면의 보조 액션으로 사용한다.
- MeetingNote 작성 UX는 직접 작성 후 저장을 기본 흐름으로 유지한다. AI/STT는 같은 작성 화면에서 `AI로 정리`, `음성으로 작성`으로 field를 채우는 선택 보조 액션이며, 직접 저장 시 AI/STT API를 호출하지 않는다.
- MeetingNote 상세 화면은 `영업 딜과 연동` 카드에서 딜 검색/선택 후 `POST /api/meeting-notes/:meetingNoteId/deals`를 호출한다. 성공 시 회의록 상세와 해당 딜 상세/활동 로그 cache를 갱신한다.
- Company/Contact/Product/Deal 목록 export의 정본 액션명은 각 목록 맥락의 `엑셀 다운로드`다. 현재 FE icon action은 공통 tooltip/aria-label `엑셀 다운로드`를 쓰며, API는 현재 검색/필터/정렬을 반영한 도메인별 xlsx export를 호출한다.
- 범용 `/export` 화면과 `/api/exports` 계약은 현재 정본 흐름이 아니며, 신규 구현은 도메인별 xlsx export 기준을 따른다.
- 회사/담당자/제품/딜/회의록 목록은 조밀한 `Controls Bar + Table Card + Pagination` 문법으로 정렬되어 있다.
- 공용 `Pagination` 높이는 48px(`h-12`)이고, 딜/회사/담당자/회의록 미리보기 header와 목록 table header는 44px(`h-11`) 기준이다.
- 회사 목록 정렬 select: `최신순`, `담당자 높은순`, `담당자 낮은순`, `딜 높은순`, `딜 낮은순`.
- 담당자 목록 정렬 select: `최신순`, `이름순`.
- 제품 목록 정렬 select: `최신순`, `딜 높은순`, `딜 낮은순`.
- 딜 목록 정렬 select: `최신순`, `금액 높은순`, `금액 낮은 순`, `마감일순`.

## Schedule 완료 기준

Schedule 도메인은 2026-06-14 기준 `TODO/DONE/SCHEDULE_DOMAIN_PLAN`으로 완료 보관됐다.

Backend:

- Prisma `Schedule`, `ScheduleDeal` 모델과 migration 추가
- `GET /api/schedules/deal-options`
- `GET /api/schedules`
- `GET /api/schedules/:scheduleId`
- `POST /api/schedules`
- `PATCH /api/schedules/:scheduleId`
- `DELETE /api/schedules/:scheduleId`
- `dealIds` 중복 validation
- `ScheduleDeal` unique 제약
- hard delete
- timezone 기준 month/week range 계산

Frontend:

- `/schedules` 일정 목록/캘린더 조회
- `/schedules/week`는 현재 `/schedules`로 redirect. 별도 주간 보고서 화면은 후속
- 일정 생성/수정/삭제 modal
- `GET /api/schedules/deal-options` 기반 딜 다중 선택
- `dealIds` 중복 선택 차단
- local date-time + IANA `timeZone` 전송
- Backend UTC ISO string을 화면 timezone으로 표시

검증:

- BE `typecheck`, `lint`, `test`, `build` 통과
- FE `typecheck`, `lint`, `build` 통과
- 상세 로그:
  - `TODO_LOG/2026-06-14/G01_BE_SCHEDULE_DOMAIN/WORK_LOG.md`
  - `TODO_LOG/2026-06-14/G02_FE_SCHEDULE_PAGES/WORK_LOG.md`

## 다음 작업 판단

1. Backend module이 없는 FE feature는 실제 API 계약과 구현 여부를 먼저 재검토한다. 현재 대표 항목은 Notification, Admin 운영 조회다.
2. 완료된 계획은 `TODO/DONE/<PLAN_NAME>`에서 참고하되, 후속 요구사항은 새 활성 `TODO/<PLAN_NAME>`으로 작성한다.
3. Schedule 후속 범위는 별도 계획으로 분리한다.
   - 일정 알림
   - 반복 일정
   - Google Calendar 연동
   - 일정 휴지통/복구
   - 딜 상세에서 일정 생성 또는 연결 UX
