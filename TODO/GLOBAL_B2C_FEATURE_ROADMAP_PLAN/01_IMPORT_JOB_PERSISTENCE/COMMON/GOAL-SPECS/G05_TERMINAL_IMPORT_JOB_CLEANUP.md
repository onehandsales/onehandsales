# G05 Terminal ImportJob Cleanup

상태: Confirmed
결정일: 2026-08-03
성격: 01 ImportJob Persistence 최종 서비스 형태 보강 구현 명세

## 0. 착수/완료 체크리스트

- [ ] Request/Response 영향 확인: 신규 User/Admin HTTP API를 만들지 않고 내부 command/result만 구현한다.
- [ ] Business Logic 확인: terminal status, cutoff, storage delete 재시도, DB 삭제 가능 조건을 이 문서 기준으로 구현한다.
- [ ] User Flow 확인: User Web 화면 변경이 없는 goal이며, 사용자-facing 문구를 추가하지 않는다.
- [ ] UX/UI 영향 확인: 직접 화면 변경은 없지만 `AGENT/UXUI_AGENT` 기준에 어긋나는 사용자-facing 문구나 Admin/User 화면을 추가하지 않는다.
- [ ] DB/Prisma 확인: `BE/prisma/schema.prisma`, `BE/prisma/migrations`, `BE-TODO/DB-SCHEMA.md`를 대조하고 신규 migration이 필요 없는지 확인한다.
- [ ] SQL 주석 확인: Prisma migration SQL, raw SQL, cleanup/retention 보조 SQL을 작성하면 한글 `COMMENT ON` 또는 `-- 한글 주석`으로 목적, 보관/삭제 기준, 안전 조건을 남긴다.
- [ ] 소프트웨어 아키텍처/컨벤션 확인: `AGENT/SOFTWARE_AGENT/BACKEND_AGENT`, `AGENT/SOFTWARE_AGENT/DB_SCHEMA`를 읽고 use case, repository, runner, logging 구조를 맞춘다.
- [ ] 코드 주석 확인: cleanup 대상 선정, storage delete 재시도, DB 삭제 skip 조건, runner 중복 실행 방지에는 한글 주석을 반드시 추가한다.
- [ ] 테스트 확인: terminal status, active 제외, legacy fallback, storage delete 실패, env flag runner, safe summary log를 검증한다.
- [ ] 문서 확인: 구현 결과가 `COMMON/FINAL-SERVICE-SHAPE.md`, `COMMON/GOAL-WORK-ORDER.md`, `BE-TODO/API-TODO.md`와 충돌하지 않는지 갱신한다.

## 1. 목표

terminal 상태가 된 ImportJob 임시 snapshot을 7일 보관 후 자동 정리한다.

이 goal은 G01~G04에서 완료한 import persistence/resume 기능을 확장하는 사용자-facing 기능이 아니다. Global B2C 최종 서비스 형태에 맞게 개인정보가 포함될 수 있는 import raw snapshot 보관 기간을 짧게 유지하는 Backend 운영 위생 기능이다.

G06 이후 정상 flow에서는 원본 파일 binary가 upload 직후 삭제되어 있어야 한다. G05의 storage delete 재시도는 legacy data 또는 즉시 삭제 실패 파일을 처리하기 위한 방어 로직이다.

## 2. 포함 범위

- terminal ImportJob cleanup use case
- cleanup 대상 조회 repository method
- ImportJob aggregate batch delete repository method
- storage delete 재시도
- env flag 기반 optional runner
- safe summary log
- unit test와 data-import regression test

## 3. 제외 범위

- Admin Web 화면
- `/admin/api/*` cleanup 조회 API
- User Web 화면 변경
- ImportJob row snapshot 장기 보관
- 원본 파일 영구 보관
- 대용량 import worker
- 범용 ExportJob
- 결제/구독/entitlement

## 4. 확정 정책

| 항목 | 정책 |
|---|---|
| 보관 기간 | terminal 상태가 된 뒤 7일 |
| 적용 대상 | 기존 terminal 데이터와 신규 terminal 데이터 모두 |
| terminal status | `CONFIRMED`, `CANCELED`, `EXPIRED`, `FAILED` |
| active status | cleanup 대상 아님 |
| batch size 기본값 | 500 |
| 실행 방식 | env flag 기반 optional runner |
| Admin 표시 | 없음. safe summary log만 사용 |

terminal 기준 시점:

- `CONFIRMED`: `confirmedAt`
- `CANCELED`: `canceledAt`
- `FAILED`: `failedAt`
- `EXPIRED`: `expiresAt`
- 비정상 legacy fallback: `updatedAt`

## 5. Command / Result 계약

HTTP API를 만들지 않는다. Application use case는 내부 command/result 계약만 가진다.

```ts
export interface CleanupTerminalImportJobsCommand {
  readonly now: Date;
  readonly retentionDays: 7;
  readonly batchSize: number;
}

export interface CleanupTerminalImportJobsResult {
  readonly deletedJobCount: number;
  readonly fileDeleteRetriedCount: number;
  readonly fileDeleteFailedCount: number;
  readonly skippedJobCount: number;
  readonly cleanupCutoffAt: string;
}
```

`retentionDays`는 7로 고정한다. 다른 값이 들어오면 구현 오류로 보고 실패시킨다.

## 6. Repository 계약

`ImportJobRepository`에 cleanup 전용 method를 추가한다.

예상 계약:

```ts
export interface ListTerminalImportJobsForCleanupInput {
  readonly now: Date;
  readonly retentionDays: 7;
  readonly limit: number;
}

export interface TerminalImportJobCleanupCandidate {
  readonly id: string;
  readonly userId: string;
  readonly status: PersistentImportJobStatus;
  readonly confirmedAt: Date | null;
  readonly canceledAt: Date | null;
  readonly failedAt: Date | null;
  readonly expiresAt: Date;
  readonly updatedAt: Date;
  readonly uploadedFile: {
    readonly storageKey: string;
    readonly deletedAt: Date | null;
  } | null;
}

export interface DeleteImportJobsInput {
  readonly importJobIds: readonly string[];
}
```

삭제는 `ImportJob` 기준으로 수행한다. Prisma schema의 `onDelete: Cascade`로 `ImportJobRow`, `ImportJobError`, `ImportUploadedFile`이 함께 삭제된다.

## 7. Business Logic

1. command의 `retentionDays`가 7인지 확인한다.
2. batch size를 양의 정수로 정규화한다. 기본값은 500이다.
3. terminal 상태이고 terminal 기준 시점이 `now - 7일`보다 오래된 job을 조회한다.
4. active 상태 job은 조회하지 않는다.
5. `uploadedFile`이 없거나 `uploadedFile.deletedAt`이 있으면 DB 삭제 가능 대상으로 본다.
6. `uploadedFile.deletedAt`이 없으면 storage delete를 재시도한다.
7. storage delete가 성공하면 DB 삭제 가능 대상으로 본다.
8. storage delete가 실패하면 해당 job은 DB 삭제하지 않는다.
9. DB 삭제 가능 job만 `ImportJob` 기준으로 batch 삭제한다.
10. safe summary log만 남긴다.

## 8. Storage Delete 기준

storage adapter의 delete는 재시도 가능하고 멱등적으로 동작해야 한다.

현재 local adapter는 `rm(..., { force: true })`를 사용하므로 이미 삭제된 파일에도 실패하지 않는다. S3 등 외부 storage adapter가 추가될 때도 "이미 없음"은 성공으로 취급해야 한다.

storage delete 실패 시:

- `ImportJob` DB row를 삭제하지 않는다.
- `storageKey` 추적 metadata를 잃지 않는다.
- safe summary log의 `fileDeleteFailedCount`만 증가시킨다.
- raw `storageKey`, 파일명, 사용자 입력값은 log에 남기지 않는다.

## 9. Logging

성공 로그 예시:

```json
{
  "event": "importJob.cleanup.completed",
  "deletedJobCount": 100,
  "fileDeleteRetriedCount": 3,
  "fileDeleteFailedCount": 0,
  "skippedJobCount": 0,
  "cleanupCutoffAt": "2026-08-05T00:00:00.000Z"
}
```

실패 로그 예시:

```json
{
  "event": "importJob.cleanup.failed",
  "safeErrorCode": "IMPORT_JOB_CLEANUP_FAILED"
}
```

로그 금지:

- import row 원문
- 업로드 파일명
- `storageKey`
- job ID 목록
- 사용자 email/phone/name
- provider raw/prompt/token/quota detail

## 10. Runner

환경 변수:

```env
IMPORT_JOB_CLEANUP_ENABLED=true
IMPORT_JOB_CLEANUP_INTERVAL_MS=300000
IMPORT_JOB_CLEANUP_BATCH_SIZE=500
```

구현 기준:

- `OnModuleInit`, `OnModuleDestroy` 패턴을 사용한다.
- `IMPORT_JOB_CLEANUP_ENABLED`가 `true` 또는 `1`일 때만 timer를 시작한다.
- 이전 tick 실행 중이면 다음 tick은 건너뛴다.
- interval과 batch size는 양의 정수만 허용하고, 잘못된 값은 기본값을 쓴다.
- runner class와 복잡한 block에는 한글 주석을 추가한다.

## 11. DB/Prisma 영향

신규 table과 migration은 만들지 않는다.

기존 schema를 사용한다.

- `ImportJob.status`
- `ImportJob.confirmedAt`
- `ImportJob.canceledAt`
- `ImportJob.failedAt`
- `ImportJob.expiresAt`
- `ImportJob.updatedAt`
- `ImportUploadedFile.deletedAt`
- `ImportUploadedFile.storageKey`

G05 삭제 시 `ImportUserLog`, `ImportUserLogRow`, 실제 CRM domain row는 삭제하지 않는다. 단, `ImportUserLogRow` 30일 cleanup은 G07에서 별도로 구현한다.

## 12. 검증 기준

Backend unit test:

- terminal 된 지 7일 지난 `CONFIRMED` job을 삭제한다.
- terminal 된 지 6일 지난 job은 유지한다.
- active status job은 삭제하지 않는다.
- `EXPIRED` job은 `expiresAt + 7일` 기준으로 삭제한다.
- `uploadedFile.deletedAt`이 없으면 storage delete를 재시도한다.
- storage delete 실패 job은 DB 삭제하지 않는다.
- `ImportUserLog` 삭제 계약이 없는지 확인한다.
- summary log에 raw 값이 들어가지 않는지 확인한다.
- runner가 env flag off일 때 timer를 시작하지 않는다.
- runner가 env flag on일 때 use case를 batch size 500 기본값으로 실행한다.

검증 명령:

```powershell
cd BE
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run test -- data-import
pnpm.cmd run build
```

User Web 변경이 없으므로 User Web build/E2E는 필수 범위가 아니다. 단 shared type 또는 route 영향이 생기면 User Web 검증을 추가한다.

## 13. 완료 기준

- terminal ImportJob cleanup use case가 있다.
- cleanup repository method가 ownership과 terminal 상태를 안전하게 처리한다.
- storage delete 실패 job은 DB 삭제하지 않는다.
- env flag 기반 runner가 있다.
- safe summary log만 남긴다.
- Admin 화면/API가 추가되지 않는다.
- G05 실행으로는 `ImportUserLog`, `ImportUserLogRow`, 실제 CRM 데이터가 삭제되지 않는다.
- 관련 테스트가 통과한다.
