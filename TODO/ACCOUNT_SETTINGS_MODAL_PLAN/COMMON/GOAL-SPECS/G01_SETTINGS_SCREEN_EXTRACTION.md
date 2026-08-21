# G01 Settings Modal Baseline

상태: Completed / Implemented

## 1. 목적

계정 모달 안에서 `Profile`과 `Settings`의 역할을 명확히 분리하고, `/app/settings`의 기능성 section을 하나씩 이관할 수 있는 기반을 만든다.

이 goal은 이관 기반을 담당했고, 첫 실제 이관 대상인 account data request section은 G02에서 완료됐다.

## 2. 반드시 먼저 읽을 문서

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/README.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/SCOPE.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/USER-FLOW.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`

## 3. 변경 대상

| 파일 또는 폴더 | 작업 |
| --- | --- |
| `FE/user-web/src/components/layout/app-shell.tsx` | `Profile`/`Settings` 역할 분리 기준 반영, Settings modal section 추가 준비 |
| `FE/user-web/src/app/router/router.tsx` | `/app/settings` bridge와 modal-open contract 확인 완료 |
| `FE/user-web/src/pages/settings/index.tsx` | 이관 원본으로 참고하되 이 goal에서는 대량 이동하지 않음 |
| `FE/user-web/src/features/account-request` | G02 첫 이관 대상 확인용 참조 |

## 4. 구현 규칙

- `Profile` tab은 account name/email, account status, linked providers, devices, user id를 읽기 전용으로 유지한다.
- `Settings` tab은 app defaults, account data request, Google Calendar, follow-up delivery 같은 설정 변경/요청/연동 기능만 담는다.
- Profile tab에 이미 있는 read-only 정보는 Settings tab에 복제하지 않는다.
- 현재 Settings modal의 locale, timezone, country, currency form은 유지한다.
- success/error notice는 Settings modal 안에서 추가 section과 함께 보일 수 있어야 한다.
- Settings/Notifications/Terms/Privacy 탭이 공유하는 account modal content wrapper, heading, description, section divider, spacing 패턴을 기준으로 삼는다.
- `/app/settings`의 page layout, 2-column grid, page card를 modal 안에 그대로 복사하지 않는다.
- Settings modal은 URL query 기반 modal-open contract로 열 수 있게 설계한다. 외부 컴포넌트마다 임시 event/state를 따로 만들지 않는다.
- 새로 만들거나 수정하는 React component/function/hook/event handler에는 `// 기능 : ...` 1줄 주석을 둔다.
- 직접 `console.log`를 남기지 않는다.
- `any`를 사용하지 않는다.
- 새 공통 UI가 필요하면 먼저 기존 `components/ui`와 feature 내부 component로 해결한다.

## 5. 제외 범위

- account data request 실제 이관은 G02에서 완료
- follow-up delivery 이관은 후속 작업에서 완료
- Google Calendar settings 이관은 남은 결정
- `/app/settings` hard delete
- API client 변경
- Backend/DB 변경

## 6. 완료 기준

- 계정 모달 `Profile`에 있는 read-only 정보와 `Settings`에 둘 기능성 설정의 경계가 코드에서 명확하다.
- Settings modal에 account data request와 follow-up delivery section을 추가할 위치와 notice 처리 방식이 준비되어 있다.
- Settings modal 이관 기준이 기존 account modal 탭들의 section 구조와 일치한다.
- `/app/settings` link를 modal-open으로 바꿀 단일 contract가 결정되어 있다.
- 기존 app defaults 저장이 깨지지 않는다.
- TypeScript compile error가 없다.

## 7. 검증

권장 명령:

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

변경 후 `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md` 기준으로 자체 리뷰를 수행하고, `git diff --check`로 공백 오류를 확인한다.

수동 smoke:

- 계정 모달 `Profile` 진입
- 계정 모달 `Settings` 진입
- app defaults 저장
- modal scroll과 close 동작
- `Notifications` tab 분리 유지

## 8. 관련 문서

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/FE-TODO/USER-WEB-TODO.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/API-SPEC/NO_API_CHANGE.md`
