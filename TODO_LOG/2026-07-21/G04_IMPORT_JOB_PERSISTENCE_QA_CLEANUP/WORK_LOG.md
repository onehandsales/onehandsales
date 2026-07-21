# G04 Import Job Persistence QA Cleanup Work Log

## Summary

- Goal: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE/COMMON/GOAL-SPECS/G04_QA_CLEANUP.md`
- Date: 2026-07-21
- Result: Done

## Scope

- Closed the G01-G03 import persistence QA pass.
- Tightened backend coverage for ownership, storage delete failure, and raw row log redaction.
- Tightened user-web import review behavior and E2E coverage for resume, upload, map, row save, confirm, cancel, terminal states, and missing job handling.
- Checked API/DB/FE documents for contract drift; no doc contract update was needed.

## Changes

- `BE/src/modules/data-import/application/services/data-import-application.service.spec.ts`
  - Added coverage for cross-user job access returning not found.
  - Added coverage that confirm success survives uploaded file delete failure and records a warning `ImportJobError`.
  - Added coverage that confirm logging does not include raw row email/phone values.
- `FE/user-web/src/features/import-export/components/import-review-screen.tsx`
  - Synchronized draft rows immediately after row-save mutation response.
  - Added stable E2E hooks for cancel, new-file, and primary action kind.
- `FE/user-web/tests/e2e/import-resume-ux.spec.ts`
  - Expanded import persistence E2E coverage for resume/save, confirm success navigation, reload resume, cancel, expired/failed terminal states, cross-user 404 redirect, and upload-to-map.
- `FE/user-web/tests/e2e/support/user-web-api-mocks.ts`
  - Made import job mock routes return real 404 responses for missing jobs.
  - Made row patch and map responses recalculate job summary consistently.
  - Fixed confirm mock response handling so it returns `importUserLogId` instead of the job detail body.

## QA Coverage

- Upload -> map: covered by `import-resume-ux.spec.ts`.
- Row edit -> save -> post-save state: covered by `import-resume-ux.spec.ts`.
- Confirm -> import user log detail route: covered by `import-resume-ux.spec.ts`.
- Refresh/resume: covered by `import-resume-ux.spec.ts`.
- Cancel -> active list removal: covered by `import-resume-ux.spec.ts`.
- Expired/failed terminal states: covered by `import-resume-ux.spec.ts`.
- Other user or missing job 404 handling: covered by backend service spec and user-web E2E mock route.
- Storage delete failure after confirm: covered by backend service spec.
- Log redaction for raw row email/phone: covered by backend service spec.

## Verification

- `cd BE; pnpm.cmd run prisma:validate`: passed.
- `cd BE; pnpm.cmd run typecheck`: passed.
- `cd BE; pnpm.cmd run lint`: passed.
- `cd BE; pnpm.cmd run test -- data-import`: passed, 5 suites / 40 tests.
- `cd BE; pnpm.cmd run build`: passed.
- `cd FE/user-web; pnpm.cmd run typecheck`: passed.
- `cd FE/user-web; pnpm.cmd run lint`: passed.
- `cd FE/user-web; pnpm.cmd run build`: passed with existing Tailwind class ambiguity and chunk size warnings.
- `cd FE/user-web; pnpm.cmd exec playwright test tests/e2e/import-resume-ux.spec.ts --reporter=list`: passed, 8 tests.
- `cd FE/user-web; pnpm.cmd run test:e2e`: passed, 16 tests.

## Remaining Risk

- No unresolved G04 blocker found.
- The build still emits the existing `duration-[500ms]` Tailwind ambiguity warning and large chunk warning; both are outside this import persistence cleanup scope.
- Live Supabase manual QA was not run in this commit; the covered scenarios were verified with service tests and Playwright route-mocked E2E.
