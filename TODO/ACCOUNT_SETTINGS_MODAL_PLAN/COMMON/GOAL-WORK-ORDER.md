# Goal Work Order

상태: Draft / Ready for implementation review

## 1. 목적

이 문서는 `ACCOUNT_SETTINGS_MODAL_PLAN`의 구현 작업을 한 번에 너무 크게 처리하지 않도록 `/goal` 단위로 나눈다.

작업은 순서대로 진행한다. 선행 goal이 완료 기준을 만족하지 않으면 후속 goal로 넘어가지 않는다.

## 2. 작업 순서

| 순서 | Goal | 목적 | 선행 조건 |
| --- | --- | --- | --- |
| G01 | Settings screen extraction | `/app/settings`의 실제 설정 UI를 `features/settings` reusable screen으로 분리한다. | 문서 검토 통과 |
| G02 | Account modal integration | 계정 모달 `Settings` 섹션이 G01의 `SettingsScreen`을 렌더링하게 연결한다. | G01 완료 |
| G03 | Route/link QA | 기존 `/app/settings` route, legacy redirect, link, OAuth return path, build를 검증한다. | G02 완료 |

## 3. G01 Settings screen extraction

목적:

- 설정 기능의 실제 구현 위치를 `pages/settings`에서 `features/settings`로 옮긴다.

포함 범위:

- `FE/user-web/src/features/settings` 생성
- `SettingsScreen` component 생성
- 기존 `SettingsPage` 내부 section, helper, type을 feature로 이동
- `SettingsScreen`에 `variant: "page" | "modal"` 같은 화면 컨테이너 차이를 처리할 수 있는 prop 추가
- `FE/user-web/src/pages/settings/index.tsx`는 `SettingsScreen variant="page"`만 렌더링

제외 범위:

- 계정 모달 연결
- route 삭제
- API 변경

완료 기준:

- `/app/settings`에서 기존 설정 기능이 유지된다.
- TypeScript import/export가 정리된다.
- 기존 `/app/settings` UI의 loading, error, success notice, form 저장이 깨지지 않는다.

상세 명세:

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-SPECS/G01_SETTINGS_SCREEN_EXTRACTION.md`

## 4. G02 Account modal integration

목적:

- 계정 드롭다운 `Settings` 클릭 후 열리는 모달 안에서 전체 설정 내용을 사용할 수 있게 한다.

포함 범위:

- `AppShell`의 `AccountSettingsModalContent` 중복 form 제거
- `SettingsScreen variant="modal"` 연결
- modal content width, padding, scroll, notice 표시 조정
- 계정 모달 왼쪽 sidebar의 selected/hover/active interaction 유지
- `Notifications` section의 `ServiceNotificationSettingsSection` 유지

제외 범위:

- `/app/notifications` 알림 목록 이동
- Profile tab 폐지
- OAuth callback 후 modal 자동 열기

완료 기준:

- 계정 메뉴에서 `Settings`를 누르면 모달 안에서 전체 설정이 보인다.
- 계정 메뉴에서 `Notifications`를 누르면 서비스 알림과 브라우저 푸시 설정이 그대로 보인다.
- 저장, 다시 시도, 연동 설정 notice가 modal 안에서 동작한다.

상세 명세:

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-SPECS/G02_ACCOUNT_MODAL_INTEGRATION.md`

## 5. G03 Route/link QA

목적:

- 기존 route와 link 호환성을 깨지 않았는지 확인한다.

포함 범위:

- `/app/settings` 직접 진입 smoke
- legacy `/settings` redirect 확인
- `/app/settings` 참조 위치 검토
- Google Calendar `returnTo: "/app/settings"` 유지 확인
- analytics route key 유지 확인
- `npm run build` 또는 repo 기준 frontend 검증 명령 실행

제외 범위:

- link를 modal deep-link로 바꾸는 설계
- 새 E2E suite 대량 추가

완료 기준:

- 기존 `/app/settings` link가 모두 동작한다.
- 계정 모달 settings와 `/app/settings` page가 같은 feature screen을 사용한다.
- `FE/user-web` build 검증이 통과한다.

상세 명세:

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-SPECS/G03_ROUTE_LINK_QA.md`

## 6. 관련 문서

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/README.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/SCOPE.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/USER-FLOW.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/FE-TODO/USER-WEB-TODO.md`
