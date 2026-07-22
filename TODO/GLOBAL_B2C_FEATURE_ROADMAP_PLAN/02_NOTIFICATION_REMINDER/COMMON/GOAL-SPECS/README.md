# Goal Specs

상태: Confirmed
구현 상태: G01 Done / G02 Done / G03 Ready

## 1. 목적

이 폴더는 `02_NOTIFICATION_REMINDER`를 `/goal`로 실행할 때 각 작업 단위가 바로 구현에 들어갈 수 있도록 상세 명세를 둔다.

## 2. Goal 목록

| Goal | 상태 | 문서 | 목적 |
|---|---|---|---|
| G01 | Done | `G01_DB_NOTIFICATION_FOUNDATION.md` | Prisma schema, migration, repository/encryption 기반 |
| G02 | Done | `G02_BACKEND_NOTIFICATION_API.md` | User API와 notification application service |
| G03 | Ready | `G03_REMINDER_GENERATION_DELIVERY.md` | 일정/딜 reminder 예약, due processor, email/push adapter |
| G04 | Ready after G02/G03 | `G04_USER_WEB_NOTIFICATION_UX.md` | `/app/notifications`, unread badge, settings, push UX |
| G05 | Ready after G01~G04 | `G05_QA_REVIEW_CLOSEOUT.md` | 통합 QA와 검토 closeout |

## 3. 실행 규칙

- G01 완료 전 G02를 시작하지 않는다.
- G02 완료 전 G03/G04를 시작하지 않는다.
- G03과 G04는 API가 안정되면 병행 가능하지만, 같은 turn에서는 충돌 파일을 확인한다.
- G05는 G01~G04 완료 후 실행한다.
- 각 goal은 해당 문서의 완료 기준을 만족해야 완료로 본다.
