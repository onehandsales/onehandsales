# G07 Import Success Row Retention

상태: Confirmed
결정일: 2026-08-03
성격: 01 ImportJob Persistence 최종 서비스 형태 보강 구현 명세

## 0. 착수/완료 체크리스트

- [ ] Request/Response 영향 확인: `ImportUserLog` 상세 response에서 row detail이 비어 있을 수 있음을 정상 계약으로 처리한다.
- [ ] Business Logic 확인: `ImportUserLogRow` 30일 cutoff, batch 조회, row 삭제, summary/domain 유지 조건을 이 문서 기준으로 구현한다.
- [ ] User Flow 확인: `/app/import/:importUserLogId`에서 row detail 만료 상태를 정상 안내로 보여준다.
- [ ] UX/UI 확인: User Web 변경 시 `AGENT/UXUI_AGENT`, `FE-TODO/USER-WEB-TODO.md`, `COMMON/USER-FLOW.md`를 대조한다.
- [ ] DB/Prisma 확인: `BE/prisma/schema.prisma`, `BE/prisma/migrations`, `BE-TODO/DB-SCHEMA.md`를 대조하고 신규 migration이 필요한지 확인한다.
- [ ] 소프트웨어 아키텍처/컨벤션 확인: `AGENT/SOFTWARE_AGENT/BACKEND_AGENT`, `AGENT/SOFTWARE_AGENT/FRONT_AGENT`, `AGENT/SOFTWARE_AGENT/DB_SCHEMA`를 읽고 cleanup use case, repository, FE query 상태 처리를 맞춘다.
- [ ] 코드 주석 확인: 30일 cutoff 계산, batch 삭제, `ImportUserLog`/domain row 보존, row detail 빈 상태 UI 처리에는 한글 주석을 반드시 추가한다.
- [ ] 테스트 확인: 31일 row 삭제, 29일 row 유지, summary/domain 유지, 빈 row detail UI를 검증한다.
- [ ] 문서 확인: 구현 결과가 `COMMON/API-SPEC/IMPORT_JOB_API.md`, `BE-TODO/API-TODO.md`, `FE-TODO/USER-WEB-TODO.md`와 충돌하지 않는지 갱신한다.

## 1. 목표

가져오기 성공 이력 summary는 장기 보관하되, row-level 성공 snapshot인 `ImportUserLogRow`는 30일 후 삭제한다.

`ImportJobRow`는 G05에서 terminal 7일 후 삭제한다. 그러나 confirm 성공 시 `ImportUserLogRow.submittedDataJson`에도 row별 제출 데이터가 남는다. Global B2C 최종 서비스 형태에서는 이 중복 snapshot도 장기 보관하지 않는다.

## 2. 포함 범위

- `ImportUserLogRow` 30일 retention cleanup use case
- `ImportUserLogRow` batch delete repository method
- 기존 `ImportUserLog` summary 유지
- User Web import detail의 row detail 만료 상태 대응
- Backend test
- 필요한 경우 User Web test

## 3. 제외 범위

- `ImportUserLog` summary 삭제
- 실제 Company/Contact/Product/Deal 삭제
- row data 축약 보관
- Admin 화면/API
- 데이터 export 정책 변경
- 결제/구독 정책

## 4. 확정 정책

| 항목 | 정책 |
|---|---|
| summary 보관 | `ImportUserLog`는 장기 유지 |
| row-level 보관 | `ImportUserLogRow`는 생성 후 30일 |
| cleanup 방식 | row 자체 삭제. 축약하지 않음 |
| 실제 CRM 데이터 | 유지 |
| 사용자 표시 | row detail이 만료되어도 import summary는 보여준다 |

## 5. Command / Result 계약

HTTP API를 만들지 않는다. 내부 use case 계약만 둔다.

```ts
export interface CleanupImportUserLogRowsCommand {
  readonly now: Date;
  readonly retentionDays: 30;
  readonly batchSize: number;
}

export interface CleanupImportUserLogRowsResult {
  readonly deletedRowCount: number;
  readonly cleanupCutoffAt: string;
}
```

`retentionDays`는 30으로 고정한다. 다른 값은 구현 오류로 보고 실패시킨다.

## 6. Repository 계약

예상 repository method:

```ts
deleteImportUserLogRowsBefore(
  cutoff: Date,
  batchSize: number
): Promise<number>;
```

구현은 먼저 삭제 대상 row id를 `createdAt asc, id asc` 기준으로 batch 조회한 뒤, 해당 id만 `deleteMany` 한다.

## 7. User Web 영향

`/app/import/:importUserLogId` 상세 화면은 `ImportUserLogRow`가 없을 수 있음을 정상 상태로 처리한다.

예시 문구:

```text
행별 상세 내역은 보관 기간이 지나 정리됐어요. 가져오기 요약은 계속 확인할 수 있어요.
```

User Web은 summary count와 createdAt, targetType, importedRowCount를 계속 표시한다. row detail이 비어 있어도 오류 상태로 보지 않는다.

## 8. Logging

summary log만 남긴다.

```json
{
  "event": "importUserLogRows.cleanup.completed",
  "deletedRowCount": 500,
  "cleanupCutoffAt": "2026-07-04T00:00:00.000Z"
}
```

로그 금지:

- `submittedDataJson`
- target label 목록
- 사용자 email/phone/name
- import log id 배열

## 9. Runner

G05 terminal cleanup runner와 같은 import retention cleanup runner에서 순차 실행해도 된다.

기준:

- env flag가 꺼져 있으면 실행하지 않는다.
- 이전 tick 실행 중이면 건너뛴다.
- batch size 기본값은 500이다.
- terminal ImportJob cleanup 실패가 있어도 ImportUserLogRow cleanup 실패/성공은 safe summary로만 기록한다.

## 10. 검증 기준

Backend test:

- 31일 지난 `ImportUserLogRow`를 삭제한다.
- 29일 지난 `ImportUserLogRow`는 유지한다.
- `ImportUserLog` row는 삭제하지 않는다.
- 실제 domain row는 삭제하지 않는다.
- summary log에 `submittedDataJson`이 들어가지 않는다.

User Web test 또는 component 확인:

- import log rows가 빈 배열이어도 summary 화면이 깨지지 않는다.
- row detail 만료 안내가 표시된다.

검증 명령:

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

## 11. 완료 기준

- `ImportUserLogRow` 30일 cleanup이 구현되어 있다.
- `ImportUserLog` summary는 유지된다.
- row detail이 없는 import log 상세가 정상 UX로 표시된다.
- raw submitted row data가 장기 보관되지 않는다.
