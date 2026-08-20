# 기획 검토 결과

## 1. 결론

- 판정: 통과
- 이유: 사용자의 요청은 `/app/settings`의 기존 설정 기능을 계정 모달 `Settings`로 옮기는 UX/UI 구조 변경이며, 새 API나 DB 변경 없이 `FE/user-web` 내부 구조 분리와 modal 연결로 처리할 수 있다. 기존 `/app/settings` route를 fallback으로 유지하면 link와 OAuth return path 호환성도 지킬 수 있다.

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
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`

## 3. 핵심 발견 사항

| 등급 | 문서 또는 코드 | 문제 | 영향 | 권장 조치 |
| --- | --- | --- | --- | --- |
| Minor | `FE/user-web/src/components/layout/app-shell.tsx` | 계정 모달 `Profile`과 `/app/settings`의 account information 일부가 겹친다. | Settings tab에 전체 설정을 넣으면 정보가 중복으로 보일 수 있다. | 이번 goal에서는 Profile tab을 유지하고, Settings tab에는 `/app/settings` 전체를 옮긴다. 중복 축소는 별도 UX 결정으로 분리한다. |
| Minor | `FE/user-web/src/features/schedule/components/google-calendar-settings-section.tsx` | Google Calendar OAuth `returnTo`가 `/app/settings`에 고정되어 있다. | route를 삭제하면 callback 후 복귀가 깨진다. | `/app/settings` route를 유지하고 같은 `SettingsScreen`을 렌더링한다. |

## 4. 누락 사항

- Critical 누락 없음
- Major 누락 없음

## 5. 충돌 사항

- `AGENT` 정본과 충돌 없음
- `Notion식 작업공간 UX + Attio식 CRM record 관계 UX` 기준과 충돌 없음
- User/Admin API 분리 기준과 충돌 없음

## 6. 사용자의 결정이 필요한 질문

- 현재 구현 시작을 막는 질문 없음

`Profile` tab과 `Settings` tab의 중복 정보를 줄일지 여부는 구현 후 실제 화면 밀도를 보고 별도 UX 판단으로 처리한다.

## 7. 구현 가능 여부

- 바로 구현 가능 여부: 가능
- 구현 전 반드시 수정할 항목: 없음
- 첫 번째로 실행할 goal: `G01 Settings screen extraction`

## 8. 검토 체크리스트

- 한국어 작성: 통과
- 사용자 문제와 목적 연결: 통과
- 포함 범위와 제외 범위 분리: 통과
- 관련 문서 경로 연결: 통과
- TODO 폴더 구조 `COMMON`, `FE-TODO`, `BE-TODO`: 통과
- API/DB 변경 없음 계약: 통과
- Frontend 구조 원칙 반영: 통과
- UX/UI neutral gray, workspace modal 흐름 반영: 통과
- `/goal` 단위 분리: 통과
