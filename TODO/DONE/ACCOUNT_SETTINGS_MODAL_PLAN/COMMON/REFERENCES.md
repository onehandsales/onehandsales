# References

## 1. AGENT 정본 참조

- `AGENT/README.md`
- `AGENT/AGENT_USAGE_RULES.md`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`
- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`

## 2. TODO 내부 참조

- `TODO/DONE/ACCOUNT_SETTINGS_MODAL_PLAN/README.md`
- `TODO/DONE/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/SCOPE.md`
- `TODO/DONE/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/USER-FLOW.md`
- `TODO/DONE/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/DONE/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/API-SPEC/NO_API_CHANGE.md`
- `TODO/DONE/ACCOUNT_SETTINGS_MODAL_PLAN/FE-TODO/USER-WEB-TODO.md`
- `TODO/DONE/ACCOUNT_SETTINGS_MODAL_PLAN/BE-TODO/API-TODO.md`
- `TODO/DONE/ACCOUNT_SETTINGS_MODAL_PLAN/BE-TODO/DB-SCHEMA.md`

## 3. 코드 참조

| 위치 | 이유 |
| --- | --- |
| `FE/user-web/src/pages/settings/index.tsx` | 삭제됨. settings 기능은 계정 모달 `Settings`로 이관 |
| `FE/user-web/src/components/layout/app-shell.tsx` | 계정 드롭다운, account modal, modal sidebar, `AccountSettingsModalContent` 위치 |
| `FE/user-web/src/components/layout/account-modal-route.ts` | account settings modal-open query contract helper |
| `FE/user-web/src/app/router/route-elements.tsx` | public/app legacy redirect 구현 위치. settings bridge는 삭제됨 |
| `FE/user-web/src/features/account-request` | account data request 설정 section |
| `FE/user-web/src/features/schedule/components/google-calendar-settings-section.tsx` | Google Calendar 설정과 OAuth `returnTo: /app?account=settings` |
| `BE/src/modules/schedule/application/services/google-calendar-connection.service.ts` | Google Calendar OAuth `returnTo` allowlist |
| `FE/user-web/src/features/follow-up-delivery` | follow-up delivery 설정과 modal-open settings link |
| `BE/src/modules/follow-up/presentation/http/follow-up-delivery-settings.controller.ts` | follow-up email OAuth callback redirect URL |
| `FE/user-web/tests/e2e/account-settings-route-link-qa.spec.ts` | modal-open link, Google Calendar callback, follow-up callback QA |
| `FE/user-web/src/features/notification/components/service-notification-settings-section.tsx` | 계정 모달 `Notifications`에서 쓰는 서비스 알림과 브라우저 푸시 설정 |
| `FE/user-web/src/features/notification/components/notification-screen.tsx` | `/app/notifications` 알림 목록 page |
| `FE/user-web/src/app/router/router.tsx` | `/app/notifications` route와 settings route 삭제 위치 |
| `FE/user-web/src/pages/more/index.tsx` | mobile more settings link |
| `FE/user-web/src/features/analytics` | settings, notifications route analytics key |

## 4. 관련 선행 상태

- 계정 모달 `Notifications`에는 서비스 알림 설정과 브라우저 푸시 설정이 이미 분리되어 있다.
- `/app/notifications`는 알림 목록 page로 남아 있다.
- 이번 계획은 기존 `/app/settings`의 설정/요청/연동 기능을 계정 모달 `Settings`로 단계별 이관하는 작업이다.
- 계정 모달 `Profile`에 이미 있는 account/status/linked providers/devices/user id는 Settings에 복제하지 않는다.
- `/app/settings`는 사용자-facing page와 route로 유지하지 않고, 기존 내부 link와 OAuth callback은 modal-open URL로 정리했다.
- `AccountDataRequestsSettingsSection`, `GoogleCalendarSettingsSection`, `FollowUpDeliverySettingsSection`은 Settings modal로 이관됐다.
- Google Calendar callback은 `/app?account=settings&googleCalendar=...`로 돌아온 뒤 Settings modal 내부 section에서 처리한다.
