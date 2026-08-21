# Scope

상태: Implemented / Settings modal migration and route removal complete

## 1. 범위 원칙

이 계획은 설정 기능의 정보를 새로 설계하는 작업이 아니라, 기존 `/app/settings`의 설정/요청/연동 기능을 계정 모달의 `Settings` 섹션으로 단계별 이관해 사용 흐름을 짧게 만드는 UX/UI 개선이다.

핵심 기준은 다음과 같다.

- 사용자는 현재 업무 화면을 떠나지 않고 계정 메뉴에서 설정을 열 수 있어야 한다.
- 계정 모달 `Profile`에 이미 있는 읽기 전용 계정 정보는 `Settings`에 다시 복제하지 않는다.
- `/app/settings`는 사용자-facing 설정 page와 route 역할을 모두 내려놓고, 내부 진입점과 OAuth callback은 Settings modal-open URL로 정리한다.
- 기존 API와 DB 계약은 바꾸지 않는다.
- 알림 목록과 알림 설정의 역할은 분리한다.

## 2. 현재 코드 상태

| 영역 | 현재 상태 | 계획 반영 |
| --- | --- | --- |
| `/app/settings` | `FE/user-web/src/pages/settings/index.tsx` 원본 page 파일과 router route를 삭제했다. | 사용자-facing settings page와 compatibility bridge 의존을 모두 제거했다. |
| 계정 모달 `Profile` | `FE/user-web/src/components/layout/app-shell.tsx`의 `ProfileModalContent`가 account, status, linked providers, devices, user id를 읽기 전용으로 렌더링한다. | 유지한다. 이 정보는 Settings tab에 중복 표시하지 않는다. |
| 계정 모달 `Settings` | `FE/user-web/src/components/layout/app-shell.tsx`의 `AccountSettingsModalContent`가 app defaults form, `AccountDataRequestsSettingsSection`, `GoogleCalendarSettingsSection`, `FollowUpDeliverySettingsSection`을 렌더링한다. | Profile 중복 정보는 제외했고, account data request, Google Calendar, follow-up delivery는 modal presentation으로 재구성했다. |
| 계정 모달 `Notifications` | `ServiceNotificationSettingsSection`이 서비스 알림과 브라우저 푸시 설정을 렌더링한다. | 유지한다. `/app/notifications`의 알림 목록은 옮기지 않는다. |
| settings route 참조 | mobile more, follow-up delivery, schedule CTA는 modal-open path를 사용한다. Google Calendar와 follow-up OAuth callback 생산자도 `/app?account=settings`를 사용한다. | 내부 page 이동 참조와 OAuth callback은 modal-open 흐름으로 바뀌었고, `/app/settings` route는 삭제했다. |
| modal-open contract | `createAccountSettingsModalPath`와 `AppShell` query 감지로 외부 page/component에서 같은 방식으로 Settings modal을 연다. | query 기반 단일 contract를 사용한다. |
| Google Calendar settings | `GoogleCalendarSettingsSection`은 Settings modal 내부로 이관됐다. `/app?account=settings&googleCalendar=connected` callback을 modal section이 정리한다. | callback 안정성을 유지하면서 Settings modal 내부에서 완료 notice와 refetch를 처리한다. |
| Backend/API | profile, devices, account request, Google Calendar, follow-up delivery, notification settings API가 이미 존재한다. | 새 API 없이 기존 API를 소비한다. |

## 3. 포함 범위

| 항목 | 내용 |
| --- | --- |
| Settings modal 기능 이관 | 기존 `/app/settings`의 기능성 section을 계정 모달 `Settings`로 하나씩 옮긴다. |
| 완료된 이관 대상 | `AccountDataRequestsSettingsSection`, `GoogleCalendarSettingsSection`, `FollowUpDeliverySettingsSection`을 Settings modal 안에 배치하고 success/error notice가 modal 안에서 보이게 한다. |
| modal-open contract | `AppShell`에서 URL query를 감지해 `Settings` modal을 열고, 닫을 때 query를 제거한다. 기존 CTA와 OAuth callback은 이 contract를 사용한다. |
| Modal 내부 구성 반영 | `/app/settings`의 page layout/card를 그대로 가져오지 않고, 기존 account modal의 Settings/Notifications/Terms/Privacy content 패턴에 맞게 section을 재구성한다. |
| 설정 form 정리 | 현재 Settings modal의 locale, timezone, country, currency form은 유지하되, Profile tab의 read-only 표시와 역할을 분리한다. |
| `/app/settings` page/route 제거 | 원본 settings page 파일, `/app/settings` route, legacy `/settings` route를 삭제했다. |
| UI 톤 정리 | 모달 안쪽 설정은 sidebar hover/selected 기준과 같은 neutral gray 계열을 따른다. |
| 상태 처리 | loading, error, empty, success notice, pending 상태를 modal 안에서 유지한다. |
| 검증 | TypeScript typecheck, lint, build, modal/route smoke, engineering review checklist를 확인한다. |

## 4. 제외 범위

| 항목 | 이유 |
| --- | --- |
| Backend API 추가 | 기존 설정 기능과 OAuth callback URL만 정리하므로 새 API가 필요하지 않다. |
| DB schema 변경 | 저장되는 데이터가 바뀌지 않는다. |
| Admin Web 수정 | 사용자 설정 UX 개선이며 운영 콘솔 범위가 아니다. |
| `/app/settings` compatibility bridge 유지 | 내부 링크와 OAuth callback 생산자를 `/app?account=settings`로 이전했으므로 bridge route를 유지하지 않는다. |
| 알림 목록 모달 이동 | 사용자가 요청한 범위는 서비스 알림 설정이며, 알림 목록은 `/app/notifications` page의 역할이다. |
| Profile tab 폐지 | 계정 모달의 `Profile`은 정보 확인 탭으로 유지한다. Settings tab은 설정 변경/요청/연동 탭으로 분리한다. |
| Profile read-only 정보 복제 | account information, linked providers, devices, user id는 Profile tab에 이미 있으므로 Settings tab에 다시 넣지 않는다. |
| Page layout 단순 복사 | `/app/settings`의 2-column page layout, page card, page toast 위치를 modal body 안에 그대로 넣으면 기존 account modal의 밀도와 scroll 패턴이 깨진다. |

## 5. 완료 기준

- 계정 드롭다운에서 `Settings`를 누르면 modal 안에서 Profile과 중복되지 않는 설정/요청/연동 기능을 사용할 수 있다.
- account data request, Google Calendar, follow-up delivery가 Settings modal 안에서 동작한다.
- Google Calendar OAuth callback `/app?account=settings&googleCalendar=...`가 Settings modal에서 처리되고 query가 정리된다.
- follow-up OAuth callback `/app?account=settings&followUpEmailConnection=...&status=...`가 Settings modal에서 처리되고 query가 정리된다.
- 이관된 section이 기존 account modal 탭들과 같은 heading, description, section divider, spacing, scroll 패턴을 따른다.
- `/app/settings`의 사용자-facing page와 route 의존은 제거되고, 기존 내부 link는 modal-open 흐름으로 정리된다.
- 서비스 알림과 브라우저 푸시 설정은 계정 모달 `Notifications`에 유지된다.
- `/app/notifications`는 알림 목록 page로 유지된다.
- 새 backend route, Prisma migration, admin-web 변경이 없다.
- `FE/user-web`의 typecheck, lint, build가 통과한다.
- Front engineering review checklist 기준으로 주석, import, API 경계, no `any`, no direct `console.log`를 확인한다.
- 이관 대상 화면에 깨진 문구, 잘못된 위험 액션 안내, 부모 영역을 넘는 request id/status가 없는지 확인한다.
- 기존 settings page 원본 파일은 삭제되어 사용자-facing settings page 중복 구현이 없다.

## 6. 관련 문서

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/README.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/USER-FLOW.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/API-SPEC/NO_API_CHANGE.md`
