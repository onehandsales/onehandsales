# Goal Work Order

상태: Done
완료일: 2026-07-21

## 0. 완료 체크리스트

- [x] G01 DB persistence foundation
- [x] G02 Backend ImportJob API
- [x] G03 User Web resume UX
- [x] G04 QA / cleanup
- [x] 완료 기록: `TODO_LOG/2026-07-21/G04_IMPORT_JOB_PERSISTENCE_QA_CLEANUP/WORK_LOG.md`

## 1. 원칙

01은 "DB 먼저, API 다음, User Web 마지막" 순서로 간다. 이유는 User Web의 단순한 이어받기 경험이 Backend persisted state를 전제로 하기 때문이다.

각 `/goal`의 포함 범위, 제외 범위, 선행 조건, 완료 기준은 `COMMON/GOAL-SPECS`의 상세 명세를 따른다.

구현 중에도 사용자 화면 용어는 단순하게 유지한다.

```text
파일 올리기 -> 컬럼 매칭 확인 -> 오류 행만 수정 -> 가져오기 완료
```

## 2. G01 DB Persistence Foundation

상세 명세: `COMMON/GOAL-SPECS/G01_DB_PERSISTENCE_FOUNDATION.md`

목표:

- `ImportJob`, `ImportJobRow`, `ImportJobError`, `ImportUploadedFile` DB schema를 추가한다.
- Prisma client가 새 model과 enum을 사용할 수 있게 한다.
- 기존 `ImportUserLog`, `ImportUserLogRow`는 성공 이력으로 유지한다.

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
