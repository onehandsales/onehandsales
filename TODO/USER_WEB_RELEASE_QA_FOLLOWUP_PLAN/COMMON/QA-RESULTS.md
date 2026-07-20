# Release QA Follow-up QA Results

## 1. 목적

이 문서는 각 `/goal` 실행 결과와 검증 명령 결과를 누적 기록한다.

## 2. 기록 규칙

- 실제 비밀값, access token, refresh token, service role key, 개인정보 원문은 기록하지 않는다.
- 자동화 실패는 `환경 문제`, `테스트 결함`, `제품 bug` 중 하나로 분류한다.
- 수동 확인은 브라우저, viewport, route, 기대 결과, 실제 결과를 함께 적는다.
- S0/S1/S2는 반드시 `ISSUE-LOG.md` 항목과 연결한다.

## 3. Goal 결과

### G01 QA Env And Doc Closeout

- 상태: Done
- 실행일: 2026-07-20
- 명령:
  - `cd FE/user-web; pnpm exec playwright install chromium`: 통과
  - `cd FE/user-web; pnpm run typecheck`: 통과
  - `cd FE/user-web; pnpm run lint`: 통과
  - `cd FE/user-web; pnpm run build`: 통과
  - `cd FE/user-web; pnpm run test:e2e`: 통과, 2 passed
  - `git diff --check`: 통과
- 결과: Playwright Chromium binary 누락은 해소됐다. 기본 e2e 재실행 중 발견된 기존 smoke selector와 접근성 이름 계약 불일치를 수정했고, 최종 `test:e2e`는 Google provider popup smoke와 로그인부터 회의록 저장까지 핵심 업무 흐름 2건 모두 통과했다.
- 비고: `build`와 `test:e2e` webServer 출력에 기존 Tailwind `duration-[500ms]` ambiguity 경고와 큰 chunk 경고가 남아 있다. G01 release gate 실패 요인은 아니다.
- 연결 이슈: `RQA-001`, `RQA-006`, `RQA-007`

### G02 Mobile Browser 390/360 QA

- 상태: Done
- 실행일: 2026-07-20
- 확인 viewport:
  - Chrome 390px: 통과, `mobile-chrome-390`
  - Chrome 360px: 통과, `mobile-chrome-360`
  - Edge 390px: 통과, `mobile-edge-390`
  - Edge 360px: 통과, `mobile-edge-360`
- 명령:
  - `cd FE/user-web; pnpm.cmd run typecheck`: 통과
  - `cd FE/user-web; pnpm.cmd run lint`: 통과
  - `cd FE/user-web; pnpm.cmd run build`: 통과
  - `cd FE/user-web; pnpm.cmd run test:e2e`: 통과, 2 passed
  - `cd FE/user-web; pnpm.cmd run test:e2e:mobile`: 통과, 12 passed
  - `git diff --check`: 통과
- 자동 확인:
  - 보호 route 미인증 접근은 `/login`으로 redirect되고 private API 호출이 발생하지 않았다.
  - 인증 mock session으로 `/app`, `/app/companies`, `/app/contacts`, `/app/products`, `/app/deals`, `/app/schedules`, `/app/meeting-notes`, `/app/business-cards`, `/app/import`, `/app/trash`, `/app/settings`, `/app/more`를 순회했다.
  - 모바일 header, bottom navigation, 더보기 진입, deal stage label, long company/email/phone/URL fixture, page-level horizontal overflow, console/page error를 확인했다.
  - 회사 생성 panel/dialog, 분야/지역 dropdown, 저장 버튼 keyboard focus, 성공 toast/dialog가 390px/360px viewport 안에서 동작했다.
- 수동 확인 대체 근거:
  - 360px bottom nav label overlap은 자동 bounding-box 검사로 통과했다.
  - deal stage tab 존재와 문서 가로 overflow 없음은 자동 route smoke에서 통과했다.
  - schedule 화면은 360px/390px에서 route load, 내부 calendar horizontal scroll containment, page-level overflow 없음이 통과했다.
  - meeting note/import/trash는 long fixture route smoke와 page-level overflow 없음이 통과했다.
- 결과: Chrome/Edge channel이 모두 사용 가능했고, 390px/360px 모바일 브라우저 자동 QA에서 S0/S1/S2 제품 이슈는 발견되지 않았다. 기본 `test:e2e`는 release 모바일 spec을 제외하도록 유지했고, 새 QA는 `test:e2e:mobile`에서만 실행된다.
- 비고: `build`, `test:e2e`, `test:e2e:mobile` webServer 출력에 기존 Tailwind `duration-[500ms]` ambiguity 경고와 큰 chunk 경고가 남아 있다. G02 release gate 실패 요인은 아니다.
- 연결 이슈: `RQA-002`

### G03 Chrome/Edge Compat QA

- 상태: Done
- 실행일: 2026-07-20
- 확인 브라우저:
  - Chrome: 통과, `desktop-chrome`, 로컬 Chrome `150.0.7871.127`
  - Edge: 통과, `desktop-edge`, 로컬 Edge `150.0.4078.83`
- 명령:
  - `cd FE/user-web; pnpm.cmd run typecheck`: 통과
  - `cd FE/user-web; pnpm.cmd run lint`: 통과
  - `cd FE/user-web; pnpm.cmd run build`: 통과
  - `cd FE/user-web; pnpm.cmd run test:e2e`: 통과, 7 passed
  - `cd FE/user-web; pnpm.cmd run test:e2e:browsers`: 통과, 10 passed
  - `cd FE/user-web; pnpm.cmd run test:e2e:mobile`: 통과, 12 passed, release config 회귀 확인
  - `git diff --check`: 통과
- 자동 확인:
  - 미인증 보호 route 접근은 `/login`으로 redirect되고, 로그인 진입 smoke는 Chrome/Edge에서 동일하게 통과했다.
  - 인증 mock session으로 회사/담당자/제품/딜/일정/회의록 생성 smoke가 통과했다.
  - `/app/deals` reload 후 route 상태와 핵심 데이터가 유지됐다.
  - 회사 route와 딜 route 사이의 browser back/forward 상태가 유지됐다.
  - 두 탭이 같은 mock store를 공유한 상태에서 회사명을 수정하고 다른 탭 reload 후 같은 최신 데이터가 보였다.
  - API delay mock 중 회사 목록 loading skeleton이 노출되고 응답 후 데이터가 정상 표시됐다.
  - `page.on("console")`, `page.on("pageerror")` 수집 기준에서 예상하지 않은 error는 발생하지 않았다.
- 결과: Chrome/Edge channel이 모두 사용 가능했고, desktop 1440x1000 브라우저 호환 QA에서 S0/S1/S2 제품 이슈는 발견되지 않았다. 새 QA는 `test:e2e:browsers`로 Chrome/Edge 양쪽에서 실행된다.
- 비고: `build`, `test:e2e`, `test:e2e:browsers`, `test:e2e:mobile` webServer 출력에 기존 Tailwind `duration-[500ms]` ambiguity 경고와 큰 chunk 경고가 남아 있다. G03 release gate 실패 요인은 아니다.
- 연결 이슈: `RQA-003`

### G04 Multi Account Security QA

- 상태: Not started
- 실행일:
- 확인 범위:
  - Search:
  - Trash:
  - Export:
  - 직접 API 접근:
  - Admin API 차단:
- 결과:
- 연결 이슈: `RQA-004`

### G05 DB/Prisma/Migration Ops QA

- 상태: Not started
- 실행일:
- 확인 범위:
  - DB 대상 분류:
  - Prisma validate:
  - Prisma generate:
  - Migration status:
  - Seed 정책:
- 결과:
- 연결 이슈: `RQA-005`

### G06 S0/S1/S2 Bugfix Closeout

- 상태: Not started
- 실행일:
- 수정한 이슈:
- 검증:
- 남은 리스크:

### G07 Deferred BE/API Backlog Split

- 상태: Not started
- 실행일:
- 분리한 후보:
- 다음 계획 후보:
