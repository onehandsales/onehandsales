# User Web TODO

상태: Draft / Active implementation candidate

## 1. 원칙

이번 작업은 `FE/user-web` 전용 UX/UI 개선이다. 설정 기능의 source of truth를 page 구현에서 feature 구현으로 옮기고, page와 modal이 같은 component를 공유하게 만든다.

`FE/admin-web`은 보지 않고 수정하지 않는다.

## 2. 작업 대상

| 파일 또는 폴더 | 작업 |
| --- | --- |
| `FE/user-web/src/features/settings` | 새 feature 폴더 생성 |
| `FE/user-web/src/features/settings/components/settings-screen.tsx` | 전체 설정 화면 component 생성 |
| `FE/user-web/src/features/settings/index.ts` | public export 생성 |
| `FE/user-web/src/pages/settings/index.tsx` | `SettingsScreen variant="page"` route entry로 축소 |
| `FE/user-web/src/components/layout/app-shell.tsx` | 계정 모달 `Settings`에 `SettingsScreen variant="modal"` 연결 |
| `FE/user-web/src/features/notification/components/service-notification-settings-section.tsx` | 변경 없이 유지. 서비스 알림과 브라우저 푸시 설정 담당 |
| `FE/user-web/src/features/notification/components/notification-screen.tsx` | 변경 없이 유지. `/app/notifications` 알림 목록 담당 |

## 3. 구현 체크리스트

- [ ] `features/settings`를 만든다.
- [ ] `/app/settings`의 profile/defaults form을 `SettingsScreen`으로 옮긴다.
- [ ] account information과 OAuth provider list를 `SettingsScreen`으로 옮긴다.
- [ ] `AccountDataRequestsSettingsSection`을 `SettingsScreen` 안에서 렌더링한다.
- [ ] `GoogleCalendarSettingsSection`을 `SettingsScreen` 안에서 렌더링한다.
- [ ] `FollowUpDeliverySettingsSection`을 `SettingsScreen` 안에서 렌더링한다.
- [ ] devices section을 `SettingsScreen` 안에서 렌더링한다.
- [ ] page variant와 modal variant의 container class를 분리한다.
- [ ] `pages/settings/index.tsx`에서 feature screen만 렌더링한다.
- [ ] `AppShell`에서 기존 `AccountSettingsModalContent` 중복 form을 제거하고 feature screen을 연결한다.
- [ ] 계정 모달 `Notifications`는 `ServiceNotificationSettingsSection`을 유지한다.
- [ ] `/app/settings` link와 route 참조를 유지한다.
- [ ] `npm run build`를 실행한다.

## 4. UI 기준

- neutral gray 중심의 hover, selected, pressed 상태를 유지한다.
- settings modal 안에서 파란색을 전역 active identity로 쓰지 않는다.
- icon은 가능한 `lucide-react`를 사용한다.
- page section을 불필요하게 card 안의 card로 중첩하지 않는다.
- 긴 텍스트는 truncate, break-all, responsive grid로 부모 영역을 넘지 않게 한다.
- modal 안의 settings content는 업무용 정보 밀도를 유지하되, 저장 버튼과 위험 행동은 쉽게 찾을 수 있어야 한다.

## 5. 상태 처리 기준

| 상태 | 기준 |
| --- | --- |
| Loading | skeleton 또는 inline loading을 section 안에서 표시한다. |
| Empty | devices, OAuth provider, request 상태가 비어 있을 때 기존 빈 상태 문구를 유지한다. |
| Error | `getApiErrorMessage` 기반 오류와 다시 시도 action을 제공한다. |
| Success | 저장 또는 요청 성공 notice가 page와 modal에서 모두 보인다. |
| Pending | 저장 중 버튼 disabled 또는 pending state를 유지한다. |

## 6. 검증 기준

권장 명령:

```powershell
cd FE/user-web
npm run build
```

수동 확인:

- `/app/settings` 직접 진입
- 계정 드롭다운 `Settings` modal 진입
- 계정 드롭다운 `Notifications` modal 진입
- profile/defaults 저장
- Google Calendar section 표시
- follow-up delivery section 표시
- account data request section 표시
- devices section 표시
- `/app/notifications` 알림 목록 유지

## 7. 관련 문서

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-SPECS/G01_SETTINGS_SCREEN_EXTRACTION.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-SPECS/G02_ACCOUNT_MODAL_INTEGRATION.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-SPECS/G03_ROUTE_LINK_QA.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
