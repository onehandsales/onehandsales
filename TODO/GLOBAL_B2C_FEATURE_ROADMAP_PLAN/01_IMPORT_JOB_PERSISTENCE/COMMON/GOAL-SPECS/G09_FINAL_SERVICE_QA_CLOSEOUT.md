# G09 Final Service QA Closeout

상태: Confirmed
성격: 01 ImportJob Persistence 최종 서비스 형태 QA / closeout 명세

## 0. 착수/완료 체크리스트

- [ ] Request/Response 검증: `COMMON/API-SPEC/IMPORT_JOB_API.md`와 실제 Backend DTO, FE client type, error response가 일치하는지 확인한다.
- [ ] Business Logic 검증: G05 terminal cleanup, G06 original file binary 즉시 삭제, G07 `ImportUserLogRow` 30일 cleanup, G08 10MB/5,000행 제한이 서로 충돌하지 않는지 확인한다.
- [ ] User Flow 검증: `COMMON/USER-FLOW.md`, `FE-TODO/USER-WEB-TODO.md`, `AGENT/UXUI_AGENT` 기준으로 정상 import, 이어받기, 제한 초과, row detail 만료 화면이 사용자가 이해할 수 있는 흐름인지 확인한다.
- [ ] DB/Prisma 검증: `BE/prisma/schema.prisma`, `BE/prisma/migrations`, `BE-TODO/DB-SCHEMA.md`와 실제 cleanup/delete 대상이 일치하는지 확인한다.
- [ ] 소프트웨어 아키텍처/컨벤션 검증: `AGENT/SOFTWARE_AGENT` 기준으로 use case, repository, runner, controller, FE feature boundary 위반이 없는지 확인한다.
- [ ] 코드 주석 검증: G05~G08에서 작성하거나 수정한 cleanup, retention, validation, transaction, runner, DB 삭제/보존 분기에 한글 주석이 있는지 확인한다.
- [ ] SQL 주석 검증: G05~G08에서 Prisma migration SQL, raw SQL, cleanup/retention 보조 SQL을 작성했다면 한글 `COMMENT ON` 또는 `-- 한글 주석`이 있는지 확인한다.
- [ ] 문서 동기화 검증: `01_IMPORT_JOB_PERSISTENCE`, `NEXT_BACKEND_API_BACKLOG_PLAN`, `USER_WEB_PRODUCTIZATION_GAP_PLAN`의 상태가 구현 결과와 일치하는지 갱신한다.
- [ ] QA 기록 검증: 실행 명령, 수동 QA 결과, 남은 리스크를 작업 결과 또는 `TODO_LOG`에 남긴다.

## 1. 목적

G05~G08 구현이 끝난 뒤 `01_IMPORT_JOB_PERSISTENCE`를 Global B2C 최종 서비스 형태 기준으로 완전 종료한다.

G04는 G01~G03 persistence/resume 1차 구현을 닫는 QA였다. G09는 2026-08-03에 추가 확정한 최종형 보관/삭제/입력량 제한 보강을 닫는 QA다.

## 2. 선행 조건

- G05 Terminal ImportJob Cleanup 구현 완료
- G06 Original File Binary Minimization 구현 완료
- G07 Import Success Row Retention 구현 완료
- G08 Import Volume Limits 구현 완료
- Backend/User Web 변경 사항이 같은 branch에 반영된 상태
- 필요한 DB migration, Prisma generate, test fixture가 반영된 상태

## 3. 포함 범위

- G01~G04 기존 import persistence/resume 회귀 QA
- G05 terminal ImportJob cleanup QA
- G06 원본 업로드 file binary 즉시 삭제 QA
- G07 `ImportUserLogRow` 30일 row-level retention QA
- G08 10MB/5,000행 upload 제한 QA
- Backend request/response/error/log redaction 점검
- User Web import flow, import log detail, 제한 초과 안내 점검
- DB/Prisma schema, migration, cleanup 대상 정합성 점검
- `01_IMPORT_JOB_PERSISTENCE`, `NEXT_BACKEND_API_BACKLOG_PLAN`, `USER_WEB_PRODUCTIZATION_GAP_PLAN` 문서 closeout

## 4. 제외 범위

- 결제/구독/과금/entitlement QA
- Admin 전용 ImportJob 화면/API QA
- 대용량 import background worker QA
- 범용 ExportJob QA
- 일정/회의록 import QA
- 제품 분석 event taxonomy QA
- Notification/reminder delivery QA
- 전체 개인정보처리방침/약관/legal 문구 QA

## 5. 회귀 QA 매트릭스

| 영역 | 확인 내용 |
|---|---|
| 기존 import flow | 회사, 담당자, 제품, 딜 upload -> mapping -> row edit -> validate -> confirm이 정상 동작한다. |
| resume | upload 후 새로고침, 탭 이동, detail route 직접 접근 시 DB snapshot으로 상태가 복구된다. |
| cancel/expired/failed | terminal 상태에서는 confirm이 막히고 사용자는 새 파일 시작 안내를 본다. |
| cross-user | 다른 사용자의 `importJobId` 접근은 존재 여부를 노출하지 않고 404로 처리한다. |
| G05 cleanup | terminal 상태 후 7일 지난 `ImportJob` aggregate만 삭제되고 active job, `ImportUserLog`, 실제 CRM 데이터는 유지된다. |
| G05 storage retry | `ImportUploadedFile.deletedAt`이 없는 terminal job은 storage delete를 재시도하고, 실패하면 DB snapshot을 삭제하지 않는다. |
| G06 immediate delete | 정상 upload 직후 원본 file binary가 삭제되고, resume은 `ImportJobRow` snapshot만으로 동작한다. |
| G06 delete failure | immediate delete 실패가 import job 생성을 막지 않고 safe warning과 cleanup 재시도 metadata를 남긴다. |
| G07 row retention | 30일이 지난 `ImportUserLogRow`는 삭제되고 `ImportUserLog` summary와 실제 CRM 데이터는 유지된다. |
| G07 empty detail | row detail이 만료된 import log 상세는 에러가 아니라 summary와 만료 안내를 보여준다. |
| G08 limits | 10MB 이하, 5,000 data row 이하 파일은 통과한다. |
| G08 reject | 5,001 data row 이상 또는 10MB 초과 파일은 job/storage/row 생성 없이 안전한 message로 거부된다. |
| redaction | raw row, 파일명, `storageKey`, provider raw detail, email, phone, name이 response/log/Admin 화면에 노출되지 않는다. |
| docs | 구현 결과와 01/NEXT_BACKEND/USER_WEB 문서의 상태가 서로 충돌하지 않는다. |

## 6. 검증 명령

Backend:

```powershell
cd BE
pnpm.cmd run prisma:validate
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run test -- data-import
pnpm.cmd run build
```

User Web:

```powershell
cd FE/user-web
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run build
pnpm.cmd run test:e2e
```

## 7. 수동 QA 시나리오

```text
1. 회사 CSV 업로드 -> 매핑 확인 -> confirm
2. 담당자 CSV 업로드 -> 새로고침 -> row 수정 -> confirm
3. 제품 CSV 업로드 -> mapping 수정 -> validate -> confirm
4. 딜 CSV 업로드 -> 회사/담당자/제품 연결 보정 -> confirm
5. 업로드 후 새 탭에서 review route 접근 -> 같은 상태 복구
6. 업로드 후 cancel -> active 목록 제거
7. expired job detail 접근 -> 새 파일 시작 안내
8. 다른 user job id 접근 -> 404 처리
9. 정상 upload 직후 원본 file binary 삭제 확인
10. storage delete 실패 강제 -> import 성공 유지, safe warning, cleanup 재시도 metadata 확인
11. terminal 상태 후 7일 지난 job cleanup -> ImportJob aggregate 삭제와 ImportUserLog 유지 확인
12. 30일 지난 ImportUserLogRow cleanup -> summary 유지와 row detail 만료 안내 확인
13. 5,000행 파일 upload -> 정상 처리
14. 5,001행 파일 upload -> job/storage/row 생성 없이 제한 안내
15. log/response에서 raw row, 파일명, storage key, phone, email 원문이 남지 않는지 확인
```

## 8. 문서 closeout 기준

G09 완료 시 아래 문서를 반드시 함께 갱신한다.

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`

갱신 내용:

- 01 README와 `COMMON/SCOPE.md` 상태를 최종 서비스 형태 완료로 변경한다.
- G05~G09 체크리스트를 완료로 표시한다.
- 완료일, 완료 커밋, Backend/User Web 검증 결과, 수동 QA 결과를 기록한다.
- `NEXT_BACKEND_API_BACKLOG_PLAN`에서 `NBA-006`을 G01~G09 전체 기준 최종 종료로 정리한다.
- `USER_WEB_PRODUCTIZATION_GAP_PLAN`에서 DataImport/Import UX productization gap을 최종 종료로 정리한다.
- 구현 결과가 API/DB/FE 문서와 다르면 해당 문서를 실제 코드 기준으로 갱신한다.

## 9. 완료 기준

- Backend 검증 명령이 통과한다.
- User Web 검증 명령이 통과한다.
- 수동 QA 시나리오가 통과한다.
- cleanup, retention, volume limit 기능 간 충돌이 없다.
- raw import data와 민감 정보가 response/log/Admin 화면에 노출되지 않는다.
- `01_IMPORT_JOB_PERSISTENCE`, `NEXT_BACKEND_API_BACKLOG_PLAN`, `USER_WEB_PRODUCTIZATION_GAP_PLAN` 상태가 모두 최종 종료 기준으로 동기화된다.
- 남은 항목이 있다면 01 미완성이 아니라 별도 TODO 또는 post-12 후속인지 명확히 기록한다.
