# G02 FE Schedule Pages Work Log

## 작업명

User Web 일정 월간/주간 화면 Backend Schedule API 연동

## 작업 일자

2026-06-14

## 관련 계획

- `TODO/DONE/SCHEDULE_DOMAIN_PLAN`
- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/FE-TODO/G02-FE-SCHEDULE-PAGES.goal.md`
- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/COMMON/API-SPEC/SCHEDULE_API.md`

## 적용 범위

- Schedule API client/type/query key/query hook/mutation hook을 새 계약으로 교체
- `/api/schedules/deal-options` 기반 딜 옵션 조회 적용
- `/api/schedules?view=month|week&baseDate=YYYY-MM-DD&timeZone=...` 기반 월간/주간 조회 적용
- 생성/수정 body를 `scheduleTitle`, `startAt`, `endAt`, `timeZone`, `location`, `memo`, `dealIds`로 정리
- 삭제 성공 `204 No Content` 처리
- 일정 생성/수정 modal에서 딜 다중 선택과 중복 선택 차단 구현
- Backend UTC ISO string을 화면 timezone 기준으로 표시
- stale 필드 제거
  - `allDay`
  - `source`
  - `reminderMinutes`
  - `companyId`
  - `contactId`
  - `/api/schedules/week`
  - 딜 도메인 목록 API 재사용

## 주요 변경 파일

- `FE/user-web/src/features/schedule/types/schedule.ts`
- `FE/user-web/src/features/schedule/api/schedule-api.ts`
- `FE/user-web/src/features/schedule/api/schedule-query-keys.ts`
- `FE/user-web/src/features/schedule/hooks/use-schedule-queries.ts`
- `FE/user-web/src/features/schedule/hooks/use-schedule-mutations.ts`
- `FE/user-web/src/features/schedule/hooks/use-schedule-entity-options.ts`
- `FE/user-web/src/features/schedule/schemas/schedule-schema.ts`
- `FE/user-web/src/features/schedule/components/schedule-form-dialog.tsx`
- `FE/user-web/src/features/schedule/components/schedule-screen.tsx`
- `FE/user-web/src/features/schedule/components/schedule-week-report-screen.tsx`
- `FE/user-web/src/features/schedule/index.ts`

## 검증 결과

- `pnpm --dir FE/user-web run typecheck`: 통과
- `pnpm --dir FE/user-web run lint`: 통과, 기존 `src/components/ui/toast.tsx` Fast Refresh warning 1건
- `pnpm --dir FE/user-web run build`: 통과, Vite chunk size warning 1건
- 일정 feature stale API 검색: `/api/schedules/week`, 딜 도메인 API 재사용, FE `toISOString()` 전송 없음 확인

## 검토 결과

통과.

## 남은 리스크

- 현재 실행 환경 Node가 `v22.21.1`이라 package `engines`의 `>=24 <25`와 맞지 않아 pnpm engine warning이 발생한다. 명령은 모두 성공했다.
- `src/components/ui/toast.tsx`의 Fast Refresh warning은 이번 Schedule 변경 범위 밖 기존 공통 UI warning이다.
- production build에서 Vite chunk size warning이 발생한다. 일정 기능 오류는 아니며, 후속으로 route-level code splitting을 검토할 수 있다.
- 브라우저에서 실제 로그인 후 API를 호출하는 E2E smoke test는 아직 실행하지 않았다.

## 다음 권장 작업

- Backend 개발 서버와 실제 DB migration 적용 후 `/schedules`, `/schedules/week`에서 생성/수정/삭제 smoke test를 실행한다.
