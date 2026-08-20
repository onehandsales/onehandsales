# Account Settings Modal Plan

상태: Draft / Active UXUI improvement
원천: 계정 모달 `Settings` 안으로 `/app/settings` 내용을 옮기는 UX/UI 개선 요청
작성 기준: 2026-08-20 계정 모달, 알림 설정, 사이드바 UX/UI 개선 흐름

## 1. 목적

이 폴더는 `FE/user-web`의 `/app/settings` 화면 내용을 계정 드롭다운에서 여는 모달의 `Settings` 섹션으로 옮기기 위한 실행 계획이다.

사용자는 좌측 사이드바나 별도 설정 페이지로 이동하지 않고, 현재 업무 맥락을 유지한 채 계정 메뉴 안에서 앱 기본값, 연동 설정, 데이터 요청, 기기 정보를 확인하고 수정할 수 있어야 한다. 이 방향은 `Notion식 작업공간 UX + Attio식 CRM record 관계 UX` 중 조용한 workspace navigation, 낮은 시각 소음, 현재 맥락 유지 원칙을 따른다.

## 2. 현재 결정

- 작업 대상은 `FE/user-web`만이다. `FE/admin-web`, `BE`, `BE/prisma`는 이번 계획의 구현 대상이 아니다.
- `/app/settings` route는 제거하지 않는다. 기존 링크, legacy `/settings` redirect, Google Calendar OAuth `returnTo` 흐름이 있으므로 같은 설정 화면을 렌더링하는 fallback으로 유지한다.
- 계정 모달의 `Settings` 섹션은 `/app/settings`의 전체 설정 내용을 담는다.
- 계정 모달의 `Notifications` 섹션은 이미 분리된 `ServiceNotificationSettingsSection`을 유지한다. 여기에는 서비스 알림과 브라우저 푸시 설정이 포함된다.
- `/app/notifications` 페이지는 알림 목록 확인 페이지로 유지한다. 알림 목록을 계정 모달로 옮기지 않는다.
- 새 API, 새 DB schema, 새 backend transaction은 만들지 않는다. 현재 구현된 profile, devices, account request, Google Calendar, follow-up delivery, notification settings API를 그대로 사용한다.
- 구현 구조는 `features/settings`를 새로 만들고, `/app/settings` page와 account modal이 같은 `SettingsScreen`을 공유하는 방식으로 잡는다.

## 3. 실행 전제

| Gate | 조건 |
| --- | --- |
| UX 방향 | `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`의 white/neutral gray, 낮은 시각 소음, page/modal 맥락 유지 기준을 따른다. |
| Frontend 구조 | `pages`는 route entry와 조립만 담당하고 실제 설정 UI와 API 상태는 `features/settings` 안으로 옮긴다. |
| API 계약 | 새 API가 없으므로 `COMMON/API-SPEC/NO_API_CHANGE.md`를 기준으로 기존 API 소비만 검증한다. |
| Route 호환성 | `/app/settings`, legacy `/settings`, `/app/settings`로 향하는 기존 link와 OAuth callback return path를 깨지 않는다. |
| 알림 범위 | 서비스 알림과 브라우저 푸시는 계정 모달 `Notifications`에 유지하고, 알림 목록은 `/app/notifications`에 유지한다. |

## 4. 문서 구조

| 문서 | 역할 |
| --- | --- |
| `COMMON/SCOPE.md` | 포함 범위, 제외 범위, 현재 코드 상태 |
| `COMMON/USER-FLOW.md` | 사용자가 계정 메뉴와 설정 page를 사용하는 흐름 |
| `COMMON/GOAL-WORK-ORDER.md` | `/goal` 실행 순서 |
| `COMMON/GOAL-SPECS/G01_SETTINGS_SCREEN_EXTRACTION.md` | `/app/settings` 내용을 reusable feature screen으로 분리 |
| `COMMON/GOAL-SPECS/G02_ACCOUNT_MODAL_INTEGRATION.md` | 계정 모달 `Settings`에 전체 설정 화면 연결 |
| `COMMON/GOAL-SPECS/G03_ROUTE_LINK_QA.md` | 기존 route/link 호환성과 QA |
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
- `/app/settings` route 삭제 금지
- Google Calendar OAuth `returnTo: "/app/settings"`를 검증 없이 변경 금지
- `/app/notifications`의 알림 목록을 계정 모달로 이동 금지
- settings page와 modal이 서로 다른 설정 form을 갖도록 중복 구현 금지
- blue를 전역 active identity로 강화하는 UI 변경 금지

## 6. 다음에 할 일

1. `COMMON/PLANNING-REVIEW.md`의 통과 판정을 확인한다.
2. `G01`에서 `/app/settings`의 설정 UI를 `features/settings`로 분리한다.
3. `G02`에서 계정 모달 `Settings` 섹션이 `SettingsScreen`을 사용하게 연결한다.
4. `G03`에서 기존 route, link, OAuth return path, modal tab, 빌드 검증을 확인한다.

## 7. 관련 문서

- `AGENT/README.md`
- `AGENT/AGENT_USAGE_RULES.md`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`
- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-WORK-ORDER.md`
