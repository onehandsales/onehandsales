# Goal Specs

상태: G01-G04 Done / G05-G06 Ready For Goal

## 1. 목적

이 폴더는 `BEFORE_12_TASKS`를 `/goal`로 실행할 때 각 작업 단위가 바로 착수될 수 있도록 상세 명세를 둔다.

`COMMON/GOAL-WORK-ORDER.md`는 실행 순서이고, 이 폴더의 문서는 각 `/goal`의 작업 계약이다.

## 2. Goal 목록

| Goal | PRE12 ID | 상태 | 문서 | 목적 |
| --- | --- | --- | --- | --- |
| G01 | `PRE12-F04` | Done / User-Assumed Provider Smoke Accepted | `G01_PROVIDER_SMOKE_CLOSEOUT.md` | Gmail/Microsoft provider smoke closeout |
| G02 | `PRE12-F31` | Done | `G02_10_MOBILE_CHECKLIST_CLOSEOUT.md` | 10 Mobile 문서 체크리스트 정합성 |
| G03 | `PRE12-F32` | Done | `G03_USER_WEB_ROUTE_ARCHITECTURE_CLOSEOUT.md` | User Web route/architecture 정합성 |
| G04 | `PRE12-F33` | Done | `G04_11_ADMIN_CHECKLIST_CLOSEOUT.md` | 11 Admin 문서 checklist/goal index 정합성 |
| G05 | `PRE12-F34` | Ready For Goal | `G05_ADMIN_WEB_ARCHITECTURE_LEGACY_CLOSEOUT.md` | Admin Web architecture/legacy route 정합성 |
| G06 | closeout | Ready For Goal | `G06_BEFORE_12_CLOSEOUT_AND_HANDOFF.md` | 12 Billing 착수 전 handoff |

## 3. 실행 규칙

- 한 번의 `/goal`에는 이 폴더의 goal 문서 하나만 넣는다.
- 모든 goal은 실제 코드 상태를 기준으로 문서를 정리한다.
- stale 문서를 기준으로 route/API를 되돌리지 않는다.
- 새 API, 새 DB, 새 route, 새 billing 기능은 만들지 않는다.
- request/response/business logic/user flow/DB 영향이 생기면 해당 계약과 `BE/prisma`를 먼저 확인한다.
- 코드 변경이 발생하면 한글 주석 규칙을 지키고 관련 `typecheck`/`lint`를 실행한다.
- DB 변경이 발생하면 한국어 Prisma 주석 또는 SQL comment를 남긴다.
- G06은 G01~G05 완료 전에는 완료로 닫지 않는다.

## 4. 실행 순서

```text
G01 -> G02 -> G03 -> G04 -> G05 -> G06
```

## 5. 권장 실행 문구

```text
/goal TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G01_PROVIDER_SMOKE_CLOSEOUT.md 기준으로 G01을 진행해줘.
```

```text
/goal TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G02_10_MOBILE_CHECKLIST_CLOSEOUT.md 기준으로 G02를 진행해줘.
```

```text
/goal TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G03_USER_WEB_ROUTE_ARCHITECTURE_CLOSEOUT.md 기준으로 G03을 진행해줘.
```

```text
/goal TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G04_11_ADMIN_CHECKLIST_CLOSEOUT.md 기준으로 G04를 진행해줘.
```

```text
/goal TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G05_ADMIN_WEB_ARCHITECTURE_LEGACY_CLOSEOUT.md 기준으로 G05를 진행해줘.
```

```text
/goal TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G06_BEFORE_12_CLOSEOUT_AND_HANDOFF.md 기준으로 G06을 진행해줘.
```

## 6. 관련 문서

- `TODO/BEFORE_12_TASKS/COMMON/GOAL-WORK-ORDER.md`
- `TODO/BEFORE_12_TASKS/COMMON/SCOPE.md`
- `TODO/BEFORE_12_TASKS/COMMON/API-SPEC/NO_NEW_API_CONTRACT.md`
