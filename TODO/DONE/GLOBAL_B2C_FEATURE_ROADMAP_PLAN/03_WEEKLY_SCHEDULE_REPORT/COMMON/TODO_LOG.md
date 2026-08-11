# TODO Log

## 2026-08-04 Final Service Follow-up Audit

### 결론

- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`, `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`, `01_IMPORT_JOB_PERSISTENCE`, 실제 `BE`/`FE` 구현 상태를 다시 대조했다.
- 03 범위에서 추가 구현할 후속 작업은 없다.
- Google-origin active schedule의 source/meeting URL 반영과 currency-aware weekly report는 04/08 후속 구현으로 실제 코드에 반영되어 있다.
- AI/고급 주간 영업 리포트, PDF/범용 ExportJob, 반복 일정, Google Calendar export/write/realtime webhook/watch, 회의록 follow-up 알림/자동 발송은 03 미완료가 아니라 별도 계획 또는 post-12 후보로 유지한다.
- 상세 기록: `COMMON/FINAL-SERVICE-FOLLOWUP-AUDIT.md`.

### 재검증

| 명령 | 결과 |
|---|---|
| `cd BE; pnpm.cmd test -- schedule` | 통과, 11 suites / 56 tests |
| `cd FE/user-web; pnpm.cmd test:e2e -- tests/e2e/weekly-schedule-report-ux.spec.ts` | 통과, 1 test |

상태: Closed
최종 업데이트: 2026-07-22

## 2026-07-22 G04 QA Review Closeout

### 범위

- 대상: 03 Weekly Schedule Report
- 포함: `GET /api/schedules/week`, `GET /api/schedules/week/export/xlsx`, User Web `/app/schedules/week`, `/app/schedules` 진입 버튼, 동기식 Excel 다운로드
- 제외 유지: `/api/exports`, `ExportJob`, `/app/export`, PDF, 반복 일정 정식 모델, 제품 요약, AI 요약, 민감정보 포함 export, 결제/Admin/앱 전체 다국어/통화 모델, product analytics

### Backend 검증 결과

| 명령 | 결과 |
|---|---|
| `cd BE; pnpm.cmd run prisma:validate` | 통과 |
| `cd BE; pnpm.cmd run typecheck` | 통과 |
| `cd BE; pnpm.cmd run lint` | 통과 |
| `cd BE; pnpm.cmd run test -- schedule` | 통과, 2 suites / 19 tests |
| `cd BE; pnpm.cmd run build` | 통과 |

### User Web 검증 결과

| 명령 | 결과 |
|---|---|
| `cd FE/user-web; pnpm.cmd run typecheck` | 통과 |
| `cd FE/user-web; pnpm.cmd run lint` | 통과 |
| `cd FE/user-web; pnpm.cmd run build` | 통과 |
| `cd FE/user-web; pnpm.cmd run test:e2e` | 통과, 20 tests |
| `cd FE/user-web; pnpm.cmd run test:e2e:mobile` | 통과, 12 tests, 390px/360px Chrome/Edge |

### 수동 검토 결과

- API spec과 구현 결과가 일치한다.
- `weekStart`는 date-only 값으로 유지되고, 월요일이 아닌 값은 Backend에서 400 처리한다.
- invalid `timeZone`은 Backend에서 400 처리한다.
- 일정 없는 주도 7개 day를 반환하고, User Web은 empty state를 표시한다.
- 다일 일정은 겹치는 day bucket에 표시된다.
- Excel 다운로드는 현재 보고서와 같은 `weekStart`, `timeZone`으로 호출된다.
- 일정 메모 본문, private memo, meeting note body는 response/export/log에 노출되지 않는다.
- `hasMemo`만 response와 화면에 사용한다.
- cross-user 일정/딜/회사/담당자는 response/export에 섞이지 않는다.
- 새 데이터베이스, Prisma model/table/column/index/migration은 생성하지 않았다.
- DB 관련 projection/service/controller 구현에는 한글 주석이 있다.
- Global B2C first-sale gate 제외 범위는 구현에 섞이지 않았다.

### 잔여 리스크

- User Web build에서 기존 Tailwind `duration-[500ms]` ambiguous class 경고와 chunk size 경고가 반복된다. 이번 03 변경으로 인한 실패는 아니며 별도 성능/정리 이슈로 분리한다.
