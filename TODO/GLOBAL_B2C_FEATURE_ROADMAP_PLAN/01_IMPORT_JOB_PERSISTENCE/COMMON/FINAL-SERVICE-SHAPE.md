# Final Service Shape

상태: Confirmed
결정일: 2026-08-03
성격: 01 ImportJob Persistence 최종 서비스 형태 보강 결정
완료 상태: G05~G09 구현 및 QA closeout 완료 (2026-08-03)

## 1. 목적

이 문서는 `01_IMPORT_JOB_PERSISTENCE`의 기존 G01~G04 완료 이후, Global B2C 최종 서비스 형태로 닫기 위해 추가로 확정한 후속 구현 범위를 기록한다.

결론:

- G01~G04의 ImportJob persistence/resume 기능은 완료 상태로 유지한다.
- 기존 문서에서 "terminal metadata cleanup 후보"로 둔 항목을 최종 서비스 형태의 G05 구현 대상으로 승격한다.
- 원본 업로드 파일 binary 즉시 삭제, 성공 row-level 이력 30일 cleanup, import row 제한을 G06~G08로 추가한다.
- 작업 단위가 커서 01 당시 후속 또는 모호한 범위로 둔 항목 중, 01의 직접 책임인 import 데이터 보관/삭제/입력량 제한만 이 문서에 포함한다.
- ExportJob, Admin 화면/API, 대용량 import worker, 일정/회의록 import 같은 확장 기능은 01 최종형에 포함하지 않는다.

## 2. 최종 서비스 형태

사용자가 파일을 업로드하면 원본 Excel/CSV binary는 parse와 DB snapshot 생성 성공 직후 삭제한다. 사용자는 DB에 저장된 확정 전 snapshot으로 가져오기를 이어받는다. 가져오기를 완료하면 실제 CRM 데이터와 성공 이력 summary는 유지한다. 반면, 업로드 당시의 row snapshot과 오류 detail 같은 확정 전 임시 데이터는 terminal 상태가 된 뒤 7일만 보관하고 자동 정리한다. 성공 이력의 row-level submitted data는 30일 후 삭제한다.

예시:

1. 2026-08-01 사용자가 회사 1,000건 CSV를 업로드한다.
2. parser와 DB snapshot 생성이 성공하면 원본 CSV binary를 즉시 삭제한다.
3. 2026-08-05 사용자가 가져오기를 완료한다.
4. 실제 `Company` row와 `ImportUserLog` summary는 유지한다.
5. 2026-08-12 이후 cleanup runner가 `ImportJob`, `ImportJobRow`, `ImportJobError`, `ImportUploadedFile` 임시 snapshot을 삭제한다.
6. 2026-08-31 이후 cleanup runner가 `ImportUserLogRow` row-level submitted data를 삭제한다.

## 3. 확정 결정

| 항목 | 결정 |
|---|---|
| 보관 기간 | terminal 상태가 된 뒤 7일 |
| 기준 시점 | `CONFIRMED`는 `confirmedAt`, `CANCELED`는 `canceledAt`, `FAILED`는 `failedAt`, `EXPIRED`는 `expiresAt` |
| 기존 데이터 | 이미 쌓인 terminal ImportJob도 동일 정책 적용 |
| 삭제 대상 상태 | `CONFIRMED`, `CANCELED`, `EXPIRED`, `FAILED` |
| 삭제 제외 상태 | `UPLOADED`, `MAPPED`, `NEEDS_REVIEW`, `READY_TO_CONFIRM`, `CONFIRMING` |
| 삭제 대상 table | `ImportJob` aggregate. cascade로 `ImportJobRow`, `ImportJobError`, `ImportUploadedFile` 삭제 |
| 유지 대상 table | `ImportUserLog`, 실제 Company/Contact/Product/Deal 데이터 |
| 성공 row-level 이력 | `ImportUserLogRow`는 30일 후 삭제. 축약 보관하지 않음 |
| 원본 파일 binary | parse + DB snapshot 생성 성공 직후 삭제 |
| 원본 파일 삭제 실패 | cleanup에서 storage delete를 재시도하고, 성공한 경우에만 DB snapshot 삭제 |
| 대용량 import | background worker를 만들지 않고 10MB/5,000 data row 제한 적용 |
| 자동 실행 | env flag 기반 optional runner |
| 기본 batch size | 500 |
| 로그 | safe summary log만 남김 |
| Admin 화면/API | 추가하지 않음. 11 Admin Operation 문서에 후속 운영 표시 후보로만 기록 |

## 4. Terminal 기준

cleanup cutoff는 terminal 상태 전환 시점 + 7일이다.

- `CONFIRMED`: `confirmedAt + 7일`
- `CANCELED`: `canceledAt + 7일`
- `FAILED`: `failedAt + 7일`
- `EXPIRED`: `expiresAt + 7일`

legacy 또는 비정상 row에서 terminal timestamp가 비어 있으면 구현은 `updatedAt` fallback을 사용할 수 있다. 이 fallback은 migration 없이 기존 DB를 안전하게 정리하기 위한 방어 로직이며, 신규 정상 flow에서는 terminal timestamp가 채워지는 것을 원칙으로 한다.

## 5. 원본 파일 binary 최소 보관

정책:

- 원본 파일 binary는 DB에 저장하지 않는다.
- storage에 임시 저장한 원본 파일은 parse와 DB snapshot 생성 성공 직후 삭제한다.
- `ImportUploadedFile` metadata는 남기되 정상 삭제 시 `status=DELETED`, `deletedAt`을 기록한다.
- 즉시 삭제 실패 시 job 생성은 성공으로 유지하고 `ImportJobError` safe warning을 남긴다.
- 즉시 삭제 실패로 `deletedAt`이 비어 있는 파일은 G05 cleanup에서 재시도한다.

예시:

1. 사용자가 `고객사_1000건.xlsx`를 업로드한다.
2. Backend가 `ImportJobRow` 1,000개 snapshot을 만든다.
3. 원본 `.xlsx` binary를 storage에서 삭제한다.
4. 사용자는 원본 파일 없이도 `/app/import/review/:importJobId`에서 작업을 이어간다.

## 6. Cleanup Runner 계약

환경 변수:

```env
IMPORT_JOB_CLEANUP_ENABLED=true
IMPORT_JOB_CLEANUP_INTERVAL_MS=300000
IMPORT_JOB_CLEANUP_BATCH_SIZE=500
```

실행 방식:

1. `IMPORT_JOB_CLEANUP_ENABLED`가 `true` 또는 `1`일 때만 runner를 시작한다.
2. interval tick마다 이전 tick이 실행 중이면 건너뛴다.
3. cleanup 대상 terminal job을 cutoff 기준으로 최대 batch size만큼 조회한다.
4. `ImportUploadedFile.deletedAt`이 비어 있으면 storage delete를 재시도한다.
5. storage delete가 성공했거나 이미 삭제된 job만 DB에서 삭제한다.
6. DB 삭제는 `ImportJob` 기준으로 수행하고 child row는 cascade에 맡긴다.
7. 결과는 safe summary log로 남긴다.

summary log 예시:

```json
{
  "event": "importJob.cleanup.completed",
  "deletedJobCount": 500,
  "fileDeleteRetriedCount": 12,
  "fileDeleteFailedCount": 1
}
```

로그 금지:

- `ImportJobRow.rawDataJson`
- `mappedDataJson`, `normalizedDataJson`, `validationErrorsJson`
- 업로드 파일명
- `storageKey`
- 사용자 email/phone/name
- job ID 배열
- provider raw response, AI prompt, token, quota detail

G05 terminal cleanup과 G07 `ImportUserLogRow` cleanup은 같은 import retention runner에서 순차 실행할 수 있다. 구현은 raw 데이터 없이 count 중심 summary만 남긴다.

## 7. 성공 이력 row-level retention

`ImportUserLog`는 가져오기 성공 summary 정본이다. 장기 보관한다.

`ImportUserLogRow`는 row별 submitted data snapshot이다. 생성 후 30일이 지나면 삭제한다.

예시:

- 유지: "2026-08-01 회사 300건 가져오기 완료"
- 삭제: row별 회사명, 담당자명, email, phone이 들어 있는 `submittedDataJson`

User Web은 row detail이 정리된 import log 상세를 오류로 보지 않는다. summary를 보여주고, row detail 보관 기간이 지났다는 안내를 표시한다.

## 8. Import volume limit

01 최종형은 대용량 import background worker를 만들지 않는다.

정책:

- 파일 크기: 10MB 이하
- data row: 5,000행 이하
- 초과 시 `ImportJob`, `ImportJobRow`, `ImportUploadedFile`을 만들지 않는다.
- 사용자에게 파일을 나눠서 올리라는 safe validation message를 보여준다.

예시:

- 3,000행 CSV: 허용
- 5,001행 CSV: 거부
- 100,000행 CSV: 01에서는 거부하고, 향후 scale import 후속에서 별도 판단

## 9. 01에 포함하지 않는 것

아래 항목은 01의 최종 서비스 형태에 포함하지 않는다.

| 항목 | 판단 |
|---|---|
| ImportJob 전용 Admin 화면/API | 이번 cleanup은 safe summary log만 남긴다. 반복 장애 시 post-12 Admin 운영 후속에서 aggregate/system gate로 검토한다. |
| 원본 파일 장기/영구 보관 | 개인정보와 storage 비용 리스크가 커서 금지한다. G06에서 즉시 삭제한다. |
| 과거 import row snapshot 재열람 | 성공 summary는 `ImportUserLog`로 유지한다. raw snapshot 장기 보관을 전제로 하지 않는다. |
| 대용량 import background worker | 별도 product/scale 후속이다. |
| 범용 ExportJob | 01이 아니라 Export/Data request/운영 후속 범위다. |
| 일정/회의록 import | 현재 Import 대상은 회사, 담당자, 제품, 딜이다. |
| 결제/구독 연동 | 12 전용 범위다. |

## 10. 구현 기준 문서

실제 구현은 아래 문서를 기준으로 한다.

- `COMMON/GOAL-SPECS/G05_TERMINAL_IMPORT_JOB_CLEANUP.md`
- `COMMON/GOAL-SPECS/G06_ORIGINAL_FILE_BINARY_MINIMIZATION.md`
- `COMMON/GOAL-SPECS/G07_IMPORT_SUCCESS_ROW_RETENTION.md`
- `COMMON/GOAL-SPECS/G08_IMPORT_VOLUME_LIMITS.md`
- `COMMON/GOAL-SPECS/G09_FINAL_SERVICE_QA_CLOSEOUT.md`
- `BE-TODO/DB-SCHEMA.md`
- `BE-TODO/API-TODO.md`
- `FE-TODO/USER-WEB-TODO.md`
- `BE/prisma/schema.prisma`
- `BE/src/modules/data-import`

## 11. 상위 계획 정합성과 완전 종료 판정

`NEXT_BACKEND_API_BACKLOG_PLAN`과 `USER_WEB_PRODUCTIZATION_GAP_PLAN`에서 01의 원래 핵심은 `NBA-006 ImportJob persistence/resume API`였다. 즉 업로드, 매핑, 검증, 확정 전 작업이 새로고침, 탭 이동, 서버 재시작, 배포 중에도 유실되지 않는지가 직접 요구사항이었다.

G01~G04는 이 직접 요구사항을 구현하고 QA closeout까지 완료한 범위다.

G05~G08은 상위 문서의 완료 범위를 뒤집는 새 기능이 아니라, Global B2C 최종 서비스 형태에서 01을 더 이상 붙잡지 않기 위한 보관/삭제/입력량 제한 보강이다. G09는 이 보강 묶음이 기존 import flow와 충돌하지 않는지 확인하고 문서를 최종 종료 상태로 맞추는 QA closeout이다.

정합성:

- G05 terminal cleanup은 `Data reliability`와 import raw snapshot 보관 기간 정책에 맞는다.
- G06 원본 file binary 즉시 삭제는 개인정보 최소 보관과 고객 신뢰 기준에 맞는다.
- G07 `ImportUserLogRow` 30일 cleanup은 성공 이력 summary는 유지하되 row-level PII 장기 보관을 줄이는 최종형 정책이다.
- G08 10MB/5,000행 제한은 대용량 worker 없이 Global B2C 첫 판매 가능한 안정 범위를 명확히 하는 정책이다.

완전 종료 판정:

- G05~G08 구현, G09 Backend/User Web 통합 QA, 문서 상태 업데이트가 완료되어 `01_IMPORT_JOB_PERSISTENCE`는 최종 서비스 형태 기준으로 완전 종료한다.
- 이후 대용량 import worker, 범용 ExportJob, 일정/회의록 import, ImportJob Admin 전용 화면/API, 결제/구독 연동은 01의 미완성이 아니라 별도 TODO 또는 12/post-12 후속 범위로 본다.

완전 종료 문서 동기화 결과:

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE`: G05~G09 완료 체크, 완료일, Backend/User Web QA 결과를 기록하고 상태를 최종 서비스 형태 완료로 변경했다.
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`: `NBA-006 ImportJob persistence/resume API`가 G01~G09 전체 기준으로 최종 종료됐음을 반영했다.
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`: DataImport persistence/resume, row detail 만료 안내, import 제한 초과 안내까지 포함해 Import 관련 productization gap이 닫혔음을 반영했다.
