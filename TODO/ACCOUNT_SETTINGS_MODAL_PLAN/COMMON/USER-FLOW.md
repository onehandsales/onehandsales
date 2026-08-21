# User Flow

상태: Implemented / Settings modal callback covered and settings routes removed

## 1. 목적

이 문서는 사용자가 계정 메뉴와 설정 모달을 어떤 순서로 사용하는지 정의한다.

목표는 사용자가 영업 업무 화면을 보고 있는 상태에서 설정 때문에 화면 맥락을 잃지 않게 하는 것이다. 계정 메뉴에서 모달을 열어 설정을 확인하고 닫으면 원래 업무 화면으로 돌아와야 한다.

## 2. 기본 진입 흐름

1. 사용자는 `/app`, `/app/deals`, `/app/companies` 같은 보호 앱 화면을 사용한다.
2. 좌측 사이드바 상단의 계정 영역을 누른다.
3. 계정 드롭다운이 부드럽게 열린다.
4. 사용자는 `Settings`를 누른다.
5. 계정 모달이 열리고 왼쪽 modal sidebar에서 `Settings`가 선택된다.
6. 오른쪽 콘텐츠 영역에는 기존 settings page에서 이관된 설정/요청/연동 기능이 표시된다.
7. 사용자는 설정을 저장하거나 연동 설정을 변경한다.
8. 모달을 닫으면 원래 보고 있던 업무 화면으로 돌아온다.

## 3. Settings 모달 내부 흐름

Settings modal은 기존 account modal 탭의 구성 방식을 따른다.

- modal shell은 왼쪽 sidebar와 오른쪽 scroll content를 유지한다.
- content는 흰 배경, 좌우 padding, 상단 title/description, 아래 section list 구조를 사용한다.
- section은 `ProfileSection` 계열의 작은 제목, 상단 divider, 조용한 neutral gray 텍스트 밀도를 따른다.
- `Notifications`, `Terms`, `Privacy`처럼 각 탭은 자체 목적에 맞는 section을 갖지만 같은 modal density와 scroll 규칙을 공유한다.
- 기존 settings page의 column/card layout을 그대로 붙이지 않는다.

| 섹션 | 사용자 행동 | 성공 기준 |
| --- | --- | --- |
| App defaults | 앱 언어, timezone, 기본 국가, 기본 통화를 수정하고 저장한다. | 저장 성공 notice가 보이고 profile query가 일관된 값으로 갱신된다. |
| Account data requests | 데이터 export 요청, 계정 삭제 요청 또는 취소를 진행한다. | 기존 `AccountDataRequestsSettingsSection`의 success/error 안내가 modal 안에서도 보인다. 이관 완료. |
| Google Calendar | 연결 상태 확인, calendar 선택, 연결 또는 해제를 진행한다. | 기존 Google Calendar settings 동작과 `/app?account=settings&googleCalendar=...` callback 처리가 modal 안에서 유지된다. 이관 완료. |
| Follow-up delivery | email provider, SMS sender, consent notice 설정을 확인하고 수정한다. | 기존 follow-up delivery settings 동작과 `/app?account=settings&followUpEmailConnection=...&status=...` callback 처리가 modal 안에서 유지된다. 이관 완료. |

## 4. Profile 탭 분리 기준

계정 모달 `Profile` 탭은 이미 다음 읽기 전용 정보를 제공한다.

- Account name, email
- Display language, timezone, default country, default currency의 현재 값
- Role, account status, last login, updated
- Signup/last login country와 timezone
- Linked providers
- Devices
- User ID

따라서 `Settings` 탭은 위 정보를 다시 보여주는 화면이 아니라, 값을 바꾸거나 요청/연동을 처리하는 화면으로 사용한다.

## 5. Settings 진입 정리 흐름

1. 사용자가 계정 메뉴, mobile more, schedule, follow-up delivery 화면에서 Settings를 누른다.
2. 앱은 독립 설정 page로 이동하지 않고 현재 업무 path 위에 `account=settings` query를 붙여 계정 모달 `Settings`를 연다.
3. Google Calendar OAuth callback은 `/app?account=settings&googleCalendar=...`로 돌아온다.
4. follow-up email OAuth callback은 `/app?account=settings&followUpEmailConnection=...&status=...`로 돌아온다.
5. Settings modal 내부 section은 callback query를 처리한 뒤 결과 query를 정리하고 `account=settings`만 유지한다.

기본 modal-open contract는 URL query 기반으로 둔다. 예를 들어 기존 업무 화면에서 Settings를 열 때 현재 path를 유지한 채 query를 추가하고, 모달을 닫으면 query를 제거해 원래 업무 화면으로 돌아온다.

이 흐름은 아래 호환성을 정리하기 위해 필요하다.

- mobile more page의 settings link
- follow-up delivery 화면의 settings link
- follow-up delivery OAuth callback query
- Google Calendar OAuth `returnTo`
- analytics route key 정리

삭제된 흐름:

- `/app/settings` route
- legacy `/settings` route
- `AccountSettingsModalBridge`

## 6. Notifications 흐름

| 진입점 | 결과 |
| --- | --- |
| 계정 모달 `Notifications` | 서비스 알림 설정과 브라우저 푸시 설정을 표시한다. |
| 알림 bell 또는 `/app/notifications` | 알림 목록, 읽음 처리, 관련 기록 이동을 표시한다. |

알림 설정과 알림 목록은 같은 `notification` feature를 쓰지만 사용자 목적이 다르므로 화면 위치를 분리한다.

## 7. 예외와 오류 흐름

- profile 조회 실패 시 모달 안에서 다시 시도 버튼을 보여준다.
- 저장 실패 시 form 주변에 사용자가 이해할 수 있는 오류 메시지를 보여준다.
- account data request와 follow-up delivery의 기존 error/notice callback은 modal에서 동작해야 한다.
- Google Calendar callback은 Settings modal 내부 `GoogleCalendarSettingsSection`에서 처리한다.
- modal 안에서 긴 이메일, OAuth provider email, user id, timezone 값은 부모 영역을 넘치지 않아야 한다.
- 작은 viewport에서는 modal content가 세로 scroll로 처리되어 sidebar와 본문이 겹치지 않아야 한다.

## 8. 관련 문서

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/SCOPE.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
