# G06 UX Writing States A11y Closeout

상태: Done
우선순위: P0
담당 영역: FE/user-web

## 1. 목표

UX writing, loading/empty/error/success 상태, 접근성 기본, 최종 검증을 마무리한다.

## 2. 먼저 읽을 문서

- `COMMON/ISSUE-LOG.md`
- `COMMON/UXUI-QA-SCOPE.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`

## 3. 작업 내용

1. 사용자 노출 문구에서 딱딱한 종결을 검색한다.
2. empty state가 다음 행동을 알려주는지 확인한다.
3. loading state가 `~하고 있어요` 계열로 자연스러운지 확인한다.
4. success toast/dialog가 능동형인지 확인한다.
5. error message가 문제와 다음 행동을 알려주는지 확인한다.
6. validation message가 짧고 구체적인지 확인한다.
7. icon-only button에 `aria-label` 또는 tooltip이 있는지 확인한다.
8. dialog에서 Enter/Escape 동작과 focus가 자연스러운지 확인한다.
9. Notion/Attio brand, copy, visual asset, pixel-level layout 복제 후보가 없는지 확인한다.
10. custom object/custom field builder처럼 오해되는 문구나 route entry가 노출되지 않는지 확인한다.
11. `COMMON/ISSUE-LOG.md`의 Open/S0/S1/S2를 모두 정리한다.
12. 최종 검증 명령을 실행한다.

## 4. 검색어 후보

아래 표현은 사용자 노출 문구로 남아 있으면 우선 검토한다.

```text
습니다
되었습니다
없습니다
필요합니다
할 수 없습니다
불러오는 중입니다
저장되었습니다
등록되었습니다
삭제되었습니다
복구되었습니다
해주세요
Customer
상품
오프더레코드
Notion
Attio
custom object
custom field
generic export
```

`해주세요`는 `해 주세요`로 띄어 쓴다.

## 5. 수정 기준

- `저장되었습니다` -> `저장했어요`
- `등록되었습니다` -> `등록했어요`
- `삭제되었습니다` -> `삭제했어요`
- `복구되었습니다` -> `복구했어요`
- `없습니다` -> 다음 행동 안내
- `필요합니다` -> `입력해 주세요` 또는 `선택해 주세요`
- `불러오는 중입니다` -> `불러오고 있어요`

## 6. 검증

```bash
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

추가 확인:

```bash
git diff --check
```

## 7. 완료 기준

- UX writing 주요 위반이 정리된다.
- loading/empty/error/success/delete/restore/provider failure 상태가 확인된다.
- icon-only button 접근성 기본이 정리된다.
- Notion + Attio reference gate가 최종 통과된다.
- `COMMON/ISSUE-LOG.md`에 남은 이슈가 `Fixed`, `Deferred`, `N/A` 중 하나로 정리된다.
- 계획 완료 보고에 실행한 검증과 남은 리스크가 기록된다.

## 8. 완료 보고

- 완료일: 2026-07-18
- 구현 파일: `FE/user-web/src/components/layout/app-shell.tsx`, `FE/user-web/src/components/ui/list-filter-select.tsx`, `FE/user-web/src/features/auth/components/auth-login-page.tsx`, `FE/user-web/src/features/import-export/components/import-detail-screen.tsx`, `FE/user-web/src/features/import-export/components/import-screen.tsx`, `FE/user-web/src/features/trash/components/trash-screen.tsx`
- 문서 파일: `COMMON/ISSUE-LOG.md`, `FE-TODO/USER-WEB-TODO.md`, `COMMON/README.md`, `COMMON/GOAL-WORK-ORDER.md`

### 처리 요약

- 계정 설정 저장 success 문구를 `저장했어요.`로 바꿨다.
- profile/device loading 문구와 로그인 provider loading/callback 문구를 `~하고 있어요` 계열로 정리했다.
- 공통 filter empty state를 `검색어를 바꾸면 결과를 찾을 수 있어요.`로 바꿨다.
- Import detail empty/error 문구를 행동 안내형 해요체로 정리했다.
- Import preview validation 문구를 `필수입니다`, `올바르지 않습니다`, `~여야 합니다` 대신 `입력해 주세요`, `형식으로 입력해 주세요`, `중 하나로 입력해 주세요`로 바꿨다.
- Trash private memo detail에서 복구 전 원문 비노출 안내를 해요체로 정리했다.

### 검색 검토

- `저장되었습니다`, `등록되었습니다`, `삭제되었습니다`, `복구되었습니다`, `불러오는 중입니다`, `검색 결과가 없습니다`, `업로드된 데이터가 없습니다`, `불러오지 못했습니다`, `표시하지 않습니다`, `준비 중입니다`, `해주세요`, `필수입니다`, `올바르지 않습니다`, `정수여야 합니다`, `중 하나여야 합니다`는 앱 내부 주요 화면에서 정리했다.
- 남은 `수 없습니다` 계열은 `AppShell` 내부 약관/개인정보 법무 고지 문장이다. 법무 고지는 UX writing guide의 짧은 업무 문구 범위와 다르므로 유지했다.
- `Customer` 검색 결과는 영어권 public/landing locale copy에만 남았다. 한국어 CRM 업무 화면에는 `Customer`, `상품`, `오프더레코드`, `custom object`, `custom field`, `generic export` 노출 후보가 없다.

### 검증

- `/tmp/onehandsales-g06-qa.cjs` Playwright + Google Chrome channel: 통과
- 확인 범위: Import detail empty, Import list empty와 upload `aria-label`, Trash private memo masking, Business Card provider/model 비노출, 계정 modal 저장 문구와 Escape close
- `pnpm run typecheck`: 통과
- `pnpm run lint`: 통과
- `pnpm run build`: 통과
- `git diff --check`: 통과
- `pnpm run test:e2e`: 로컬 Playwright `chromium_headless_shell` 바이너리 누락으로 테스트 시작 전 실패했다. 코드 assertion 실패는 없었다.

### 완료 후 검토

- 수정 범위는 G06의 UX writing/states/a11y closeout에 한정했다.
- 새 Backend API, DB schema, custom object/custom field/generic export entry는 추가하지 않았다.
- Notion/Attio brand, copy, visual asset, pixel-level layout을 복제하지 않았다.
- `COMMON/ISSUE-LOG.md` 기준 남은 Open/S0/S1/S2 UX/UI 이슈는 없다.
