# Service QA Results

상태: Not Started
작성일: 2026-08-12

## 1. 환경 기록

| 항목 | 결과 | 비고 |
|---|---|---|
| Node | Pending | 실제 값 기록 |
| pnpm | Pending | 실제 값 기록 |
| Docker | Pending | 실행 가능 여부 |
| BE `.env` | Pending | 값은 기록하지 않음 |
| User Web `.env` | Pending | 값은 기록하지 않음 |
| Admin Web `.env` | Pending | 값은 기록하지 않음 |
| DB 대상 | Pending | local/shared/production 중 하나 |
| Chrome channel | Pending | 설치/실행 가능 여부 |
| Edge channel | Pending | 설치/실행 가능 여부 |

## 2. 자동 검증 결과

| 영역 | 명령 | 결과 | 실행일 | 비고 |
|---|---|---|---|---|
| BE | `pnpm.cmd run typecheck` | Pending | - | - |
| BE | `pnpm.cmd run lint` | Pending | - | - |
| BE | `pnpm.cmd run test` | Pending | - | - |
| BE | `pnpm.cmd run build` | Pending | - | - |
| BE | `pnpm.cmd prisma:validate` | Pending | - | - |
| BE | `pnpm.cmd prisma:generate` | Pending | - | - |
| BE | `pnpm.cmd exec prisma migrate status` | Pending | - | - |
| User Web | `pnpm.cmd run typecheck` | Pending | - | - |
| User Web | `pnpm.cmd run lint` | Pending | - | - |
| User Web | `pnpm.cmd run build` | Pending | - | - |
| Admin Web | `pnpm.cmd run typecheck` | Pending | - | - |
| Admin Web | `pnpm.cmd run lint` | Pending | - | - |
| Admin Web | `pnpm.cmd run build` | Pending | - | - |

## 3. Playwright 결과

| 영역 | 명령 | 결과 | 실행일 | 비고 |
|---|---|---|---|---|
| User Web | `pnpm.cmd run test:e2e` | Pending | - | - |
| User Web | `pnpm.cmd run test:e2e:mobile` | Pending | - | - |
| User Web | `pnpm.cmd run test:e2e:browsers` | Pending | - | - |
| User Web | `pnpm.cmd run test:e2e:analytics` | Pending | - | - |
| Admin Web | `pnpm.cmd run test:e2e` | Pending | - | - |

## 4. 실제 BE 통합 QA 결과

| 시나리오 | 결과 | 실행일 | 비고 |
|---|---|---|---|
| 로그인/보호 라우트 | Pending | - | - |
| 회사 CRUD/복구 | Pending | - | - |
| 담당자 CRUD/복구 | Pending | - | - |
| 제품 CRUD/복구 | Pending | - | - |
| 딜 CRUD/상태/활동 | Pending | - | - |
| 일정 CRUD | Pending | - | - |
| 회의록 CRUD/딜 연결 | Pending | - | - |
| 명함 OCR | Pending | - | provider 직접 호출 여부 기록 |
| Import | Pending | - | - |
| Search | Pending | - | 삭제 데이터 미노출 포함 |
| Trash | Pending | - | - |
| Settings/Profile/Devices | Pending | - | - |
| Admin Web 권한/조회 | Pending | - | - |
| Admin 민감 원문/감사 로그 | Pending | - | - |

## 5. 수동 UX/브라우저 QA 결과

| 항목 | 결과 | 실행일 | 비고 |
|---|---|---|---|
| Desktop Chrome 1440px | Pending | - | - |
| Mobile Chrome 390px | Pending | - | - |
| Mobile Chrome 360px | Pending | - | - |
| Desktop Edge | Pending | - | 미설치 시 BLOCKED |
| Mobile Edge 390px | Pending | - | 미설치 시 BLOCKED |
| Browser zoom 125% | Pending | - | - |
| Keyboard/focus 기본 | Pending | - | - |

## 6. 최종 판단

최종 상태: Pending

남은 Open 이슈:

- Pending

출시/베타 진행 판단:

- Pending

## 7. 기능 선별 QA 요약

| 영역 | 화면/API | 판단 | 이유 | 조치 | 우선순위 |
|---|---|---|---|---|---|
| 로그인 | `/login`, `/auth/callback`, `/api/auth/*` | Pending | - | - | - |
| 회사 | `/app/companies`, `/api/companies/*` | Pending | - | - | - |
| 담당자 | `/app/contacts`, `/api/contacts/*` | Pending | - | - | - |
| 제품 | `/app/products`, `/api/products/*` | Pending | - | - | - |
| 딜 | `/app/deals`, `/api/deals/*` | Pending | - | - | - |
| 일정 | `/app/schedules`, `/api/schedules/*` | Pending | - | - | - |
| 회의록 | `/app/meeting-notes`, `/api/meeting-notes/*` | Pending | - | - | - |
| Search | `/app`, search modal, `/api/search` | Pending | - | - | - |
| Trash | `/app/trash`, `/api/trash/*` | Pending | - | - | - |
| Import | `/app/import`, `/api/imports/*` | Pending | - | - | - |
| Notification | `/app/notifications`, `/api/notifications/*` | Pending | - | - | - |
| AI report/follow-up | `/app/schedules/week`, follow-up APIs | Pending | - | - | - |
| Admin Web | `/users`, `/analytics`, `/audit-logs`, `/system` | Pending | - | - | - |

판단 값은 `KEEP`, `FIX`, `IMPROVE`, `REMOVE`, `HIDE`, `DEFER`, `RETHINK` 중 하나를 사용한다.

## 8. 일일 QA 마감 기록

| 일자 | 오늘 확인한 영역 | 즉시 수정한 항목 | 내일 바로 볼 항목 | 보류/재검토 항목 |
|---|---|---|---|---|
| 2026-08-13 | Pending | Pending | Pending | Pending |
