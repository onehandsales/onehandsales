# Goal Work Order

상태: G01~G04 구현 완료 / G05~G08 구현 대기 / G09 최종 QA 대기 / 01 최종 서비스 형태 미완료
G01~G04 완료일: 2026-07-21

## 0. 완료 체크리스트

- [x] G01 DB persistence foundation
- [x] G02 Backend ImportJob API
- [x] G03 User Web resume UX
- [x] G04 QA / cleanup
- [x] 완료 기록: `TODO_LOG/2026-07-21/G04_IMPORT_JOB_PERSISTENCE_QA_CLEANUP/WORK_LOG.md`
- [ ] G05 Terminal ImportJob cleanup
- [ ] G06 Original file binary minimization
- [ ] G07 Import success row retention
- [ ] G08 Import volume limits
- [ ] G09 Final service QA closeout

## 1. 원칙

01은 "DB 먼저, API 다음, User Web 마지막" 순서로 간다. 이유는 User Web의 단순한 이어받기 경험이 Backend persisted state를 전제로 하기 때문이다.

각 `/goal`의 포함 범위, 제외 범위, 선행 조건, 완료 기준은 `COMMON/GOAL-SPECS`의 상세 명세를 따른다.

구현 중에도 사용자 화면 용어는 단순하게 유지한다.

```text
파일 올리기 -> 컬럼 매칭 확인 -> 오류 행만 수정 -> 가져오기 완료
```

필수 구현 기준:

- 각 goal은 착수 전 자체 체크리스트를 확인하고, 완료 시 체크리스트 항목별 결과를 남긴다.
- Request, response, business logic, user flow, DB/Prisma 영향은 구현 전 반드시 문서에서 확인한다.
- Backend 작업은 `AGENT/SOFTWARE_AGENT/BACKEND_AGENT`, `AGENT/SOFTWARE_AGENT/DB_SCHEMA`, `BE/prisma/schema.prisma`, `BE/prisma/migrations`를 기준으로 한다.
- 소프트웨어 아키텍처, transaction, logging, observability, module boundary, repository/use case 책임 같은 IT 관련 판단은 `AGENT/SOFTWARE_AGENT`를 기준으로 한다.
- Frontend/User Web 작업은 `AGENT/SOFTWARE_AGENT/FRONT_AGENT`, `AGENT/UXUI_AGENT`, `COMMON/USER-FLOW.md`, `FE-TODO/USER-WEB-TODO.md`를 기준으로 한다.
- DB 관련 작업은 `BE/prisma`의 실제 schema/migration 상태를 먼저 확인하고, 신규 schema/migration/comment가 필요한지 판단한다.
- 코드 작성 시 한글 주석은 필수다. 특히 cleanup, retention, validation, transaction, runner, DB 삭제/보존 분기에는 의도를 설명하는 한글 주석을 남긴다.
- SQL 작성 시 한글 주석은 필수다. Prisma migration SQL, raw SQL, cleanup/retention 보조 SQL에는 `COMMENT ON TABLE`, `COMMENT ON COLUMN` 또는 `-- 한글 주석`으로 목적, 보관/삭제 기준, 안전 조건을 남긴다.

## 2. G01 DB Persistence Foundation

상세 명세: `COMMON/GOAL-SPECS/G01_DB_PERSISTENCE_FOUNDATION.md`

목표:

- `ImportJob`, `ImportJobRow`, `ImportJobError`, `ImportUploadedFile` DB schema를 추가한다.
- Prisma client가 새 model과 enum을 사용할 수 있게 한다.
- 기존 `ImportUserLog`, `ImportUserLogRow`는 성공 이력으로 유지한다. 단, 최종형 G07에서는 `ImportUserLogRow`를 30일 row-level retention 대상으로 보강한다.

작업:

1. `BE/prisma/schema.prisma`에 enum/model/relation을 추가한다.
2. migration `20260721010000_add_persistent_import_job`를 생성한다.
3. migration SQL에 `COMMENT ON TABLE`, `COMMENT ON COLUMN`을 추가한다.
4. Prisma generate를 실행한다.
5. `ImportJobRepository`, `ImportJobRowRepository`, `ImportJobErrorRepository`, `ImportUploadedFileRepository` interface를 만든다.
6. Prisma repository adapter를 만든다.
7. repository 단위 테스트를 작성한다.

검증:

```powershell
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
pnpm run prisma:migrate
pnpm run typecheck
pnpm run test -- data-import
```

완료 기준:

- 새 schema가 migration으로 생성된다.
- Prisma client에서 신규 model을 사용할 수 있다.
- user ownership 기반 조회 method가 준비된다.
- `InMemoryImportJobStore`를 대체할 저장소 기반이 마련된다.

## 3. G02 Backend ImportJob API

상세 명세: `COMMON/GOAL-SPECS/G02_BACKEND_IMPORT_JOB_API.md`

목표:

- `COMMON/API-SPEC/IMPORT_JOB_API.md`의 API를 구현한다.
- 기존 in-memory job flow를 DB persisted flow로 교체한다.

작업:

1. DTO/request/response 타입을 API spec과 맞춘다.
2. `GET /api/imports/active`를 추가한다. controller에서는 `GET /api/imports/:importJobId`보다 먼저 선언한다.
3. `POST /api/imports` upload flow가 DB에 job/file/row를 생성하게 바꾼다.
4. `GET /api/imports/:importJobId`가 DB에서 detail을 조회하게 바꾼다.
5. `POST /api/imports/:importJobId/map`이 mapping과 row validation을 DB에 저장하게 바꾼다.
6. `PATCH /api/imports/:importJobId/mapping`을 구현한다.
7. `PATCH /api/imports/:importJobId/rows`를 구현한다.
8. `POST /api/imports/:importJobId/validate`를 구현한다.
9. `POST /api/imports/:importJobId/confirm`이 도메인 row와 `ImportUserLog*`를 같은 transaction에서 생성하게 한다.
10. `POST /api/imports/:importJobId/cancel`을 구현한다.
11. `GET /api/imports/:importJobId/errors`를 구현한다.
12. `ExpireImportJobsUseCase`와 원본 파일 삭제 adapter를 연결한다.
13. `InMemoryImportJobStore` 의존을 제거한다.

검증:

```powershell
cd BE
pnpm run typecheck
pnpm run lint
pnpm run test -- data-import
pnpm run build
```

완료 기준:

- 서버 재시작 후에도 7일 내 job을 조회할 수 있다.
- 다른 사용자의 `importJobId` 접근은 404이다.
- invalid row가 있으면 confirm이 막힌다.
- confirm 성공 시 domain row와 success log가 함께 생성된다.
- confirm 실패 시 부분 데이터가 남지 않는다.
- storage/provider/raw row 원문이 log와 response에 노출되지 않는다.

## 4. G03 User Web Resume UX

상세 명세: `COMMON/GOAL-SPECS/G03_USER_WEB_RESUME_UX.md`

목표:

- 사용자는 단순한 가져오기 flow를 유지하면서 진행 중 작업을 이어받을 수 있다.

작업:

1. API client와 response 타입을 `COMMON/API-SPEC/IMPORT_JOB_API.md`에 맞춘다.
2. `/app/import` 진입 시 `GET /api/imports/active`를 호출한다.
3. 진행 중 작업 카드와 이어서 보기 action을 만든다.
4. upload 성공 시 `/app/import/review/:importJobId`로 이동한다.
5. `/app/import/review/:importJobId`에서 `GET /api/imports/:importJobId`로 상태를 복구한다.
6. mapping select가 `PATCH /mapping` response 기준으로 갱신되게 한다.
7. row/cell 수정이 `PATCH /rows` response 기준으로 갱신되게 한다.
8. validate 결과로 confirm button 활성/비활성을 결정한다.
9. confirm 성공 시 success history detail로 이동한다.
10. cancel, expired, failed 상태 UI를 만든다.
11. mobile row card/list 전환을 보강한다.

검증:

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

완료 기준:

- upload 후 detail route로 이동한다.
- 새로고침 후 mapping/row/error state가 복구된다.
- 오류 cell만 짧은 문구로 표시된다.
- expired/canceled/failed job에서 confirm이 보이지 않는다.
- confirm 성공 후 성공 내역으로 이동한다.

## 5. G04 QA / Cleanup

상세 명세: `COMMON/GOAL-SPECS/G04_QA_CLEANUP.md`

목표:

- 01을 실제 Global B2C 품질 기준으로 닫는다.

작업:

1. 수동 QA 시나리오를 실행한다.
2. migration과 seed 영향이 없는지 확인한다.
3. storage delete 실패 시나리오를 점검한다.
4. log redaction을 확인한다.
5. cross-user 접근 차단을 확인한다.
6. TODO 문서 상태를 구현 결과에 맞춰 `implemented` 또는 Done 문서로 이동할 준비를 한다.

수동 QA:

```text
1. 회사 CSV 업로드 -> 매핑 확인 -> confirm
2. 담당자 CSV 업로드 -> 새로고침 -> row 수정 -> confirm
3. 딜 CSV 업로드 -> 연결 record 보정 -> confirm
4. 업로드 후 cancel -> active 목록 제거
5. 만료 job detail 접근 -> 새 파일 시작 안내
6. 다른 user job id 접근 -> 404 처리
7. storage delete 실패 강제 -> import 성공 유지와 ImportJobError 기록 확인
```

완료 기준:

- Backend와 User Web 검증 명령이 통과한다.
- 핵심 수동 QA가 통과한다.
- 새 DB table의 보관/삭제 정책이 운영 문서와 충돌하지 않는다.
- 사용자 화면은 Notion식 단순함과 Attio식 CRM 연결 정확성을 유지한다.

## 6. G05 Terminal ImportJob Cleanup

상세 명세: `COMMON/GOAL-SPECS/G05_TERMINAL_IMPORT_JOB_CLEANUP.md`

목표:

- Global B2C 최종 서비스 형태 기준으로 terminal ImportJob 임시 snapshot을 7일 보관 후 자동 cleanup한다.

작업:

1. terminal cleanup use case를 만든다.
2. terminal cleanup 대상 조회 repository method를 만든다.
3. `ImportJob` aggregate batch delete repository method를 만든다.
4. `ImportUploadedFile.deletedAt`이 없는 job은 storage delete를 재시도한다.
5. storage delete 실패 job은 DB 삭제하지 않는다.
6. env flag 기반 optional runner를 만든다.
7. cleanup summary log만 남긴다.
8. Admin/User HTTP API와 화면을 추가하지 않는다.

검증:

```powershell
cd BE
pnpm run typecheck
pnpm run lint
pnpm run test -- data-import
pnpm run build
```

완료 기준:

- terminal 상태 후 7일 지난 `ImportJob` aggregate가 batch 삭제된다.
- G05 실행으로는 `ImportUserLog`, `ImportUserLogRow`, 실제 CRM 데이터가 삭제되지 않는다.
- 원본 파일 삭제 실패 job은 storage key 추적을 잃지 않는다.
- cleanup runner는 env flag가 켜졌을 때만 실행된다.
- log에는 raw row, 파일명, storage key, job ID 목록을 남기지 않는다.

## 7. G06 Original File Binary Minimization

상세 명세: `COMMON/GOAL-SPECS/G06_ORIGINAL_FILE_BINARY_MINIMIZATION.md`

목표:

- 원본 업로드 file binary를 parse와 DB snapshot 생성 성공 직후 삭제한다.
- 새로고침/이어받기는 원본 파일이 아니라 `ImportJobRow` DB snapshot만으로 유지한다.

작업:

1. `CreateImportJob` 성공 흐름에서 DB transaction 이후 storage delete를 호출한다.
2. delete 성공 시 `ImportUploadedFile.status=DELETED`, `deletedAt`을 기록한다.
3. delete 실패 시 job 생성은 성공으로 유지하고 `ImportJobError` safe warning을 만든다.
4. response/log에 파일명, `storageKey`, raw storage error detail이 노출되지 않게 한다.
5. delete 실패 metadata가 G05 cleanup 재시도 대상이 되게 한다.

검증:

```powershell
cd BE
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run test -- data-import
pnpm.cmd run build
```

완료 기준:

- 정상 upload 직후 원본 file binary가 storage에서 삭제된다.
- resume UX는 DB snapshot만으로 동작한다.
- storage delete 실패는 import 성공을 막지 않고 safe warning만 남긴다.
- 실패 파일은 G05 cleanup에서 재시도할 수 있는 metadata를 유지한다.

## 8. G07 Import Success Row Retention

상세 명세: `COMMON/GOAL-SPECS/G07_IMPORT_SUCCESS_ROW_RETENTION.md`

목표:

- `ImportUserLog` summary는 장기 유지한다.
- row-level submitted data인 `ImportUserLogRow`는 생성 후 30일이 지나면 삭제한다.

작업:

1. `ImportUserLogRow` cleanup use case를 만든다.
2. 삭제 대상 row id를 `createdAt asc, id asc` 기준 batch 조회한 뒤 삭제한다.
3. `ImportUserLog`, 실제 Company/Contact/Product/Deal row는 삭제하지 않는다.
4. cleanup summary log만 남긴다.
5. User Web success history detail에서 row detail이 비어도 summary를 정상 표시한다.

검증:

```powershell
cd BE
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run test -- data-import
pnpm.cmd run build
```

User Web을 변경한 경우:

```powershell
cd FE/user-web
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run build
```

완료 기준:

- 31일 지난 `ImportUserLogRow`가 삭제된다.
- 29일 지난 `ImportUserLogRow`는 유지된다.
- `ImportUserLog` summary와 실제 CRM 데이터는 유지된다.
- row detail이 없는 import log 상세가 사용자에게 정상 상태로 보인다.

## 9. G08 Import Volume Limits

상세 명세: `COMMON/GOAL-SPECS/G08_IMPORT_VOLUME_LIMITS.md`

목표:

- 대용량 background worker 없이 01 import flow를 최종 서비스 기준으로 닫는다.
- 10MB/5,000 data row 제한을 적용하고 초과 시 안전하게 거부한다.

작업:

1. 기존 10MB file size 제한이 실제 upload API에서 유지되는지 확인한다.
2. parser 결과 data row가 5,000행을 초과하면 validation error로 실패시킨다.
3. 제한 초과 시 `ImportJob`, `ImportJobRow`, `ImportUploadedFile`, storage object를 만들지 않는다.
4. User Web upload 화면에서 safe error message를 표시한다.
5. raw row/file detail이 response/log에 노출되지 않게 한다.

검증:

```powershell
cd BE
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run test -- data-import
pnpm.cmd run build
```

User Web을 변경한 경우:

```powershell
cd FE/user-web
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run build
```

완료 기준:

- 5,000행 import는 통과한다.
- 5,001행 import는 DB/storage 흔적 없이 실패한다.
- 사용자는 파일을 나눠 올리라는 명확한 안내를 본다.
- 대용량 worker/progress/partial retry는 01 범위에 추가되지 않는다.

## 10. G09 Final Service QA Closeout

상세 명세: `COMMON/GOAL-SPECS/G09_FINAL_SERVICE_QA_CLOSEOUT.md`

목표:

- G05~G08 최종형 보강이 기존 G01~G04 import persistence/resume 흐름과 충돌하지 않는지 통합 QA한다.
- `01_IMPORT_JOB_PERSISTENCE`, `NEXT_BACKEND_API_BACKLOG_PLAN`, `USER_WEB_PRODUCTIZATION_GAP_PLAN` 문서를 구현 결과에 맞춰 최종 종료 상태로 동기화한다.

작업:

1. G01~G04 기존 import flow 회귀 QA를 실행한다.
2. G05 terminal cleanup, G06 original file binary 즉시 삭제, G07 `ImportUserLogRow` 30일 cleanup, G08 10MB/5,000행 제한을 통합 검증한다.
3. Backend request/response/log redaction을 확인한다.
4. User Web normal import, resume, row detail 만료, 제한 초과 안내를 확인한다.
5. DB/Prisma schema, migration, cleanup/delete 대상이 문서와 일치하는지 확인한다.
6. `TODO_LOG` 또는 작업 결과에 검증 명령과 수동 QA 결과를 남긴다.
7. 01/NEXT_BACKEND/USER_WEB 문서 상태를 최종 종료 기준으로 갱신한다.

검증:

```powershell
cd BE
pnpm.cmd run prisma:validate
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run test -- data-import
pnpm.cmd run build
```

```powershell
cd FE/user-web
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run build
pnpm.cmd run test:e2e
```

완료 기준:

- G05~G08 구현 결과가 전체 import flow와 충돌하지 않는다.
- Backend/User Web 검증 명령과 수동 QA가 통과한다.
- raw row, 파일명, `storageKey`, provider raw detail, email, phone, name이 response/log/Admin 화면에 노출되지 않는다.
- `01_IMPORT_JOB_PERSISTENCE`, `NEXT_BACKEND_API_BACKLOG_PLAN`, `USER_WEB_PRODUCTIZATION_GAP_PLAN` 상태가 모두 최종 종료 기준으로 동기화된다.
