# Goal Work Order

상태: Implemented / G01-G03 complete / Google Calendar remaining decision

## 1. 목적

이 문서는 `ACCOUNT_SETTINGS_MODAL_PLAN`의 구현 작업을 한 번에 너무 크게 처리하지 않도록 `/goal` 단위로 나눈다.

작업은 순서대로 진행한다. 선행 goal이 완료 기준을 만족하지 않으면 후속 goal로 넘어가지 않는다.

## 2. 작업 순서

| 순서 | Goal | 목적 | 선행 조건 |
| --- | --- | --- | --- |
| G01 | Settings modal baseline | 계정 모달 Profile/Settings 역할을 분리하고 Settings modal 이관 기반을 정리한다. | 완료 |
| G02 | Section migration | `/app/settings`의 기능성 section을 계정 모달 `Settings`로 이관한다. account data request와 follow-up delivery는 완료됐다. | 완료 |
| G03 | Route/link removal QA | `/app/settings` 사용자-facing page 의존을 제거하고 link, legacy route, OAuth callback, build를 검증한다. | 완료 |
| Remaining | Google Calendar settings decision | `GoogleCalendarSettingsSection`을 Settings modal로 이관할지, schedules 화면 소유 callback bridge를 유지할지 결정한다. | 미결정 |

## 2.1. 구현 전 필수 참조

모든 FE 코드 수정 goal은 구현 전에 다음 문서를 먼저 확인한다.

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`

## 2.2. 구현 후 필수 리뷰

모든 FE 코드 수정 goal은 완료 전에 다음을 확인한다.

- `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`
- `git diff --check`
- `git diff --stat`로 `FE/admin-web`, `BE`, `BE/prisma` 변경 없음 확인
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md` 기준 자체 리뷰
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md` 기준 `// 기능 : ...` 주석 확인
- 직접 `console.log`, PII client logging, `any`, User Web의 `/admin/api/*` 호출 없음 확인

## 3. G01 Settings modal baseline

목적:

- 계정 모달 안에서 `Profile`과 `Settings`의 역할을 분리하고, section 단위 이관을 받을 수 있는 기반을 만든다.

포함 범위:

- `Profile` tab은 account/status/linked providers/devices/user id 확인 영역으로 유지
- `Settings` tab은 설정 변경, 데이터 요청, 연동 설정 영역으로 정의
- 현재 `AccountSettingsModalContent`의 app defaults form을 유지하면서 이후 section을 붙일 수 있게 정리
- Settings modal 안의 success/error notice 위치와 scroll 구조 확인
- Settings/Notifications/Terms/Privacy가 공유하는 modal content wrapper, heading, section divider, spacing 기준 확인
- URL query 기반 modal-open contract 설계

제외 범위:

- `/app/settings` 전체 제거
- account data request 이관
- follow-up delivery 이관
- API 변경

완료 기준:

- 계정 모달 `Profile`과 `Settings`의 중복 기준이 코드와 문서에서 일치한다.
- Settings modal에 section을 추가해도 modal scroll과 notice가 깨지지 않는 구조가 된다.
- 이관 기준이 page layout 복사가 아니라 account modal 내부 구성 패턴으로 정의된다.
- 기존 link를 modal-open으로 바꿀 단일 contract가 정리된다.
- TypeScript import/export가 정리된다.

상세 명세:

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-SPECS/G01_SETTINGS_SCREEN_EXTRACTION.md`

## 4. G02 Section migration

목적:

- `/app/settings`에 있던 기능성 section을 계정 모달 `Settings`로 단계별 이관한다.

포함 범위:

- 첫 이관 대상: `AccountDataRequestsSettingsSection`
- 완료된 추가 이관 대상: follow-up delivery settings
- 남은 결정 대상: Google Calendar settings
- modal content width, padding, scroll, notice 표시 조정
- account data request UI를 기존 account modal section 패턴에 맞게 배치
- account data request 문구, 위험 액션 안내, 긴 request id/status 표시 QA
- 계정 모달 왼쪽 sidebar의 selected/hover/active interaction 유지
- `Notifications` section의 `ServiceNotificationSettingsSection` 유지

제외 범위:

- `/app/notifications` 알림 목록 이동
- Profile tab 제거
- Profile tab의 read-only account/status/provider/devices/user id 정보를 Settings tab에 복제
- Google Calendar OAuth return path 변경
- `/app/settings` hard delete

완료 기준:

- 계정 메뉴에서 `Settings`를 누르면 이관된 section이 모달 안에서 보인다.
- 계정 메뉴에서 `Notifications`를 누르면 서비스 알림과 브라우저 푸시 설정이 그대로 보인다.
- account data request 생성/취소/새로고침과 notice가 modal 안에서 동작한다.
- account data request section에 깨진 문구나 과도한 overflow가 없다.
- follow-up delivery settings가 modal 안에서 동작한다.
- follow-up OAuth callback query가 modal 안에서 처리되고 정리된다.

상세 명세:

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-SPECS/G02_ACCOUNT_MODAL_INTEGRATION.md`

## 5. G03 Route/link removal QA

목적:

- `/app/settings` 사용자-facing page 의존을 제거하고, 기존 진입점이 Settings modal-open 흐름으로 정리됐는지 확인한다.

포함 범위:

- `/app/settings` 참조 위치 검색
- mobile more, follow-up delivery, schedule settings link가 page 이동 대신 Settings modal-open으로 동작하는지 확인
- follow-up delivery OAuth callback query가 Settings modal에서 처리되는지 확인
- legacy `/settings` 처리 확인
- Google Calendar `returnTo`와 BE allowlist 제약 확인
- analytics route key 제거 또는 bridge 기준 정리 확인
- `pnpm run typecheck`, `pnpm run lint`, `pnpm run build` 또는 repo 기준 frontend 검증 명령 실행

제외 범위:

- 새 E2E suite 대량 추가
- BE allowlist 변경이 필요한 hard delete 구현

완료 기준:

- 기존 `/app/settings` link가 사용자-facing page로 이동하지 않는다.
- 필요한 경우 `/app/settings`는 OAuth/legacy bridge로만 동작한다.
- follow-up callback `/app/settings?followUpEmailConnection=...&status=...`가 Settings modal에서 처리된다.
- `FE/user-web` typecheck/lint/build 검증이 통과한다.

상세 명세:

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-SPECS/G03_ROUTE_LINK_QA.md`

## 6. 관련 문서

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/README.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/SCOPE.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/USER-FLOW.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/FE-TODO/USER-WEB-TODO.md`
