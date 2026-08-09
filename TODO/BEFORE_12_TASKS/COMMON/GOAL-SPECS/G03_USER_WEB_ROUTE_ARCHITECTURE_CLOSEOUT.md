# G03 User Web Route Architecture Closeout

상태: Ready For Goal
연결 PRE12 ID: `PRE12-F32`
성격: User Web route/architecture 문서 정합성 closeout

## 0. 착수 체크리스트

- [ ] `FE/user-web/src/app/router/router.tsx`를 확인한다.
- [ ] `FE/user-web/ARCHITECTURE.md`와 `FE/ARCHITECTURE.md`를 확인한다.
- [ ] `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`를 확인한다.
- [ ] `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`를 확인한다.
- [ ] User Web은 `/api/*`만 호출해야 한다는 기준을 확인한다.
- [ ] 새 route/API를 만들지 않는 기준을 확인한다.
- [ ] 코드 변경 발생 시 한글 주석 규칙과 typecheck/lint gate를 확인한다.

## 1. 목표

User Web route와 architecture 문서를 실제 코드 상태에 맞춘다.

## 2. 포함 범위

- `/app/notifications` 활성 상태 문서 반영
- `/app/schedules/week` 활성 상태 문서 반영
- `/app/export` redirect 상태 문서 반영
- Notification Backend/API 존재 상태 문서 반영
- generic export 잔여 FE 코드와 post-12 후보 상태 구분
- AGENT UXUI/SOFTWARE 문서 중 route 상태가 stale인 부분 확인 및 정리
- User Web route가 Admin API를 호출하지 않는지 정적 확인

## 3. 제외 범위

- `/app/notifications` rollback
- `/app/schedules/week` rollback
- `/app/export` 활성화
- generic ExportJob API/DB/화면 활성화
- Notification 신규 source/TTL/cleanup 정책 구현
- User Web 신규 route 추가
- Admin API 호출 추가

## 4. 확인 대상

- `FE/user-web/src/app/router/router.tsx`
- `FE/user-web/src/features/notification`
- `FE/user-web/src/features/import-export`
- `FE/user-web/src/features/follow-up-delivery`
- `FE/ARCHITECTURE.md`
- `FE/user-web/ARCHITECTURE.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md`

## 5. 실제 route 기준

현재 route 기준:

- `/app/schedules/week`: `ScheduleWeekPage` 활성
- `/app/notifications`: `NotificationsPage` 활성
- `/app/export`: `/app` redirect
- `/contacts/scan`, `/app/contacts/scan`: `/app/business-cards` redirect
- `/import/review/:importJobId`, `/app/import/review/:importJobId`: import review route 활성

문서는 위 실제 상태와 맞아야 한다.

## 6. Request/Response 체크

G03은 API 변경 작업이 아니다.

- User Web API client path를 바꾸지 않는다.
- `/api/exports`를 연결하지 않는다.
- Notification API를 새로 만들지 않는다.
- request/response 변경 필요가 보이면 post-12 후보로 기록한다.

## 7. Business Logic / User Flow 체크

G03은 제품 business logic 또는 사용자 플로우 변경 작업이 아니다.

- `/app/notifications`는 현재 활성 route로 문서화하되 알림 정책, source, TTL, cleanup을 새로 정의하지 않는다.
- `/app/schedules/week`는 현재 활성 route로 문서화하되 일정 생성/수정 로직을 바꾸지 않는다.
- `/app/export`는 redirect 상태로 문서화하되 generic export flow를 열지 않는다.
- User Web은 `/api/*`만 호출하고 `/admin/api/*` 호출 flow를 만들지 않는다.
- 사용자 플로우 변경 필요가 보이면 G03에서 구현하지 않고 post-12 후보로 기록한다.

## 8. DB/Prisma 체크

G03은 DB schema 또는 Prisma 변경 작업이 아니다.

- Prisma model, migration, seed를 추가하지 않는다.
- generic export 관련 DB/API가 필요해도 G03에서 `ExportJob`류 모델을 만들지 않는다.
- Notification 관련 TTL/cleanup 저장 정책이 필요해도 G03에서 schema를 바꾸지 않는다.
- DB 변경 필요가 보이면 post-12 후보로 기록한다.

## 9. UX/UI 체크

- Notion식 sidebar/page/database 흐름을 유지한다.
- Attio식 record 관계 흐름을 훼손하지 않는다.
- 문서 변경만으로 사용자가 보는 route나 메뉴 노출이 달라지지 않는다.
- 사용자 노출 문구를 바꾸면 해요체를 따른다.

## 10. 작업 순서

1. User Web router의 실제 route를 표로 정리한다.
2. User Web architecture 문서의 route 설명을 실제 상태와 비교한다.
3. AGENT UXUI/SOFTWARE 문서의 stale route 설명을 확인한다.
4. `/app/notifications`, `/app/schedules/week`, `/app/export` 상태를 정확히 반영한다.
5. `/admin/api` 의존이 없는지 정적 확인한다.
6. 코드 변경 없이 문서 정합성으로 닫는다. 필요한 경우에만 최소 코드 정리를 수행한다.

## 11. 검증 명령

Frontend:

```bash
cd FE/user-web
pnpm run typecheck
pnpm run lint
```

문서/정적 확인:

```bash
rg -n "/admin/api" FE/user-web/src
rg -n "/app/notifications|/app/schedules/week|/app/export" FE/user-web/src/app/router/router.tsx FE/user-web/ARCHITECTURE.md FE/ARCHITECTURE.md AGENT/UXUI_AGENT AGENT/SOFTWARE_AGENT/FRONT_AGENT
git diff --check
```

## 12. 완료 기준

- [ ] User Web architecture 문서가 `/app/notifications` 활성 상태를 반영한다.
- [ ] User Web architecture 문서가 `/app/schedules/week` 활성 상태를 반영한다.
- [ ] User Web architecture 문서가 `/app/export` redirect 상태를 반영한다.
- [ ] AGENT 문서의 stale route 설명이 실제 코드와 충돌하지 않게 정리됐다.
- [ ] route 정합성을 위해 코드를 되돌리거나 새 route를 열지 않았다.
- [ ] User Web에서 `/admin/api/*` 호출이 없다.
- [ ] 새 request/response, business logic, user flow, DB/Prisma 변경을 만들지 않았다.
- [ ] FE user-web typecheck/lint가 통과했다.

## 13. 결과 기록 위치

권장 결과 기록:

```text
TODO/BEFORE_12_TASKS/TODO_LOG/<YYYY-MM-DD>/G03_USER_WEB_ROUTE_ARCHITECTURE_CLOSEOUT/WORK_LOG.md
```

## 14. 권장 실행 문구

```text
/goal TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G03_USER_WEB_ROUTE_ARCHITECTURE_CLOSEOUT.md 기준으로 G03을 진행해줘.
```

## 15. 관련 문서

- `TODO/BEFORE_12_TASKS/FE-TODO/USER-WEB-TODO.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
