# References

## 1. AGENT 정본 참조

- `AGENT/README.md`
- `AGENT/AGENT_USAGE_RULES.md`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`
- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`

## 2. TODO 내부 참조

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/README.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/SCOPE.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/USER-FLOW.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/API-SPEC/NO_API_CHANGE.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/FE-TODO/USER-WEB-TODO.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/BE-TODO/API-TODO.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/BE-TODO/DB-SCHEMA.md`

## 3. 코드 참조

| 위치 | 이유 |
| --- | --- |
| `FE/user-web/src/pages/settings/index.tsx` | `/app/settings` 현재 구현 위치 |
| `FE/user-web/src/components/layout/app-shell.tsx` | 계정 드롭다운, account modal, modal sidebar, `AccountSettingsModalContent` 위치 |
| `FE/user-web/src/features/account-request` | account data request 설정 section |
| `FE/user-web/src/features/schedule/components/google-calendar-settings-section.tsx` | Google Calendar 설정과 OAuth `returnTo` |
| `FE/user-web/src/features/follow-up-delivery` | follow-up delivery 설정과 `/app/settings` link |
| `FE/user-web/src/features/notification/components/service-notification-settings-section.tsx` | 계정 모달 `Notifications`에서 쓰는 서비스 알림과 브라우저 푸시 설정 |
| `FE/user-web/src/features/notification/components/notification-screen.tsx` | `/app/notifications` 알림 목록 page |
| `FE/user-web/src/app/router/router.tsx` | `/app/settings`, `/app/notifications`, legacy `/settings` route |
| `FE/user-web/src/pages/more/index.tsx` | mobile more settings link |
| `FE/user-web/src/features/analytics` | settings, notifications route analytics key |

## 4. 관련 선행 상태

- 계정 모달 `Notifications`에는 서비스 알림 설정과 브라우저 푸시 설정이 이미 분리되어 있다.
- `/app/notifications`는 알림 목록 page로 남아 있다.
- 이번 계획은 `/app/settings`의 나머지 설정 내용을 계정 모달 `Settings`로 옮기는 작업이다.
