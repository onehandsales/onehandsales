# FE 도메인 완료 현황

## 목적

이 문서는 현재 `BE`와 `FE/user-web` 코드 기준으로 도메인별 구현 상태를 추적한다.

작업자가 다음 FE/BE 작업을 고를 때 완료된 도메인, FE만 존재하는 도메인, Backend가 아직 없는 도메인을 혼동하지 않게 하는 기준 문서다.

## 최종 업데이트

- 날짜: 2026-06-14
- 기준:
  - Backend: `BE/src/modules`, `BE/prisma/schema.prisma`
  - User Web: `FE/user-web/src/features`, `FE/user-web/src/pages`
  - 완료 계획: `TODO/DONE`

## 도메인별 BE x FE 현황

| 도메인 | BE 상태 | FE 상태 | 라우트 | 현재 판정 |
|---|---|---|---|---|
| Auth/User | 완료 | 완료 | `/login`, `/settings` | 완료 |
| Company | 완료 | 완료 | `/companies` | 완료 |
| Contact | 완료 | 완료 | `/contacts` | 완료 |
| Product | 완료 | 완료 | `/products` | 완료 |
| Deal | 완료 | 완료 | `/`, `/deals` | 완료 |
| Schedule | 완료 | 완료 | `/schedules`, `/schedules/week` | 완료 |
| MeetingNote | 현재 BE module 없음 | FE feature/page 존재 | `/meeting-notes` | BE 재검토 필요 |
| BusinessCard OCR | 현재 BE module 없음 | FE feature/page 존재 | `/business-cards` | BE 재검토 필요 |
| Import/Export | 현재 BE module 없음 | FE feature/page 존재 | `/import`, `/export` | BE 재검토 필요 |
| Notification | 현재 BE module 없음 | FE feature/page 존재 | `/notifications` | BE 재검토 필요 |
| Trash | 현재 BE module 없음 | FE feature/page 존재 | `/trash` | BE 재검토 필요 |
| Search | 현재 BE module 없음 | FE feature 존재 | GlobalSearch | BE 재검토 필요 |
| Tag | 현재 BE module 없음 | FE feature 존재 | 없음 | 후속 계획 필요 |

## Backend 완료 도메인

현재 `BE/src/modules` 기준 완료된 업무 도메인은 다음이다.

- `auth`: 외부 인증 토큰 교환, App token, session, device
- `user`: 현재 사용자 profile, 등록 기기
- `company`: 회사, 분야/지역, 일반 메모, 개인 비밀 메모, xlsx export, 연결 목록
- `contact`: 거래처, 부서/직급, 일반 메모, 개인 비밀 메모, xlsx export, 연결 딜 목록
- `product`: 제품, 카테고리/상태, 일반 메모, 개인 비밀 메모, xlsx export, 연결 딜 목록
- `deal`: 딜, 딜-제품 연결, 다음 행동 로그, 메모 로그, xlsx export
- `schedule`: 일정, 월간/주간 조회, 일정-딜 연결, 생성/수정/삭제

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

- `/schedules` 월간/주간 캘린더 조회
- `/schedules/week` 주간 보고서 조회
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

1. Backend module이 없는 FE feature는 실제 API 계약과 구현 여부를 먼저 재검토한다.
2. 완료된 계획은 `TODO/DONE/<PLAN_NAME>`에서 참고하되, 후속 요구사항은 새 활성 `TODO/<PLAN_NAME>`으로 작성한다.
3. Schedule 후속 범위는 별도 계획으로 분리한다.
   - 일정 알림
   - 반복 일정
   - Google Calendar 연동
   - 일정 휴지통/복구
   - 딜 상세에서 일정 생성 또는 연결 UX
