# User Web TODO

상태: G02-G06 Done / Documentation Closeout Complete
계약 상태: Documentation closeout only

## 1. 목적

이 문서는 `BEFORE_12_TASKS`에서 User Web 관련 작업 범위를 기록한다.

## 2. 포함 범위

- `/app/notifications` 활성 상태 문서 정리
- `/app/schedules/week` 활성 상태 문서 정리
- `/app/export` redirect 상태 문서 정리
- 10 Mobile Field Use FE TODO/checklist 정합성 정리
- 11 Admin Operation User Web 영향 문서 정합성 정리
- `/app/trash`, `/app/settings`, `/admin/api/*` 차단 기준 문서 정리
- AGENT/FE architecture 문서 중 User Web route 상태가 stale인 부분 확인
- follow-up delivery settings/compose route와 G01 smoke 사용 흐름 확인

## 3. 제외 범위

- `/app/notifications` 숨김/rollback
- `/app/schedules/week` 숨김/rollback
- `/app/export` 활성화
- generic export 화면/API 연결
- PWA/offline/native 구현
- server draft 구현
- 새 User Web route 추가
- User Web에서 `/admin/api/*` 호출 추가
- Trash 만료 복구 문의를 결제/paywall로 연결
- account deletion/data export 실제 처리 job 또는 download artifact UI 활성화

## 4. 확인 대상

- `FE/user-web/src/app/router/router.tsx`
- `FE/user-web/src/features/notification`
- `FE/user-web/src/features/import-export`
- `FE/user-web/src/features/follow-up-delivery`
- `FE/user-web/src/features/mobile-local-draft`
- `FE/user-web/src/features/trash`
- `FE/user-web/src/features/account-request`
- `FE/ARCHITECTURE.md`
- `FE/user-web/ARCHITECTURE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/FE-TODO/USER-WEB-TODO.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/FE-TODO/USER-WEB-TODO.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`

## 5. 검증 명령

G02, G03 또는 G04에서 User Web 문서/코드 정합성을 정리한 뒤 실행한다.

```bash
cd FE/user-web
pnpm run typecheck
pnpm run lint
```

정적 확인:

```bash
rg -n "/admin/api" FE/user-web/src
git diff --check
```

## 6. 코드 변경 gate

User Web 코드를 수정해야 할 경우:

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`를 따른다.
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`의 `// 기능 : ...` 주석 규칙을 따른다.
- UX/UI는 `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`를 따른다.
- 사용자 노출 문구는 `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`의 해요체를 따른다.

## 7. 완료 기준

- [x] User Web 문서가 실제 route 상태와 맞는다.
- [x] 10 Mobile checklist가 실제 구현 상태와 맞는다.
- [x] 11 User Web 영향 문서가 `/app/trash`, `/app/settings`, `/admin/api/*` 차단 기준과 맞는다.
- [x] route 정합성 closeout 때문에 제품 동작이 변경되지 않았다.
- [x] User Web이 `/admin/api/*`를 호출하지 않는다.
- [x] Trash/account request 후속 후보를 12 전 기능 구현으로 열지 않았다.
- [x] 코드 변경이 발생했다면 typecheck/lint가 통과했고 한글 주석 기준을 지켰다.

## 8. 관련 문서

- `TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G02_10_MOBILE_CHECKLIST_CLOSEOUT.md`
- `TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G03_USER_WEB_ROUTE_ARCHITECTURE_CLOSEOUT.md`
- `TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G04_11_ADMIN_CHECKLIST_CLOSEOUT.md`
