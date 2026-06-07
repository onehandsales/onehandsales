# G35 Admin Web Smoke E2E 작업 로그

## 목표

- Admin Web의 운영 안전 흐름을 Playwright smoke E2E로 보호한다.
- Admin 로그인, non-admin 접근 차단, 사용자 목록, 전체 딜 목록, 민감정보 masking, 원문 조회 사유 입력, 감사 로그 생성을 검증한다.

## 참고 문서

- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P6-G33-G36-TEST-RELEASE.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/FE-TODO/ADMIN-WEB-TODO.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/TESTING.md`

## 구현 내용

- Admin Web에 memory 기반 mock admin/non-admin login과 protected role guard를 추가한다.
- Admin API client가 memory App access token을 Authorization header로 전달할 수 있게 확장한다.
- Admin Web 전용 Playwright 설정과 smoke E2E를 추가한다.
- Playwright route mock으로 dashboard, users, deals, sensitive raw, audit logs API를 fixture 처리한다.

## 검토 메모

- App access token은 storage에 저장하지 않고 memory에만 둔다.
- 실제 Supabase provider login과 seed DB는 G35 smoke 범위에서 제외하고 fixture로 admin/non-admin 계정을 분리한다.
- 민감 원문은 사유 10자 이상 입력 전에는 조회 버튼이 비활성화되며, 조회 성공 시 mock AuditLog가 생성된다.
- Playwright route mock은 Vite module 요청과 충돌하지 않도록 실제 Admin API path인 `/admin/api/` prefix만 intercept한다.
- smoke는 raw amount가 console log에 남지 않는지도 확인한다.

## 검증 결과

- `cd FE/admin-web && pnpm run typecheck` 통과
- `cd FE/admin-web && pnpm run lint` 통과
- `cd FE/admin-web && pnpm run build` 통과
- `cd FE/admin-web && pnpm exec playwright test tests/e2e/admin-web-smoke.spec.ts` 통과
- `cd FE/admin-web && pnpm run test:e2e` 통과

## 완료 감사

- 작업 일자: 2026-06-07
- 관련 계획과 goal: G35 연속 작업 범위
- 관련 AGENT/TODO 문서: 위 `기준 문서` 또는 `참고 문서` 섹션 기준
- 예정 범위: 위 `요구사항 체크`, `목표`, `구현 내용` 섹션 기준
- 진행 기록: 위 `작업 로그` 또는 `구현 내용` 섹션 기준
- 적용 범위 또는 변경 파일: 해당 goal 커밋 diff와 위 구현 기록 기준
- 검증 결과: 위 `검증` 또는 `검증 결과` 섹션 기준
- 검토 결과: 위 `검토` 또는 `검토 메모` 섹션 기준
- 남은 리스크 또는 보류 사항: 위 `제외 범위`, `참고`, `검토 메모`에 명시된 항목 외 신규 보류 없음
- 다음 권장 작업: G16-G36 연속 작업 순서에 따라 다음 goal로 진행했고, G36 이후에는 다음 계획 폴더로 넘길 보류 항목을 `COMMON/PLANNING-REVIEW.md`에 유지
- 전체 작업 진행 현황: G16-G36 21개 goal 구현, 검토, 검증, TODO_LOG 기록, git commit 완료
