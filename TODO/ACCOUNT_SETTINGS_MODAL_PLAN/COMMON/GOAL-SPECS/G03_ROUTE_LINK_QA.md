# G03 Route Link QA

상태: Draft / Verification goal

## 1. 목적

계정 모달 Settings 연결 후 기존 `/app/settings` route와 관련 link가 깨지지 않았는지 확인한다.

이 goal은 새 기능 추가가 아니라 호환성과 회귀 검증을 담당한다.

## 2. 반드시 먼저 읽을 문서

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/README.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/SCOPE.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-SPECS/G01_SETTINGS_SCREEN_EXTRACTION.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-SPECS/G02_ACCOUNT_MODAL_INTEGRATION.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`

## 3. 확인 대상

| 경로 또는 파일 | 확인 내용 |
| --- | --- |
| `/app/settings` | 직접 진입 시 `SettingsScreen variant="page"`가 동작한다. |
| legacy `/settings` | `/app/settings`로 redirect된다. |
| `FE/user-web/src/pages/more/index.tsx` | mobile more의 settings link가 유지된다. |
| `FE/user-web/src/features/follow-up-delivery` | follow-up 관련 settings link가 유지된다. |
| `FE/user-web/src/features/schedule/components/google-calendar-settings-section.tsx` | `returnTo: "/app/settings"`가 유지된다. |
| `FE/user-web/src/features/analytics` | `/app/settings` route analytics key가 유지된다. |
| `FE/user-web/src/features/notification` | `/app/notifications` 알림 목록과 modal notification settings 역할이 분리된다. |

## 4. 검증 기준

- `/app/settings`와 account modal `Settings`가 같은 `SettingsScreen`을 사용한다.
- `/app/settings` direct link는 page로 열리고, account menu `Settings`는 modal로 열린다.
- Google Calendar OAuth return path는 기존 page fallback을 통해 안전하게 돌아온다.
- 알림 bell은 계속 `/app/notifications`로 이동한다.
- 계정 모달 `Notifications`는 서비스 알림과 브라우저 푸시 설정을 보여준다.
- `FE/user-web` build가 통과한다.

## 5. 권장 명령

```powershell
cd FE/user-web
npm run build
```

필요 시 route 참조 확인:

```powershell
rg -n "/app/settings|/app/notifications" src -g "*.tsx" -g "*.ts"
```

## 6. 완료 기준

- build 검증 결과가 통과 또는 명확한 외부 원인으로 기록된다.
- route/link 확인 결과가 완료 보고에 포함된다.
- 새 API, DB migration, admin-web 변경이 없음을 `git diff --stat`로 확인한다.

## 7. 관련 문서

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/API-SPEC/NO_API_CHANGE.md`
