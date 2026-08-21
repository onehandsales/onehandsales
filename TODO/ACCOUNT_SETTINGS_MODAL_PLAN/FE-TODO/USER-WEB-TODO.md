# User Web TODO

상태: Implemented / Follow-up migration complete / Google Calendar remaining

## 1. 원칙

이번 작업은 `FE/user-web` 전용 UX/UI 개선이다. `/app/settings`에 있던 설정/요청/연동 기능을 계정 모달 `Settings`로 단계별 이관하고, Profile 탭과 중복되는 읽기 전용 계정 정보는 Settings에 복제하지 않는다.

`FE/admin-web`은 보지 않고 수정하지 않는다.

## 1.1. 구현 전 필수 참조

코드 수정 전 다음 문서를 먼저 확인한다.

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`

## 2. 작업 대상

| 파일 또는 폴더 | 작업 |
| --- | --- |
| `FE/user-web/src/components/layout/app-shell.tsx` | 계정 모달 `Settings`에 account data request와 follow-up delivery section 이관 완료 |
| `FE/user-web/src/features/account-request/components/account-data-requests-settings-section.tsx` | modal presentation 재사용성 반영 완료 |
| `FE/user-web/src/features/follow-up-delivery/components/follow-up-delivery-settings-section.tsx` | modal presentation과 follow-up OAuth callback query 처리 완료 |
| `FE/user-web/src/pages/settings/index.tsx` | 현재 사용자-facing route에서 제외됨. 파일은 legacy/reference 상태로 남아 있음 |
| `FE/user-web/src/app/router/router.tsx` | `/app/settings`와 legacy `/settings` bridge 처리 완료 |
| `FE/user-web/src/pages/more/index.tsx` | settings link를 modal-open 흐름으로 변경 완료 |
| `FE/user-web/src/features/follow-up-delivery` | settings CTA를 modal-open 흐름으로 변경 완료 |
| `FE/user-web/src/features/schedule` | settings CTA는 modal-open 흐름, Google Calendar callback은 schedules bridge 유지 |
| `FE/user-web/src/features/notification/components/service-notification-settings-section.tsx` | 변경 없이 유지. 서비스 알림과 브라우저 푸시 설정 담당 |
| `FE/user-web/src/features/notification/components/notification-screen.tsx` | 변경 없이 유지. `/app/notifications` 알림 목록 담당 |

## 3. 구현 체크리스트

- [x] Profile tab에 이미 있는 account/status/provider/devices/user id는 Settings tab 이관 대상에서 제외한다.
- [x] 현재 Settings modal의 app defaults form을 유지한다.
- [x] Settings modal 안에서 공통 success/error notice를 표시할 수 있게 한다.
- [x] Settings modal을 여는 단일 modal-open contract를 정한다. 기본안은 URL query 기반이다.
- [x] 기존 account modal의 Settings/Notifications/Terms/Privacy content 구조를 기준으로 이관 section을 배치한다.
- [x] `/app/settings`의 page column/card layout을 modal 안에 그대로 복사하지 않는다.
- [x] `AccountDataRequestsSettingsSection`을 Settings modal 안에 렌더링한다.
- [x] account data request 생성/refresh/account deletion request/cancel notice가 modal 안에서 보이게 한다.
- [x] account data request section의 title/description/button/status 문구가 깨지지 않는지 확인한다.
- [x] account deletion request 위험 액션의 확인 문구, disabled 상태, 취소 동작을 확인한다.
- [ ] `GoogleCalendarSettingsSection`을 Settings modal로 이관할지, schedules 화면 소유 callback bridge를 유지할지 결정한다.
- [x] `FollowUpDeliverySettingsSection`을 Settings modal 안에 렌더링한다.
- [x] follow-up delivery settings CTA를 modal-open 흐름으로 바꾼다.
- [x] follow-up OAuth callback `/app/settings?followUpEmailConnection=...&status=...`를 Settings modal에서 처리한다.
- [x] `/app/settings` page의 사용자-facing 의존을 단계적으로 줄인다.
- [x] `pages/settings/index.tsx`는 사용자-facing route에서 제외하고 bridge route를 사용한다.
- [x] 계정 모달 `Notifications`는 `ServiceNotificationSettingsSection`을 유지한다.
- [x] `/app/settings` link와 route 참조를 modal-open 또는 bridge 흐름으로 바꾼다.
- [x] repo 기준 frontend typecheck/lint/build 명령을 실행한다.
- [x] `git diff --check`와 `git diff --stat`로 공백 오류와 변경 범위를 확인한다.
- [x] `FE/admin-web`, `BE`, `BE/prisma` 변경이 없는지 확인한다.

## 4. UI 기준

- neutral gray 중심의 hover, selected, pressed 상태를 유지한다.
- settings modal 안에서 파란색을 전역 active identity로 쓰지 않는다.
- icon은 가능한 `lucide-react`를 사용한다.
- account modal content는 기존 탭과 같은 흰 배경, 좌우 padding, 상단 title/description, section divider, `mt-10 grid gap-10` 계열의 밀도를 따른다.
- section은 `ProfileSection` 계열의 작은 heading과 border-top divider 패턴을 우선한다.
- `Notifications`처럼 독립 패널이 필요한 경우에도 modal wrapper, heading, scroll 규칙은 유지한다.
- page section을 불필요하게 card 안의 card로 중첩하지 않는다.
- 긴 텍스트는 truncate, break-all, responsive grid로 부모 영역을 넘지 않게 한다.
- modal 안의 settings content는 업무용 정보 밀도를 유지하되, 저장 버튼과 위험 행동은 쉽게 찾을 수 있어야 한다.

## 4.1. 주석/로깅 기준

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`를 따른다.
- 새로 만들거나 수정하는 React component/function/hook/event handler/API client/form submit handler/test helper에는 `// 기능 : ...` 1줄 주석을 둔다.
- 함수명을 단순 번역하지 않고 호출자 또는 사용자가 기대하는 기능을 한국어로 적는다.
- JSX 구조 설명용 주석, commented-out code, 직접 `console.log`는 남기지 않는다.
- email, token, memo, meeting note body 같은 PII를 client log로 보내지 않는다.

## 5. 상태 처리 기준

| 상태 | 기준 |
| --- | --- |
| Loading | skeleton 또는 inline loading을 section 안에서 표시한다. |
| Empty | devices, OAuth provider, request 상태가 비어 있을 때 기존 빈 상태 문구를 유지한다. |
| Error | `getApiErrorMessage` 기반 오류와 다시 시도 action을 제공한다. |
| Success | 저장 또는 요청 성공 notice가 modal에서 보인다. |
| Pending | 저장 중 버튼 disabled 또는 pending state를 유지한다. |

## 6. 검증 기준

권장 명령:

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

수동 확인:

- 계정 드롭다운 `Settings` modal 진입
- 계정 드롭다운 `Notifications` modal 진입
- app defaults 저장
- account data request section 표시
- account data request 생성/취소/새로고침 notice
- account data request 문구, request id/status overflow, 위험 액션 안내 확인
- follow-up delivery section 표시
- follow-up delivery callback query 처리와 URL 정리
- modal-open query 추가/제거와 원래 업무 화면 맥락 유지
- `/app/notifications` 알림 목록 유지
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md` 기준 자체 리뷰

## 7. 관련 문서

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-SPECS/G01_SETTINGS_SCREEN_EXTRACTION.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-SPECS/G02_ACCOUNT_MODAL_INTEGRATION.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-SPECS/G03_ROUTE_LINK_QA.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
