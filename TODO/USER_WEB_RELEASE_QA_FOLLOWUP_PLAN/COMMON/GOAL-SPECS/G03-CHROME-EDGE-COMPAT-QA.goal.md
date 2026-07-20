# G03 Chrome Edge Compat QA

상태: Ready
우선순위: P0
담당 영역: FE/user-web

## 1. 목표

Chrome과 Edge 최신 브라우저에서 User Web 핵심 시나리오가 동작하는지 확인한다.

## 2. 먼저 읽을 문서

- `AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md`의 `27. 브라우저 QA`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `TODO/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN/COMMON/USER-FLOW.md`
- `FE/user-web/playwright.release-qa.config.ts`
- `FE/user-web/tests/e2e/user-web-smoke.spec.ts`

## 3. 포함 범위

- Chrome channel desktop QA
- Edge channel desktop QA 또는 Edge channel 부재 기록
- login/protected route smoke
- 회사/담당자/제품/딜/일정/회의록 생성 smoke
- 새로고침 후 상태 유지
- 뒤로가기/앞으로가기 route 상태
- 두 탭에서 같은 데이터 조회/수정 후 새로고침 smoke
- slow network 또는 API delay mock에서 loading state 확인
- console error, page error 확인

## 4. 제외 범위

- Firefox/Safari QA
- 실제 Google OAuth credential 자동 검증
- 실제 외부 Provider 호출
- Admin 운영 화면 QA
- 모바일 390px/360px QA

## 5. 구현 지침

G02에서 만든 `playwright.release-qa.config.ts`를 확장한다.

권장 project:

```text
desktop-chrome: channel chrome, viewport 1440x1000
desktop-edge: channel msedge, viewport 1440x1000
```

권장 script:

```json
{
  "test:e2e:browsers": "playwright test -c playwright.release-qa.config.ts tests/e2e/browser-compat-qa.spec.ts"
}
```

새 spec은 기존 smoke의 API mock을 재사용한다. 외부 OAuth, OpenAI, OCR, Calendar provider는 직접 호출하지 않는다.

## 6. 자동 QA 체크

- Chrome과 Edge에서 같은 spec이 같은 기대값으로 통과한다.
- `page.on("console")`, `page.on("pageerror")`를 수집하고 예상하지 않은 error를 실패 처리한다.
- route reload 후 현재 화면의 핵심 heading/action이 다시 보인다.
- back/forward 후 route와 selected navigation이 맞다.
- API delay mock 중 loading 또는 disabled 상태가 보인다.
- multi-tab smoke는 같은 mock store 또는 실제 API에서 데이터가 꼬이지 않는지 확인한다.

## 7. 검증 명령

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
pnpm run test:e2e:browsers
git diff --check
```

## 8. 완료 기준

- Chrome desktop QA 결과가 `QA-RESULTS.md`에 있다.
- Edge desktop QA 결과가 `QA-RESULTS.md`에 있거나 Edge channel 부재가 `Blocked`로 기록되어 있다.
- `RQA-003`이 `Fixed` 또는 `Blocked`로 정리되어 있다.
- 브라우저별 S0/S1/S2 issue가 없거나 G06 선행 수정 대상으로 기록되어 있다.

