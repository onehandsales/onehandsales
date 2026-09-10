# G05 QA Review Closeout Work Log

> 2026-09-11 문서 정리: 현재 BE/FE 기준과 충돌하는 과거 모델/API/페이지/부수 기록 언급은 제거했다.

날짜: 2026-07-23
상태: Done
대상 goal: `COMMON/GOAL-SPECS/G05_QA_REVIEW_CLOSEOUT.md`

## 검토 요약

- `COMMON/API-SPEC/GOOGLE_CALENDAR_INTEGRATION_API.md`, `COMMON/REVIEW-CHECKLIST.md`, G01~G04 완료 결과를 기준으로 Backend/Frontend/Security/Privacy QA를 대조했다.
- 상위 roadmap과 04 README/Planning Review/Goal Completion Checklist 상태를 구현 결과와 맞췄다.

## G05 중 보정

  - `Schedule time` -> `일정 시간`
  - `Location` -> `장소`
  - `Linked deals` -> `연결 딜`
- Schedule soft delete 관련 stale code comment를 실제 동작에 맞게 정리했다.

## 검증

Backend:

- `pnpm.cmd run prisma:validate`: 통과
- `pnpm.cmd run typecheck`: 통과
- `pnpm.cmd run lint`: 통과
- `pnpm.cmd run test -- schedule`: 통과
- `pnpm.cmd run test -- notification`: 통과
- `pnpm.cmd run test -- ownership`: 통과
- `pnpm.cmd run build`: 통과

Frontend:

- `pnpm.cmd run typecheck`: 통과
- `pnpm.cmd run lint`: 통과
- `pnpm.cmd run build`: 통과
- `pnpm.cmd exec playwright test tests/e2e/google-calendar-ux.spec.ts --project=chromium`: 통과
- `pnpm.cmd exec playwright test tests/e2e/weekly-schedule-report-ux.spec.ts --project=chromium`: 통과

## 참고

- G04 Playwright를 build/다른 Playwright와 병렬 실행했을 때 dev server 대기 중 1회 timeout이 있었고, 단독 재실행은 3/3 통과했다.
- FE build의 Tailwind `duration-[500ms]` ambiguous class 경고와 Vite chunk size 경고는 기존 경고이며 G05 blocker가 아니다.
- 2026-07-23 G05 closeout 당시 실제 Google provider smoke는 env 미준비로 미실행했다.
- 2026-08-04 사용자 확인 기준 실제 배포 환경 Google provider smoke QA가 완료됐다.
  - OAuth connect/callback redirect
  - calendar list/selection
  - manual sync/import
  - Google-origin schedule 표시
