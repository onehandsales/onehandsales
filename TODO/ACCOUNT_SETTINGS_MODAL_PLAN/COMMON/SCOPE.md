# Scope

상태: Draft / Active UXUI improvement

## 1. 범위 원칙

이 계획은 설정 기능의 정보를 새로 설계하는 작업이 아니라, 이미 구현된 `/app/settings` 내용을 계정 모달의 `Settings` 섹션으로 옮겨 사용 흐름을 짧게 만드는 UX/UI 개선이다.

핵심 기준은 다음과 같다.

- 사용자는 현재 업무 화면을 떠나지 않고 계정 메뉴에서 설정을 열 수 있어야 한다.
- `/app/settings` page와 계정 모달 `Settings`는 서로 다른 구현을 갖지 않고 같은 feature screen을 공유해야 한다.
- 기존 API와 DB 계약은 바꾸지 않는다.
- 알림 목록과 알림 설정의 역할은 분리한다.

## 2. 현재 코드 상태

| 영역 | 현재 상태 | 계획 반영 |
| --- | --- | --- |
| `/app/settings` | `FE/user-web/src/pages/settings/index.tsx`가 profile form, account information, account data request, Google Calendar, follow-up delivery, devices를 직접 렌더링한다. | `features/settings`의 reusable screen으로 분리한다. |
| 계정 모달 `Settings` | `FE/user-web/src/components/layout/app-shell.tsx`의 `AccountSettingsModalContent`가 locale, timezone, country, currency만 별도로 렌더링한다. | 별도 form을 제거하고 `SettingsScreen variant="modal"`을 사용한다. |
| 계정 모달 `Notifications` | `ServiceNotificationSettingsSection`이 서비스 알림과 브라우저 푸시 설정을 렌더링한다. | 유지한다. `/app/notifications`의 알림 목록은 옮기지 않는다. |
| `/app/settings` 참조 | router, mobile more, follow-up delivery, Google Calendar `returnTo`, analytics가 `/app/settings`를 참조한다. | route와 참조를 깨지 않는다. |
| Backend/API | profile, devices, account request, Google Calendar, follow-up delivery, notification settings API가 이미 존재한다. | 새 API 없이 기존 API를 소비한다. |

## 3. 포함 범위

| 항목 | 내용 |
| --- | --- |
| `features/settings` 생성 | 설정 화면의 실제 UI, section component, helper, 화면 variant를 `FE/user-web/src/features/settings`로 이동한다. |
| `/app/settings` page 경량화 | `pages/settings/index.tsx`는 route entry로 남기고 `SettingsScreen variant="page"`만 렌더링한다. |
| 계정 모달 연결 | `AppShell`의 `Settings` section이 `SettingsScreen variant="modal"`을 렌더링한다. |
| 전체 설정 내용 이동 | 이름, 언어, timezone, 기본 국가, 기본 통화, 계정 정보, OAuth provider, 데이터 export/delete request, Google Calendar, follow-up delivery, devices를 모달 Settings 안에서 볼 수 있게 한다. |
| UI 톤 정리 | 모달 안쪽 설정은 sidebar hover/selected 기준과 같은 neutral gray 계열을 따른다. |
| 상태 처리 | loading, error, empty, success notice, pending 상태를 page와 modal 모두에서 유지한다. |
| 검증 | TypeScript build와 route/modal smoke를 확인한다. |

## 4. 제외 범위

| 항목 | 이유 |
| --- | --- |
| Backend API 추가 | 기존 설정 기능을 옮기는 작업이므로 새 API가 필요하지 않다. |
| DB schema 변경 | 저장되는 데이터가 바뀌지 않는다. |
| Admin Web 수정 | 사용자 설정 UX 개선이며 운영 콘솔 범위가 아니다. |
| `/app/settings` route 삭제 | 기존 링크와 OAuth return path 호환성을 위해 유지한다. |
| 알림 목록 모달 이동 | 사용자가 요청한 범위는 서비스 알림 설정이며, 알림 목록은 `/app/notifications` page의 역할이다. |
| OAuth callback modal auto-open | callback 후 자동으로 계정 모달을 여는 정책은 별도 route state/query 설계가 필요하므로 이번 goal에서는 route fallback 유지로 처리한다. |
| Profile tab 폐지 | 계정 모달의 `Profile`은 정보 확인 탭으로 유지한다. Settings tab에는 `/app/settings` 내용 전체를 넣는다. 중복 표시가 과하면 별도 UX 결정으로 정리한다. |

## 5. 완료 기준

- 계정 드롭다운에서 `Settings`를 누르면 modal 안에서 `/app/settings`의 전체 설정 내용을 볼 수 있다.
- `/app/settings` route로 직접 이동해도 같은 설정 기능을 사용할 수 있다.
- 서비스 알림과 브라우저 푸시 설정은 계정 모달 `Notifications`에 유지된다.
- `/app/notifications`는 알림 목록 page로 유지된다.
- 새 backend route, Prisma migration, admin-web 변경이 없다.
- `FE/user-web`의 TypeScript build가 통과한다.

## 6. 관련 문서

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/README.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/USER-FLOW.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/API-SPEC/NO_API_CHANGE.md`
