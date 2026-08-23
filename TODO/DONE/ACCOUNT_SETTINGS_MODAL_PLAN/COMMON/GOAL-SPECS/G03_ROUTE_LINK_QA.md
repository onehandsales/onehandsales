# G03 Route Link Removal QA

상태: Completed / Route and callback QA covered

## 1. 목적

계정 모달 Settings 이관 후 기존 `/app/settings` 사용자-facing page 의존이 남아 있지 않은지 확인한다.

이 goal은 새 기능 추가가 아니라 link 재배선, settings route 삭제, OAuth callback 회귀 검증을 담당한다.

## 2. 반드시 먼저 읽을 문서

- `TODO/DONE/ACCOUNT_SETTINGS_MODAL_PLAN/README.md`
- `TODO/DONE/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/SCOPE.md`
- `TODO/DONE/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-SPECS/G01_SETTINGS_SCREEN_EXTRACTION.md`
- `TODO/DONE/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-SPECS/G02_ACCOUNT_MODAL_INTEGRATION.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`

## 3. 확인 대상

| 경로 또는 파일 | 확인 내용 |
| --- | --- |
| `/app/settings` | router에서 제거되어 사용자-facing page나 bridge로 동작하지 않는다. |
| legacy `/settings` | router에서 제거되어 legacy settings bridge로 동작하지 않는다. |
| `FE/user-web/src/pages/more/index.tsx` | mobile more의 settings 진입이 page link가 아니라 Settings modal-open 흐름이다. |
| `FE/user-web/src/features/follow-up-delivery` | follow-up 관련 settings CTA와 OAuth callback query가 `/app?account=settings` Settings modal-open 흐름이다. |
| `FE/user-web/src/features/schedule/components/google-calendar-settings-section.tsx` | `returnTo` 변경 여부가 BE allowlist와 함께 검증된다. |
| `FE/user-web/src/features/analytics` | `/app/settings` route analytics 예외가 제거된다. |
| `FE/user-web/src/features/notification` | `/app/notifications` 알림 목록과 modal notification settings 역할이 분리된다. |

## 4. 검증 기준

- `/app/settings` direct route는 앱 router에서 제거된다.
- account menu `Settings`는 modal로 열린다.
- mobile more, follow-up, schedule CTA는 같은 modal-open contract를 사용한다.
- follow-up OAuth callback `/app?account=settings&followUpEmailConnection=...&status=...`는 Settings modal에서 처리되고 query가 정리된다.
- modal close 후 query가 정리되고 원래 업무 화면 맥락이 유지된다.
- Google Calendar OAuth return path는 `/app?account=settings`로 BE allowlist 제약을 깨지 않는다.
- 알림 bell은 계속 `/app/notifications`로 이동한다.
- 계정 모달 `Notifications`는 서비스 알림과 브라우저 푸시 설정을 보여준다.
- `FE/user-web` typecheck, lint, build가 통과한다.
- Front engineering review checklist 기준으로 주석, import, API 경계, no `any`, no direct `console.log`를 확인한다.

## 5. 권장 명령

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

필요 시 route 참조 확인:

```powershell
rg -n "/app/settings|AccountSettingsModalBridge" src -g "*.tsx" -g "*.ts"
```

follow-up callback 검증:

```powershell
pnpm exec playwright test tests/e2e/account-settings-route-link-qa.spec.ts
```

## 6. 완료 기준

- build 검증 결과가 통과 또는 명확한 외부 원인으로 기록된다.
- typecheck/lint 검증 결과가 통과 또는 명확한 외부 원인으로 기록된다.
- route/link/callback 확인 결과가 완료 보고에 포함된다.
- 새 API, DB migration, admin-web 변경이 없음을 `git diff --stat`로 확인한다.

## 7. 관련 문서

- `TODO/DONE/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/DONE/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/API-SPEC/NO_API_CHANGE.md`
