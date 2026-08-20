# G02 Account Modal Integration

상태: Draft / Implementation goal

## 1. 목적

계정 드롭다운의 `Settings`를 누르면 계정 모달 안에서 `/app/settings`의 전체 설정 내용을 사용할 수 있게 한다.

이 goal은 G01에서 분리한 `SettingsScreen`을 `AppShell`의 account modal section에 연결한다.

## 2. 반드시 먼저 읽을 문서

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/README.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/USER-FLOW.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-SPECS/G01_SETTINGS_SCREEN_EXTRACTION.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`

## 3. 변경 대상

| 파일 또는 폴더 | 작업 |
| --- | --- |
| `FE/user-web/src/components/layout/app-shell.tsx` | `AccountSettingsModalContent`의 중복 form을 제거하고 `SettingsScreen variant="modal"` 연결 |
| `FE/user-web/src/features/settings/components/settings-screen.tsx` | modal variant padding, width, scroll, notice 위치 조정 |
| `FE/user-web/src/features/settings/index.ts` | `AppShell`에서 import할 public export 유지 |

## 4. 구현 규칙

- `AccountModalSectionContent`에서 `section === "settings"`일 때 `SettingsScreen variant="modal"`을 반환한다.
- 계정 모달 `Notifications`는 계속 `ServiceNotificationSettingsSection`을 반환한다.
- `SettingsScreen variant="modal"`은 modal 내부에서 독립 scroll이 자연스럽게 동작해야 한다.
- modal body 안의 button, input, select, section hover는 neutral gray 중심의 기존 sidebar 톤과 충돌하지 않아야 한다.
- 저장 성공 또는 연동 안내 notice가 modal 밖으로 밀려나지 않아야 한다.
- 긴 이메일, user id, timezone, provider email은 줄바꿈 또는 truncation으로 부모 영역을 넘지 않아야 한다.
- 모달 왼쪽 sidebar의 hover, active, pressed 색상은 현재 app sidebar 기준과 맞춘다.

## 5. 제외 범위

- `/app/notifications` 알림 목록 이동
- 계정 모달 `Profile`, `Terms`, `Privacy` 섹션 삭제
- OAuth callback 후 modal 자동 열기
- `/app/settings` link를 modal deep-link로 변경
- Backend/DB 변경

## 6. 완료 기준

- 계정 드롭다운에서 `Settings`를 누르면 modal이 열리고 `Settings` sidebar item이 선택된다.
- modal Settings 안에서 `/app/settings`의 전체 설정 섹션을 볼 수 있다.
- profile/defaults 저장이 modal 안에서 가능하다.
- account data request, Google Calendar, follow-up delivery, devices 섹션이 modal 안에서 표시된다.
- 계정 드롭다운에서 `Notifications`를 누르면 서비스 알림과 브라우저 푸시 설정이 계속 표시된다.

## 7. 검증

권장 명령:

```powershell
cd FE/user-web
npm run build
```

수동 smoke:

- `/app`에서 계정 드롭다운 열기
- `Settings` 클릭
- modal sidebar selected 상태 확인
- profile/defaults 저장
- modal 안쪽 scroll 확인
- `Notifications` 클릭 후 서비스 알림과 브라우저 푸시 표시 확인
- modal 닫기 후 원래 page 유지 확인

## 8. 관련 문서

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/FE-TODO/USER-WEB-TODO.md`
