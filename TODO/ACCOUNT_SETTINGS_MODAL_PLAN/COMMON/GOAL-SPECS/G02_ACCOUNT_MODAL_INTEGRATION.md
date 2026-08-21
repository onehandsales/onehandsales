# G02 Account Settings Section Migration

상태: Draft / Implementation goal

## 1. 목적

계정 드롭다운의 `Settings`를 누르면 계정 모달 안에서 `/app/settings`에서 이관된 설정/요청/연동 section을 사용할 수 있게 한다.

이 goal은 section 단위 이관을 담당한다. 첫 이관 대상은 `AccountDataRequestsSettingsSection`이다.

## 2. 반드시 먼저 읽을 문서

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/README.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/USER-FLOW.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-SPECS/G01_SETTINGS_SCREEN_EXTRACTION.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`

## 3. 변경 대상

| 파일 또는 폴더 | 작업 |
| --- | --- |
| `FE/user-web/src/components/layout/app-shell.tsx` | `AccountSettingsModalContent` 안에 account data request section과 notice 처리 추가 |
| `FE/user-web/src/features/account-request/components/account-data-requests-settings-section.tsx` | modal 안에서 재사용 가능한지 확인하고 필요한 최소 style/prop만 조정 |
| `FE/user-web/src/pages/settings/index.tsx` | 이관 후 중복 표시 제거 또는 후속 route 제거 작업 대상 표시 |

## 4. 구현 규칙

- `AccountModalSectionContent`에서 `section === "settings"`일 때 기존 Settings modal content를 유지하되, 이관된 section을 함께 렌더링한다.
- 계정 모달 `Notifications`는 계속 `ServiceNotificationSettingsSection`을 반환한다.
- `AccountDataRequestsSettingsSection`의 `onNotice` callback은 modal 안에서 보이는 notice로 연결한다.
- account data request UI는 `/app/settings` page card를 그대로 붙이지 않고, 기존 account modal의 heading/section/divider/spacing 패턴에 맞게 배치한다.
- modal body 안의 button, input, select, section hover는 neutral gray 중심의 기존 sidebar 톤과 충돌하지 않아야 한다.
- 저장 성공 또는 연동 안내 notice가 modal 밖으로 밀려나지 않아야 한다.
- 긴 request id와 상태 값은 줄바꿈 또는 truncation으로 부모 영역을 넘지 않아야 한다.
- 기존 `AccountDataRequestsSettingsSection`의 화면 문구가 깨져 보이지 않는지 확인하고, 필요한 경우 이관 범위 안에서 문구를 정상화한다.
- account deletion request는 위험 액션이므로 확인 문구, disabled 상태, 취소 동작이 modal 안에서도 명확해야 한다.
- 모달 왼쪽 sidebar의 hover, active, pressed 색상은 현재 app sidebar 기준과 맞춘다.
- 새로 만들거나 수정하는 React component/function/hook/event handler에는 `// 기능 : ...` 1줄 주석을 둔다.
- 직접 `console.log`를 남기지 않고, PII를 client log로 보내지 않는다.

## 5. 제외 범위

- `/app/notifications` 알림 목록 이동
- 계정 모달 `Profile`, `Terms`, `Privacy` 섹션 삭제
- Profile tab의 read-only account/status/provider/devices/user id 정보를 Settings tab에 복제
- Google Calendar/follow-up delivery 이관
- OAuth callback 후 modal 자동 열기
- `/app/settings` hard delete
- Backend/DB 변경

## 6. 완료 기준

- 계정 드롭다운에서 `Settings`를 누르면 modal이 열리고 `Settings` sidebar item이 선택된다.
- modal Settings 안에서 app defaults와 account data request section을 볼 수 있다.
- app defaults 저장이 modal 안에서 가능하다.
- account data request 생성, refresh, account deletion request/cancel 동작과 notice가 modal 안에서 가능하다.
- account data request section이 Settings/Notifications/Terms/Privacy와 같은 modal density와 scroll 규칙을 따른다.
- account data request section의 title/description/button/status 문구가 정상적으로 읽힌다.
- 계정 드롭다운에서 `Notifications`를 누르면 서비스 알림과 브라우저 푸시 설정이 계속 표시된다.

## 7. 검증

권장 명령:

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

변경 후 `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md` 기준으로 자체 리뷰를 수행하고, `git diff --check`와 `git diff --stat`로 공백 오류와 변경 범위를 확인한다.

수동 smoke:

- `/app`에서 계정 드롭다운 열기
- `Settings` 클릭
- modal sidebar selected 상태 확인
- app defaults 저장
- account data request section 표시와 요청/취소 동작
- 기존 modal 탭과의 heading/spacing/divider 일관성 확인
- account data request 문구, request id/status overflow, 위험 액션 안내 확인
- modal 안쪽 scroll 확인
- `Notifications` 클릭 후 서비스 알림과 브라우저 푸시 표시 확인
- modal 닫기 후 원래 page 유지 확인

## 8. 관련 문서

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/FE-TODO/USER-WEB-TODO.md`
