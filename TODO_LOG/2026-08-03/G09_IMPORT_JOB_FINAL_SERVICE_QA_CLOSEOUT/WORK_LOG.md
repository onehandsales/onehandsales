# G09 ImportJob Final Service QA Closeout Work Log

작업일: 2026-08-03
대상 goal: `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE/COMMON/GOAL-SPECS/G09_FINAL_SERVICE_QA_CLOSEOUT.md`
결과: Done

## 1. 범위

G05~G08으로 구현된 ImportJob 최종형 보강이 기존 G01~G04 persistence/resume 흐름과 충돌하지 않는지 확인했다.

- API request/response 계약과 Backend DTO, User Web type 정합성 확인
- Import upload, mapping, row update, validate, confirm, cancel, expired, failed 흐름 회귀 확인
- 원본 파일 binary 즉시 삭제, 삭제 실패 warning, terminal ImportJob cleanup 재시도 확인
- `ImportUserLogRow` 30일 cleanup과 만료 후 성공 이력 상세 UX 확인
- 10MB/5,000행 upload 제한과 safe message 확인
- Prisma schema, migration, SQL comment, 한국어 코드 주석 기준 확인
- AGENT/SOFTWARE_AGENT, AGENT/UXUI_AGENT, 01 내부 문서, 상위 backlog/productization 문서 동기화

## 2. 증적 매트릭스

| 항목 | 확인 결과 |
|---|---|
| API 계약 | `COMMON/API-SPEC/IMPORT_JOB_API.md`의 `/api/imports` 계열 request/response와 Backend DTO, User Web `import-export`/`import-user-log` type을 대조했다. |
| Business logic | `CreateImportJob`에서 file size 검증, parser row count 검증, DB snapshot transaction, 원본 binary 즉시 삭제, 삭제 실패 warning 기록을 확인했다. |
| Cleanup | terminal job 7일 cleanup은 terminal timestamp 기준 cutoff, storage delete 재시도, 성공한 job만 DB aggregate 삭제, safe summary log 기준을 따른다. |
| Success row retention | `ImportUserLog` summary는 유지하고 `ImportUserLogRow`만 30일 후 삭제한다. 삭제 쿼리는 domain row나 `ImportUserLog`를 삭제하지 않는다. |
| DB/Prisma | `ImportJob`, `ImportJobRow`, `ImportJobError`, `ImportUploadedFile` schema와 `20260721010000_add_persistent_import_job` migration을 확인했다. G05~G08은 신규 migration 없이 기존 schema와 cleanup/validation logic으로 닫혔다. |
| SQL comment | G01 migration의 ImportJob 계열 table/column `COMMENT ON`을 확인했다. G05~G08에서는 신규 SQL/migration/raw SQL을 추가하지 않았다. |
| UX/UI | Notion식 단순 단계와 Attio식 linked record 정확성 기준을 유지했다. `/app/import/review/:importJobId` resume와 성공 이력 상세 row 만료 안내를 확인했다. |
| Korean comments | cleanup/retention/validation/transaction/runner/delete-preserve branch에 한국어 코드 주석이 존재함을 확인했다. G09에서는 코드 변경이 없었다. |
| Redaction | response/log에 raw row, provider raw response, prompt, token, quota detail, 파일명, storage key, 사용자 PII 배열을 노출하지 않는 기준을 확인했다. |

## 3. QA 시나리오

| 시나리오 | 결과 |
|---|---|
| 회사/담당자/제품/딜 정상 import | Backend data-import spec과 User Web route-mocked E2E로 mapping/confirm/link 흐름 확인 |
| 새 탭 review route와 reload resume | Playwright import resume UX 통과 |
| cancel | Playwright cancel UX와 Backend state transition spec 통과 |
| expired | Playwright expired UX와 Backend expired detail/action 차단 확인 |
| cross-user/missing job | Backend ownership/not found spec과 Playwright missing job redirect 통과 |
| 원본 binary 즉시 삭제 | Backend service spec 통과 |
| storage delete failure | Backend service spec에서 job 성공 유지, redacted warning 기록 확인 |
| terminal cleanup | Backend service/repository spec에서 storage 재시도, DB aggregate 삭제, domain/log 보존 확인 |
| `ImportUserLogRow` cleanup | Backend repository/service spec과 FE 만료 안내 component test 통과 |
| 5,000행 upload | Backend service spec 통과 |
| 5,001행 upload | Backend service/controller spec과 FE upload 제한 안내 component test 통과 |
| Admin 화면/API 미추가 | G05~G09 범위에서 ImportJob 전용 Admin 화면/API가 추가되지 않음을 확인 |

## 4. 검증 명령

Backend:

```text
cd BE
pnpm run prisma:validate
pnpm run typecheck
pnpm run lint
pnpm run test -- data-import
pnpm run build
```

결과: 모두 통과. `data-import` 테스트는 6 suites, 65 tests 통과.

User Web:

```text
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
pnpm exec vitest run src/features/import-export/components/import-screen.test.tsx src/features/import-export/components/import-detail-screen.test.tsx
```

결과: 모두 통과. Playwright E2E는 32 tests 통과. Vite build의 large chunk warning은 기존 번들 크기 warning으로 G09 blocker가 아니다.

문서/패치:

```text
git diff --check
```

결과: 통과.

## 5. 남은 리스크

- G09를 막는 미해결 blocker는 없다.
- 이번 closeout에서는 실제 Supabase Cloud와 외부 storage provider를 대상으로 한 live manual smoke는 실행하지 않았다. 로컬 unit/component/route-mocked E2E로 회귀를 확인했고, 운영 배포 전 smoke가 필요하면 별도 운영 절차에서 실행한다.
- 기존 Vite chunk-size warning은 ImportJob 최종형 범위 밖의 번들 최적화 후속이다.
