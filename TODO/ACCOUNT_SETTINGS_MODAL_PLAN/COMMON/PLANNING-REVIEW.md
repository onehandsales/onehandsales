# 기획 검토 결과

## 1. 결론

- 판정: 통과 / 구현 후 문서 갱신 완료
- 이유: 사용자의 요청은 `/app/settings`의 기존 설정/요청/연동 기능을 계정 모달 `Settings`로 단계별 이관하는 UX/UI 구조 변경이며, 새 API나 DB 변경 없이 `FE/user-web` 내부 modal 연결로 처리할 수 있다. 다만 `/app/settings`를 사용자-facing page로 유지하는 기존 전제는 폐기하고, link는 modal-open 흐름으로 정리해야 한다. Google Calendar OAuth는 BE allowlist 제약 때문에 bridge 또는 별도 BE 계획이 필요하다.

2026-08-21 구현 후 재검토:

- G01/G02/G03는 완료됐다.
- `AccountDataRequestsSettingsSection`과 `FollowUpDeliverySettingsSection`은 계정 모달 `Settings`로 이관됐다.
- `/app/settings`와 legacy `/settings`는 사용자-facing page가 아니라 account settings modal bridge로 동작한다.
- follow-up OAuth callback query는 Settings modal 안에서 처리된다.
- Google Calendar settings는 아직 Settings modal 내부로 이관하지 않았다. 현재는 `/app/settings?googleCalendar=connected`를 schedules 화면으로 bridge해 기존 callback handler를 유지한다.

## 2. 검토 대상

검토한 문서:

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/README.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/SCOPE.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/USER-FLOW.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/API-SPEC/NO_API_CHANGE.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/FE-TODO/USER-WEB-TODO.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/BE-TODO/API-TODO.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/BE-TODO/DB-SCHEMA.md`

기준 문서:

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

## 3. 핵심 발견 사항

| 등급 | 문서 또는 코드 | 문제 | 영향 | 권장 조치 |
| --- | --- | --- | --- | --- |
| Major | `FE/user-web/src/components/layout/app-shell.tsx` | 계정 모달 `Profile`에 account, status, linked providers, devices, user id가 이미 있다. | `/app/settings` 전체를 Settings tab에 넣으면 같은 정보가 중복된다. | Profile은 read-only 계정 정보로 유지하고, Settings에는 설정 변경/요청/연동 기능만 이관한다. |
| Major | `FE/user-web/src/features/schedule/components/google-calendar-settings-section.tsx` | Google Calendar OAuth `returnTo`가 `/app/settings`에 고정되어 있고 BE allowlist도 `/app/settings`를 허용한다. | route를 바로 삭제하면 callback 후 복귀가 깨질 수 있다. | 기본안은 `/app/settings`를 사용자-facing page가 아닌 compatibility bridge로만 남긴다. route hard delete는 별도 BE allowlist 변경 계획으로 분리한다. |

## 4. 누락 사항

- Critical 누락 없음
- Major 누락 없음
- 구현 후 남은 결정: Google Calendar settings의 최종 위치와 `/app/settings` hard delete 여부

## 5. 충돌 사항

- `AGENT` 정본과 충돌 없음
- `Notion식 작업공간 UX + Attio식 CRM record 관계 UX` 기준과 충돌 없음
- User/Admin API 분리 기준과 충돌 없음

## 6. 사용자의 결정이 필요한 질문

- `/app/settings` route를 완전 삭제할지, BE 변경 없이 bridge로 남길지 최종 결정이 필요하다. 기본 구현은 bridge를 전제로 한다.

`Profile` tab과 `Settings` tab의 중복 정보는 이번 문서 업데이트로 제거 기준을 확정했다.

## 7. 구현 가능 여부

- 바로 구현 가능 여부: 가능
- 구현 전 반드시 수정할 항목: 없음
- 첫 번째로 실행한 goal: `G01 Settings modal baseline`
- 현재 남은 작업: `GoogleCalendarSettingsSection`을 Settings modal로 이관할지 또는 schedules bridge를 유지할지 결정

## 8. 검토 체크리스트

- 한국어 작성: 통과
- 사용자 문제와 목적 연결: 통과
- 포함 범위와 제외 범위 분리: 통과
- 관련 문서 경로 연결: 통과
- TODO 폴더 구조 `COMMON`, `FE-TODO`, `BE-TODO`: 통과
- API/DB 변경 없음 계약: 통과
- Frontend 구조 원칙 반영: 통과
- Frontend 주석/로깅 규칙 반영: 통과
- Frontend engineering review gate 반영: 통과
- UX/UI neutral gray, workspace modal 흐름 반영: 통과
- `/goal` 단위 분리: 반영 완료. G01/G02/G03는 완료 상태로 업데이트했고, Google Calendar는 remaining decision으로 분리했다.
