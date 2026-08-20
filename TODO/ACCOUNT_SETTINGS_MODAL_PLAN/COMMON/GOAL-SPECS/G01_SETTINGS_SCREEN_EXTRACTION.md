# G01 Settings Screen Extraction

상태: Draft / Implementation goal

## 1. 목적

`/app/settings` page에 직접 들어 있는 설정 화면 구현을 `features/settings`로 옮겨 page와 modal이 같은 화면을 재사용할 수 있게 한다.

이 goal은 구조 분리만 담당한다. 계정 모달 연결은 G02에서 진행한다.

## 2. 반드시 먼저 읽을 문서

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/README.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/SCOPE.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/USER-FLOW.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`

## 3. 변경 대상

| 파일 또는 폴더 | 작업 |
| --- | --- |
| `FE/user-web/src/features/settings` | 새 feature 폴더 생성 |
| `FE/user-web/src/features/settings/components/settings-screen.tsx` | `/app/settings`의 전체 설정 화면 구현 이동 |
| `FE/user-web/src/features/settings/index.ts` | `SettingsScreen` export |
| `FE/user-web/src/pages/settings/index.tsx` | route entry로 축소 |

## 4. 구현 규칙

- `SettingsScreen`은 `variant: "page" | "modal"` prop을 받는다.
- `variant="page"`는 기존 `/app/settings`의 page padding과 max width를 유지한다.
- `variant="modal"`은 G02에서 사용할 수 있도록 modal 안쪽 content width와 padding을 분리할 수 있어야 한다.
- profile, devices, account data request, Google Calendar, follow-up delivery는 기존 API hook과 component를 그대로 사용한다.
- success notice는 page와 modal에서 모두 닫을 수 있어야 한다.
- `pages/settings/index.tsx`는 API 호출, form state, helper function을 직접 소유하지 않는다.
- `any`를 사용하지 않는다.
- 새 공통 UI가 필요하면 먼저 기존 `components/ui`와 feature 내부 component로 해결한다.

## 5. 제외 범위

- `AppShell`의 계정 모달 연결
- 계정 모달 sidebar 항목 변경
- `/app/settings` route 삭제
- API client 변경
- Backend/DB 변경

## 6. 완료 기준

- `/app/settings`가 `SettingsScreen variant="page"`로 렌더링된다.
- 기존 `/app/settings`의 주요 설정 섹션이 모두 보인다.
- profile 저장, account data request, Google Calendar, follow-up delivery, devices 조회가 이전과 같은 API를 사용한다.
- TypeScript compile error가 없다.

## 7. 검증

권장 명령:

```powershell
cd FE/user-web
npm run build
```

수동 smoke:

- `/app/settings` 직접 진입
- profile/defaults 저장
- account data request section 표시
- Google Calendar section 표시
- follow-up delivery section 표시
- devices section 표시

## 8. 관련 문서

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/FE-TODO/USER-WEB-TODO.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/API-SPEC/NO_API_CHANGE.md`
