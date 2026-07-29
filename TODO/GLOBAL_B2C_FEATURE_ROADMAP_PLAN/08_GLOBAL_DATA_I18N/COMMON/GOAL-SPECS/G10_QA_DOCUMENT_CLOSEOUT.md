# G10 QA Document Closeout

상태: Done
목표: 08 전체 구현 결과를 검증하고 문서를 동기화한다.

## 1. 포함 범위

- Backend Prisma/API/test/build 검증
- User Web type/lint/build/E2E 또는 수동 QA
- migration 검증 결과 기록
- 실제 provider smoke 결과 기록
- AGENT 문서 정책 갱신
- 08 문서 closeout

## 2. 제외 범위

- 신규 기능 구현
- 정책 재결정
- 후속 시장 확장

## 3. Request 계약

G10은 신규 request를 만들지 않는다.

검토 대상:

- 08에서 추가/변경된 모든 request가 API spec과 구현 결과에 일치하는지 확인한다.
- 요청 validation과 error code가 FE 표시 문구와 연결되는지 확인한다.

## 4. Response 계약

G10은 신규 response를 만들지 않는다.

검토 대상:

- 08에서 추가/변경된 모든 response가 API spec과 구현 결과에 일치하는지 확인한다.
- 날짜/시간 ISO 유지, code/field error, currency/phone/region code 포함 원칙이 지켜졌는지 확인한다.

## 5. Business Logic

- 08의 확정 결정이 구현 결과와 일치하는지 확인한다.
- 기존 한국 데이터 보존과 fallback이 동작하는지 확인한다.
- provider linking, phone migration, region migration, currency default가 문서와 일치하는지 확인한다.

## 6. User Flow

- 신규 가입, 설정 변경, Product/Deal 생성, Contact 생성, Company region/address, Import template, Export, Google/LINE/Apple login 흐름을 수동 QA 또는 E2E로 확인한다.
- 실패 시 사용자가 이해 가능한 문구와 복구 경로를 보는지 확인한다.

## 7. DB/Prisma 영향

G10은 신규 DB 변경을 하지 않는다.

검토 대상:

- 모든 08 DB 변경이 `BE/prisma/schema.prisma`에 반영됐는지 확인한다.
- 모든 신규 migration이 `BE/prisma/migrations`에 추가됐는지 확인한다.
- 새 table/column/enum/index에 한글 주석 또는 COMMENT가 있는지 확인한다.
- `BE/prisma/seed.ts`가 enum/required field 변경과 충돌하지 않는지 확인한다.

## 8. 검증 명령

Backend:

```powershell
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

User Web:

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

가능하면:

```powershell
cd FE/user-web
pnpm run test:e2e
pnpm run test:e2e:mobile
```

## 8.1 G10 실행 결과

검증일: 2026-07-28

Backend:

| Command | Result | Note |
|---|---|---|
| `pnpm.cmd run prisma:validate` | PASS | Prisma schema valid |
| `pnpm.cmd run prisma:generate` | PASS | 최초 1회는 실행 중 Backend 프로세스의 Windows DLL lock으로 실패했고, Backend 실행 프로세스 중지 후 재실행 통과 |
| `pnpm.cmd run typecheck` | PASS | `tsc --noEmit` |
| `pnpm.cmd run lint` | PASS | ESLint |
| `pnpm.cmd run test` | PASS | 64 suites / 333 tests |
| `pnpm.cmd run build` | PASS | Nest build |
| `pnpm.cmd exec prisma migrate status` | CHECKED | G10 당시 원격 DB 변경은 실행하지 않음. 2026-07-29 재확인 기준 현재 `BE/.env` 연결 DB는 최신 상태 |

User Web:

| Command | Result | Note |
|---|---|---|
| `pnpm.cmd run typecheck` | PASS | `tsc -b` |
| `pnpm.cmd run lint` | PASS | ESLint |
| `pnpm.cmd run build` | PASS | Vite build 통과, 기존 chunk size warning 유지 |
| `pnpm.cmd run test:e2e` | PASS | 27 passed |
| `pnpm.cmd run test:e2e:mobile` | PASS | 12 passed |

G10 QA 중 수정:

- 주간 보고서 화면에서 `totalDealCostByCurrency`가 없는 구버전/mock 응답을 받으면 fallback 총액으로 표시하도록 수정했다.
- Settings 화면의 Google Calendar 연결 notice가 effect 재실행으로 반복 표시될 수 있는 문제를 stable callback으로 수정했다.
- User Web E2E mock과 테스트를 G05/G06/G08 최신 계약인 전화번호 label, CompanyRegion country/region code, Google/LINE/Apple provider 목록 기준으로 갱신했다.

## 9. 수동 QA

- [x] 신규 사용자 가입 기본값이 Backend auth exchange test와 User profile 계약으로 확인됐다.
- [x] `/app/settings` 언어 변경이 즉시 반영된다.
- [x] `/app` URL에 locale prefix가 붙지 않는다.
- [x] Product/Deal KRW/USD 입력과 표시가 동작한다.
- [x] Contact KR/US 전화번호 입력과 legacy fallback이 동작한다.
- [x] Company KR/US region 선택과 legacy custom region 표시가 동작한다.
- [x] Import template `ko-KR`, `en` 선택 다운로드가 동작한다.
- [x] Export header/value가 사용자 설정 기준으로 나온다.
- [x] Google OAuth 버튼/popup smoke는 E2E에서 통과했다.
- [x] LINE OAuth 실제 provider smoke는 G10 당시 운영 설정 연결 후 확인할 항목으로 기록했고, 2026-07-29 사용자 확인 기준 운영 환경에서 완료됐다.
- [x] Apple OAuth 실제 provider smoke는 G10 당시 운영 설정 연결 후 확인할 항목으로 기록했고, 2026-07-29 사용자 확인 기준 운영 환경에서 완료됐다.

G10 당시 실제 provider smoke 미실행 사유와 후속 반영:

- G10 당시에는 LINE/Apple Supabase provider 운영 설정, provider secret, Apple Services ID/Team ID/Key ID/private key, LINE Channel ID/secret이 필요했다.
- G10 로컬 검증에서는 외부 provider 계정 교환을 실행하지 않고, 버튼/popup, provider 목록, exchange use case, safe failure, verified email linking을 자동 검증 범위로 확인했다.
- 2026-07-29 사용자 확인 기준 운영 환경에서 LINE/Apple provider 설정과 실제 OAuth 동작이 완료됐다.

## 10. 문서 동기화

- [x] `README.md` 상태와 완료 결과를 갱신했다.
- [x] `COMMON/DECISION-LOG.md`가 구현 결과와 일치한다.
- [x] `COMMON/GOAL-COMPLETION-CHECKLIST.md`가 완료 상태를 반영한다.
- [x] `COMMON/REVIEW-CHECKLIST.md`를 closeout했다.
- [x] `BE-TODO/API-TODO.md`가 구현 결과와 일치한다.
- [x] `BE-TODO/DB-SCHEMA.md`가 구현 결과와 일치한다.
- [x] `FE-TODO/USER-WEB-TODO.md`가 구현 결과와 일치한다.
- [x] AGENT 문서의 이전 auth/i18n 정책이 갱신됐다.
- [x] 실행하지 못한 검증은 사유를 기록했다.

## 11. Goal 검토 체크리스트

- [x] 08 전체 request 계약이 API spec과 일치한다.
- [x] 08 전체 response 계약이 API spec과 일치한다.
- [x] 08 전체 business logic이 `DECISION-LOG.md`와 일치한다.
- [x] 08 전체 user flow가 `USER-FLOW.md`와 일치한다.
- [x] 08 전체 DB/Prisma 변경이 `BE/prisma`와 한글 주석 기준을 따른다.
- [x] Backend 검증 command 결과를 기록했다.
- [x] User Web 검증 command 결과를 기록했다.
- [x] E2E 또는 수동 QA 결과를 기록했다.
- [x] provider smoke 결과 또는 미실행 사유를 기록했다.
- [x] 문서가 구현 결과와 일치한다.
- [x] 후속으로 남긴 범위를 정리했다.

## 12. 후속/운영 체크

- 2026-07-29 `cd BE; pnpm.cmd exec prisma migrate status` 재확인 기준 현재 `BE/.env` 연결 DB는 최신 상태다.
- 실제 LINE/Apple OAuth smoke는 2026-07-29 사용자 확인 기준 운영 환경에서 완료됐다.
- Vite build의 large chunk warning은 기존 bundle 최적화 후속이며 G10 blocker는 아니다.
