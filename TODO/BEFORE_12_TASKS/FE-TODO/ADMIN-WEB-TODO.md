# Admin Web TODO

상태: Ready For Goal
계약 상태: Documentation closeout only

## 1. 목적

이 문서는 `BEFORE_12_TASKS`에서 Admin Web 관련 작업 범위를 기록한다.

## 2. 포함 범위

- 11 Admin Operation FE TODO/checklist 정합성 정리
- Admin Web architecture 문서 정리
- 활성 Admin route와 redirect route 구분
- legacy `admin-query` 상태 문서화
- inactive page 또는 legacy feature가 현재 활성 계약으로 오해되는지 확인
- Admin Web E2E 설명과 현재 test 상태 대조

## 3. 제외 범위

- `/organizations` 활성화
- `/subscriptions` 활성화
- `/support` 활성화
- Billing Admin 구현
- Customer/B2B tenant admin 구현
- legacy `admin-query` route/API 활성화
- Admin direct mutation UI 추가
- Admin Web에서 User Web API/client import

## 4. 확인 대상

- `FE/admin-web/src/app/router/router.tsx`
- `FE/admin-web/src/components/layout/admin-shell.tsx`
- `FE/admin-web/src/features`
- `FE/admin-web/src/features/admin-query`
- `FE/admin-web/tests/e2e/admin-web-smoke.spec.ts`
- `FE/admin-web/ARCHITECTURE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/FE-TODO/ADMIN-WEB-TODO.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`

## 5. 검증 명령

G04 또는 G05에서 Admin Web 문서/코드 정합성을 정리한 뒤 실행한다.

```bash
cd FE/admin-web
pnpm run typecheck
pnpm run lint
```

정적 확인:

```bash
rg -n "\"/api/" FE/admin-web/src
git diff --check
```

## 6. 코드 변경 gate

Admin Web 코드를 수정해야 할 경우:

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`를 따른다.
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`의 `// 기능 : ...` 주석 규칙을 따른다.
- Admin Web은 `/admin/api/*`만 호출한다.
- User Web feature/API/client를 직접 import하지 않는다.
- 운영 화면은 데스크톱 우선, 표/필터/상태 중심의 실무형 레이아웃을 유지한다.

## 7. 완료 기준

- [ ] Admin Web 문서가 실제 route/API 상태와 맞는다.
- [ ] 11 Admin checklist가 실제 구현 상태와 맞는다.
- [ ] legacy code가 현재 활성 계약으로 오해되지 않는다.
- [ ] Billing/B2B/customer admin 기능이 추가되지 않았다.
- [ ] Admin Web이 User Web API/client를 import하지 않는다.
- [ ] 코드 변경이 발생했다면 typecheck/lint가 통과했고 한글 주석 기준을 지켰다.

## 8. 관련 문서

- `TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G04_11_ADMIN_CHECKLIST_CLOSEOUT.md`
- `TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G05_ADMIN_WEB_ARCHITECTURE_LEGACY_CLOSEOUT.md`
