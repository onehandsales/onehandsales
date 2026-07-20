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

- 상태: Done
- 실행일: 2026-07-20
- 자동 테스트:
  - `BE/src/modules/security/ownership-isolation.spec.ts`: Company, Contact, Product, Deal, Schedule, MeetingNote, Search, Trash, AdminGuard ownership isolation 자동 검증
  - `FE/user-web/tests/e2e/security-boundary-qa.spec.ts`: session 제거 후 보호 route reload/back에서 사용자 데이터 미노출 smoke
- 확인 범위:
  - Search: 통과. 사용자 A 기준 `RQA004-B` 검색 결과 group/item 없음.
  - Trash: 통과. 목록/detail/restore에서 사용자 B 삭제 데이터와 marker 미노출.
  - Export: 통과. Company/Contact/Product/Deal export workbook input과 fake binary string 모두 `RQA004-B` 미포함.
  - 직접 API 접근: 통과. Company/Contact/Product/Deal/Schedule/MeetingNote detail/update/delete에서 사용자 B id를 사용자 A로 접근하면 NotFound 계열 error이며 B id/name/title/email 미노출. 기존 `HttpExceptionFilter`가 `*NotFound` DomainError를 HTTP 404로 매핑하는 것을 확인했다.
  - Admin API 차단: 통과. `AdminGuard`가 일반 `USER` role을 `ForbiddenException`으로 거부해 HTTP 403 경계를 검증.
  - User Web `/admin/api/*` 경계: 통과. `rg -n "admin/api" FE/user-web/src` 결과는 `src/lib/api-client.ts` 2건뿐이고, `apiClient`, `apiBlobClient`가 `/admin/api/` path를 `InvalidUserWebApiPath`로 차단.
  - 로그아웃/back smoke: 통과. session storage 제거 후 `/app/companies` reload와 browser back에서 `/login` 유지, 보호 데이터 미노출.
- endpoint 기대값 matrix:
  - Company list: Passed, A list/export response에 `RQA004-B` 미포함
  - Company detail: Passed, B id detail as A는 `CompanyNotFound`
  - Company export: Passed, workbook input과 binary string에 B marker 미포함
  - Company mutation: Passed, B id update/delete as A는 `CompanyNotFound`
  - Contact list: Passed, A list/export response에 `RQA004-B` 미포함
  - Contact detail: Passed, B id detail as A는 `ContactNotFound`
  - Contact export: Passed, workbook input과 binary string에 B marker 미포함
  - Contact mutation: Passed, B id update/delete as A는 `ContactNotFound`
  - Product list: Passed, A list/export response에 `RQA004-B` 미포함
  - Product detail: Passed, B id detail as A는 `ProductNotFound`
  - Product export: Passed, workbook input과 binary string에 B marker 미포함
  - Product mutation: Passed, B id update/delete as A는 `ProductNotFound`
  - Deal list/stage-counts: Passed, A list와 count에 B 데이터 미포함
  - Deal detail: Passed, B id detail as A는 `DealNotFound`
  - Deal export: Passed, workbook input과 binary string에 B marker 미포함
  - Deal mutation: Passed, B id update/delete as A는 `DealNotFound`
  - Schedule list: Passed, A list에 B 데이터 미포함
  - Schedule detail: Passed, B id detail as A는 `ScheduleNotFound`
  - Schedule mutation: Passed, B id update/delete as A는 `ScheduleNotFound`
  - MeetingNote list: Passed, A list에 B 데이터 미포함
  - MeetingNote detail: Passed, B id detail as A는 `MeetingNoteNotFound`
  - MeetingNote mutation: Passed, B id update/delete as A는 `MeetingNoteNotFound`
  - Search: Passed, `RQA004-B` 검색 as A 결과 없음
  - Trash list: Passed, A trash list에 B 삭제 데이터 미포함
  - Trash detail: Passed, B target detail as A는 `NotFoundException`
  - Trash restore: Passed, B target restore as A는 `NotFoundException`
  - Admin boundary: Passed, normal USER role은 `ForbiddenException`
- 조건부 HTTP smoke:
  - 상태: Blocked
  - 이유: `BE/.env`의 `DATABASE_URL`이 없어 로컬 dev/test DB 안전 조건을 증명할 수 없다. G04 명세 5D에 따라 실제 HTTP smoke는 실행하지 않고 BE Jest 자동 테스트를 release QA 증거로 남긴다.
- 명령:
  - `rg -n "admin/api" FE/user-web/src`: 통과, `src/lib/api-client.ts` 2건만 발견
  - `rg -n "InvalidUserWebApiPath|apiBlobClient|apiClient" FE/user-web/src/lib/api-client.ts`: 통과
  - `Get-Content BE/src/shared/presentation/filters/http-exception.filter.ts`: 확인, `code.endsWith("NotFound")`는 `HttpStatus.NOT_FOUND`
  - `cd BE; pnpm.cmd run typecheck`: 통과
  - `cd BE; pnpm.cmd run lint`: 통과
  - `cd BE; pnpm.cmd run test`: 통과, 19 suites / 98 tests passed
  - `cd BE; pnpm.cmd run build`: 통과
  - `cd FE/user-web; pnpm.cmd run typecheck`: 통과
  - `cd FE/user-web; pnpm.cmd run lint`: 통과
  - `cd FE/user-web; pnpm.cmd run build`: 통과
  - `cd FE/user-web; pnpm.cmd run test:e2e`: 통과, 8 passed
  - `git diff --check`: 통과
- 결과: 자동화 범위에서 사용자 B 데이터 노출 후보는 발견되지 않았다. `RQA-004`는 Fixed로 닫는다.
- 비고: FE build와 e2e webServer 출력에 기존 Tailwind `duration-[500ms]` ambiguity 경고와 큰 chunk 경고가 남아 있다. G04 release gate 실패 요인은 아니다.
- 연결 이슈: `RQA-004`

### G05 DB/Prisma/Migration Ops QA

- 상태: Done
- 실행일: 2026-07-20
- 환경:
  - `node -v`: 통과, `v24.18.0`
  - `pnpm.cmd -v`: 통과, `8.14.1`
  - `docker --version`: 통과, Docker CLI `29.5.3`
  - `cd BE; docker compose ps`: 실패, Docker Desktop Linux engine/daemon 미실행
  - `cd BE; pnpm.cmd db:dev:up`: 실패, Docker daemon 미실행으로 local Postgres 시작 불가
- 확인 범위:
  - DB 대상 분류: Blocked. `BE/.env` 파일은 존재하지만 active key 목록 기준 `DATABASE_URL`, `DIRECT_URL`, `TEST_DATABASE_URL`이 없다. 다만 Prisma CLI `migrate status`는 `.env`에서 cloud Supabase pooler 성격의 datasource를 해석했고 database는 `postgres`로 표시했다. 따라서 현재 DB 대상은 로컬 dev DB로 볼 수 없고 공유/운영성 cloud DB 위험으로 분류한다.
  - Prisma validate: Passed. `cd BE; pnpm.cmd prisma:validate` 결과 schema valid.
  - Prisma generate: Blocked. `cd BE; pnpm.cmd prisma:generate`가 `query_engine-windows.dll.node.tmp*`를 `query_engine-windows.dll.node`로 rename하는 단계에서 `EPERM`으로 실패했다. `Get-CimInstance Win32_Process -Filter "name = 'node.exe'"`에서 `pnpm run start:dev`, `nest start --watch`, `node --enable-source-maps BE/dist/main` 프로세스가 확인됐고 사용자 실행 프로세스로 보아 종료하지 않았다.
  - Migration status: Failed / Blocked. `cd BE; pnpm.cmd exec prisma migrate status`는 cloud Supabase pooler datasource에 대해 18개 migration 중 17개 미적용을 보고하고 exit code 1로 종료했다. 공유/운영성 DB 가능성이 있으므로 `prisma migrate dev`, `prisma migrate deploy`는 실행하지 않았다.
  - Seed 정책: Blocked / Not executed. 현재 DB 대상이 로컬 dev/test DB로 증명되지 않았고 migration status가 불일치하므로 `prisma:seed`는 실행하지 않는다.
  - Prisma generate DLL lock 재현 여부: Reproduced. active BE dev/dist node 프로세스가 있는 상태에서 Windows Prisma query engine DLL rename lock이 재현됐다.
  - 적용된 migration 파일 수정 여부: Passed. `git status --short BE/prisma` 결과 변경 없음.
- 명령:
  - `node -v`: 통과
  - `pnpm.cmd -v`: 통과
  - `docker --version`: 통과
  - `cd BE; docker compose ps`: 실패, Docker daemon 미실행
  - `cd BE; pnpm.cmd db:dev:up`: 실패, Docker daemon 미실행
  - `cd BE; pnpm.cmd prisma:validate`: 통과
  - `cd BE; pnpm.cmd prisma:generate`: 실패, Windows Prisma query engine DLL rename `EPERM`
  - `Get-CimInstance Win32_Process -Filter "name = 'node.exe'"`: 확인, BE dev/dist node 프로세스 실행 중
  - `cd BE; pnpm.cmd exec prisma migrate status`: 실패, cloud Supabase pooler datasource에 17개 migration 미적용 보고
  - `cd BE; pnpm.cmd run typecheck`: 통과
  - `cd BE; pnpm.cmd run lint`: 통과
  - `cd BE; pnpm.cmd run test`: 통과, 19 suites / 98 tests passed
  - `cd BE; pnpm.cmd run build`: 통과
  - `git status --short BE/prisma`: 통과, 변경 없음
  - `git diff --check`: 통과
- 결과: G05 QA는 완료했지만 DB/Prisma 운영 gate는 `RQA-005`로 Blocked다. 로컬 dev/test DB URL을 active `BE/.env` key로 정리하거나 사용자가 cloud DB 대상/마이그레이션 방식을 명시적으로 결정하기 전까지 migrate/seed/generate closeout을 진행하지 않는다.
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
