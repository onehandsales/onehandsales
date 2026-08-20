# User Flow

상태: Draft / Active UXUI improvement

## 1. 목적

이 문서는 사용자가 계정 메뉴, 설정 모달, 기존 설정 page를 어떤 순서로 사용하는지 정의한다.

목표는 사용자가 영업 업무 화면을 보고 있는 상태에서 설정 때문에 화면 맥락을 잃지 않게 하는 것이다. 계정 메뉴에서 모달을 열어 설정을 확인하고 닫으면 원래 업무 화면으로 돌아와야 한다.

## 2. 기본 진입 흐름

1. 사용자는 `/app`, `/app/deals`, `/app/companies` 같은 보호 앱 화면을 사용한다.
2. 좌측 사이드바 상단의 계정 영역을 누른다.
3. 계정 드롭다운이 부드럽게 열린다.
4. 사용자는 `Settings`를 누른다.
5. 계정 모달이 열리고 왼쪽 modal sidebar에서 `Settings`가 선택된다.
6. 오른쪽 콘텐츠 영역에는 `/app/settings`에서 제공하던 전체 설정 내용이 표시된다.
7. 사용자는 설정을 저장하거나 연동 설정을 변경한다.
8. 모달을 닫으면 원래 보고 있던 업무 화면으로 돌아온다.

## 3. Settings 모달 내부 흐름

| 섹션 | 사용자 행동 | 성공 기준 |
| --- | --- | --- |
| Profile/defaults | 이름, 앱 언어, timezone, 기본 국가, 기본 통화를 수정하고 저장한다. | 저장 성공 notice가 보이고 profile query가 일관된 값으로 갱신된다. |
| Account information | 이메일, 역할, 계정 상태, 가입/로그인 metadata, OAuth provider를 확인한다. | 읽기 전용 정보가 줄바꿈과 truncation으로 깨지지 않는다. |
| Account data requests | 데이터 export 요청, 계정 삭제 요청 또는 취소를 진행한다. | 기존 `AccountDataRequestsSettingsSection`의 success/error 안내가 modal 안에서도 보인다. |
| Google Calendar | 연결 상태 확인, calendar 선택, 연결 또는 해제를 진행한다. | 기존 Google Calendar settings 동작이 page와 modal 모두에서 유지된다. |
| Follow-up delivery | email provider, SMS sender, consent notice 설정을 확인하고 수정한다. | 기존 follow-up delivery settings 동작이 page와 modal 모두에서 유지된다. |
| Devices | 현재 기기와 active session 정보를 확인한다. | loading, empty, error, current device 표시가 유지된다. |

## 4. 기존 `/app/settings` 직접 진입 흐름

1. 사용자는 `/app/settings`로 직접 이동하거나 기존 link를 누른다.
2. app shell 안에서 설정 page가 열린다.
3. page는 `SettingsScreen variant="page"`를 렌더링한다.
4. 사용자는 모달과 같은 설정 기능을 page에서도 사용할 수 있다.

이 흐름은 아래 호환성을 지키기 위해 유지한다.

- legacy `/settings` redirect
- mobile more page의 settings link
- follow-up delivery 화면의 settings link
- Google Calendar OAuth `returnTo: "/app/settings"`
- analytics route key `settings`

## 5. Notifications 흐름

| 진입점 | 결과 |
| --- | --- |
| 계정 모달 `Notifications` | 서비스 알림 설정과 브라우저 푸시 설정을 표시한다. |
| 알림 bell 또는 `/app/notifications` | 알림 목록, 읽음 처리, 관련 기록 이동을 표시한다. |

알림 설정과 알림 목록은 같은 `notification` feature를 쓰지만 사용자 목적이 다르므로 화면 위치를 분리한다.

## 6. 예외와 오류 흐름

- profile 조회 실패 시 모달과 page 모두 다시 시도 버튼을 보여준다.
- 저장 실패 시 form 주변에 사용자가 이해할 수 있는 오류 메시지를 보여준다.
- account data request, Google Calendar, follow-up delivery의 기존 error/notice callback은 modal에서도 동작해야 한다.
- modal 안에서 긴 이메일, OAuth provider email, user id, timezone 값은 부모 영역을 넘치지 않아야 한다.
- 작은 viewport에서는 modal content가 세로 scroll로 처리되어 sidebar와 본문이 겹치지 않아야 한다.

## 7. 관련 문서

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/SCOPE.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
