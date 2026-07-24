# G04 AI Report User Web Work Log

## Scope

- `/app/schedules/week` 화면에 AI 주간 영업 리포트 섹션을 추가했다.
- G03의 `/api/sales-reports/weekly` 계열 API 계약에 맞춰 User Web feature 계층을 추가했다.
- 기존 주간 일정 리포트와 Excel 다운로드 흐름은 유지했다.
- 05-B 이메일/SMS 실제 발송 기능은 노출하지 않았다.

## Implemented

- `FE/user-web/src/features/ai-weekly-report`
  - API client: 생성, 주간 요약 조회, 상세 조회, snapshot summary 조회
  - query keys: week/detail/snapshot-summary 분리
  - queries: 생성 중 report polling
  - mutation: 생성 성공 후 week query invalidation
  - schema: 생성 요청 입력 검증
  - UI: empty, generating, ready, failed, version history, failed history, snapshot summary panel
- `FE/user-web/src/features/schedule/components/schedule-week-report-screen.tsx`
  - 주간 일정 summary 아래에 `AiWeeklyReportSection` 렌더링
- `FE/user-web/tests/e2e/support/user-web-api-mocks.ts`
  - AI weekly report mock store와 4개 API endpoint 추가
  - READY/FAILED 기본 버전 fixture 추가
  - POST 중복 생성 409 mock 추가
  - snapshot summary는 count와 짧은 record summary만 반환

## UX Notes

- 최신 성공 버전을 기본 표시한다.
- 생성 중에는 중복 생성 버튼을 비활성화하고 polling 상태를 표시한다.
- 실패 버전은 삭제 없이 이력으로 남기고, 안전한 실패 메시지와 재생성 버튼만 제공한다.
- 제안 카드의 CTA는 관련 기록 열기만 제공하며 도메인 데이터를 자동 수정하지 않는다.
- follow-up draft payload는 화면에 발송 버튼으로 노출하지 않았다.
- mobile에서도 카드/list 기반으로 줄바꿈되도록 구성했다.

## Verification

- `cd FE/user-web && pnpm.cmd run typecheck` 통과
- `cd FE/user-web && pnpm.cmd run lint` 통과
- `cd FE/user-web && pnpm.cmd run build` 통과
- `cd FE/user-web && pnpm.cmd run test:e2e -- tests/e2e/weekly-schedule-report-ux.spec.ts` 통과

## Notes

- Vite build와 Playwright webServer에서 기존 Tailwind `duration-[500ms]` ambiguous warning이 표시되지만 이번 변경의 실패 요인은 아니다.
- production chunk size warning도 기존 bundle 경고로 확인했다.
