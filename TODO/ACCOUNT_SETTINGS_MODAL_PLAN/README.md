# Account Settings Modal Plan

상태: Draft / Active UXUI improvement
원천: `/app/settings`의 설정/요청/연동 기능을 계정 모달 `Settings` 안으로 단계별 이관하는 UX/UI 개선 요청
작성 기준: 2026-08-20 계정 모달, 알림 설정, 사이드바 UX/UI 개선 흐름

## 1. 목적

이 폴더는 `FE/user-web`의 `/app/settings` 화면에 흩어진 설정 기능을 계정 드롭다운에서 여는 모달의 `Settings` 섹션으로 단계별 이관하기 위한 실행 계획이다.

사용자는 좌측 사이드바나 별도 설정 페이지로 이동하지 않고, 현재 업무 맥락을 유지한 채 계정 메뉴 안에서 앱 기본값, 연동 설정, 데이터 요청을 확인하고 수정할 수 있어야 한다. 계정 모달 `Profile`에 이미 있는 읽기 전용 계정 정보, linked providers, devices, user id는 `Settings`에 다시 복제하지 않는다. 이 방향은 `Notion식 작업공간 UX + Attio식 CRM record 관계 UX` 중 조용한 workspace navigation, 낮은 시각 소음, 현재 맥락 유지 원칙을 따른다.

## 2. 현재 결정

- 작업 대상은 `FE/user-web`만이다. `FE/admin-web`, `BE`, `BE/prisma`는 이번 계획의 구현 대상이 아니다.
- `/app/settings`는 사용자-facing 설정 page로 유지하지 않는 방향으로 이관한다. 기존 링크와 진입점은 계정 모달 `Settings`를 여는 흐름으로 바꾼다.
- Google Calendar OAuth 때문에 `/app/settings` route는 즉시 hard delete하지 않는다. BE 변경 없이 진행하는 기본안은 `/app/settings`를 같은 설정 page가 아니라 modal-open bridge 또는 safe redirect로만 남기는 것이다. route 자체 삭제는 BE `returnTo` allowlist 변경이 필요한 별도 결정이다.
- 계정 모달의 `Profile` 섹션은 계정 식별/상태/linked providers/devices/user id 확인 영역으로 유지한다.
- 계정 모달의 `Settings` 섹션은 `/app/settings`에서 Profile과 중복되지 않는 설정 기능을 단계별로 담는다.
- `/app/settings` 기존 link를 modal로 바꾸기 위해 단일 modal-open contract를 둔다. 기본안은 URL query 기반이며, `AppShell`이 query를 감지해 계정 모달 `Settings`를 열고 닫을 때 query를 정리한다.
- 이관은 `/app/settings`의 page UI를 그대로 붙여 넣는 방식이 아니다. 기존 계정 모달의 `Settings`, `Notifications`, `Terms`, `Privacy` 탭이 쓰는 modal content wrapper, heading, section divider, density, scroll 패턴에 맞춰 재구성한다.
- 계정 모달의 `Notifications` 섹션은 이미 분리된 `ServiceNotificationSettingsSection`을 유지한다. 여기에는 서비스 알림과 브라우저 푸시 설정이 포함된다.
- `/app/notifications` 페이지는 알림 목록 확인 페이지로 유지한다. 알림 목록을 계정 모달로 옮기지 않는다.
- 새 API, 새 DB schema, 새 backend transaction은 만들지 않는다. 현재 구현된 profile, devices, account request, Google Calendar, follow-up delivery, notification settings API를 그대로 사용한다.
- 구현 구조는 한 번에 전체 화면을 복제하지 않고, 계정 모달 `Settings` 안으로 section 단위로 이관한다. 첫 이관 대상은 `AccountDataRequestsSettingsSection`이다.

## 3. 실행 전제

| Gate | 조건 |
| --- | --- |
| UX 방향 | `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`의 white/neutral gray, 낮은 시각 소음, page/modal 맥락 유지 기준을 따른다. |
| Frontend 구조 | `AppShell` 계정 모달은 Profile/Settings/Notifications 역할을 분리하고, `/app/settings`의 기능성 section을 Settings 모달로 단계별 이관한다. |
| Modal 구성 | 기존 account modal의 `section min-h-full bg-white px-8 py-10 md:px-12`, inner max-width, 28px heading, 14px description, `ProfileSection` divider 패턴을 우선한다. |
| API 계약 | 새 API가 없으므로 `COMMON/API-SPEC/NO_API_CHANGE.md`를 기준으로 기존 API 소비만 검증한다. |
| Route 호환성 | 기존 `/app/settings` link와 legacy `/settings`는 사용자-facing page가 아니라 Settings modal-open 흐름으로 정리한다. OAuth callback은 BE allowlist 제약을 고려해 bridge 또는 별도 BE 계획으로 처리한다. |
| 알림 범위 | 서비스 알림과 브라우저 푸시는 계정 모달 `Notifications`에 유지하고, 알림 목록은 `/app/notifications`에 유지한다. |

## 4. 문서 구조

| 문서 | 역할 |
| --- | --- |
| `COMMON/SCOPE.md` | 포함 범위, 제외 범위, 현재 코드 상태 |
| `COMMON/USER-FLOW.md` | 사용자가 계정 메뉴와 설정 모달을 사용하는 흐름 |
| `COMMON/GOAL-WORK-ORDER.md` | `/goal` 실행 순서 |
| `COMMON/GOAL-SPECS/G01_SETTINGS_SCREEN_EXTRACTION.md` | Profile/Settings 역할 분리와 Settings modal 이관 기반 정리 |
| `COMMON/GOAL-SPECS/G02_ACCOUNT_MODAL_INTEGRATION.md` | `/app/settings`의 기능성 section을 Settings modal로 단계별 이관 |
| `COMMON/GOAL-SPECS/G03_ROUTE_LINK_QA.md` | `/app/settings` 사용자-facing page 제거와 link/modal-open QA |
| `COMMON/API-SPEC/NO_API_CHANGE.md` | API/DB 변경 없음 계약 |
| `COMMON/PLANNING-REVIEW.md` | 구현 전 기획 검토 결과 |
| `COMMON/REFERENCES.md` | 관련 AGENT 문서와 코드 위치 |
| `FE-TODO/USER-WEB-TODO.md` | User Web 구현 작업 |
| `BE-TODO/API-TODO.md` | Backend API 변경 없음 기준 |
| `BE-TODO/DB-SCHEMA.md` | DB schema 변경 없음 기준 |

## 5. 현재 금지

- `FE/admin-web` 수정 금지
- 새 `/api/settings/*` 또는 `/api/account-settings/*` API 추가 금지
- Prisma migration 추가 금지
- `/app/settings`를 기존과 같은 독립 설정 page로 계속 유지하는 구현 금지
- `/app/settings` page card/layout을 계정 모달 안에 그대로 붙여 넣는 구현 금지
- Google Calendar OAuth `returnTo: "/app/settings"`를 BE allowlist와 callback 동작 검증 없이 변경 금지
- Settings modal-open 진입 방식을 컴포넌트별 임시 state/event로 제각각 구현 금지
- `/app/notifications`의 알림 목록을 계정 모달로 이동 금지
- Profile tab에 이미 있는 계정 정보, linked providers, devices, user id를 Settings tab에 다시 복제 금지
- `/app/settings` bridge와 modal이 서로 다른 설정 form을 갖도록 중복 구현 금지
- blue를 전역 active identity로 강화하는 UI 변경 금지

## 6. 다음에 할 일

1. `COMMON/PLANNING-REVIEW.md`의 통과 판정을 확인한다.
2. `G01`에서 Profile/Settings 중복 기준과 modal notice/section 배치 기반을 정리한다.
3. `G02`에서 첫 이관 대상으로 `/app/settings`의 account data request section을 계정 모달 `Settings`로 옮긴다.
4. `G03`에서 `/app/settings` link, legacy route, OAuth return path를 modal-open 또는 bridge 흐름으로 검증한다.

## 7. 관련 문서

- `AGENT/README.md`
- `AGENT/AGENT_USAGE_RULES.md`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`
- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-WORK-ORDER.md`
