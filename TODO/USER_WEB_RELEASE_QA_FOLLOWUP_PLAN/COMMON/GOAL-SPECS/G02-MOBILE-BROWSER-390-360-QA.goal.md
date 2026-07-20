# G02 Mobile Browser 390/360 QA

상태: Ready
우선순위: P0
담당 영역: FE/user-web

## 1. 목표

모바일 브라우저 Web 기준으로 390px와 360px에서 User Web 핵심 업무 흐름이 사용 가능한지 확인하고, 발견 이슈를 심각도별로 정리한다.

## 2. 먼저 읽을 문서

- `AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md`의 `26. 모바일 브라우저 QA`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/TESTING.md`
- `TODO/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN/COMMON/USER-FLOW.md`
- `FE/user-web/tests/e2e/user-web-smoke.spec.ts`
- `FE/user-web/playwright.config.ts`

## 3. 포함 범위

- 390px viewport mobile browser QA
- 360px viewport mobile browser QA
- Chrome channel 확인
- Edge channel 확인 또는 Edge channel 부재 기록
- AppShell mobile header, bottom navigation, more menu
- `/app`, `/app/companies`, `/app/contacts`, `/app/products`, `/app/deals`, `/app/schedules`, `/app/meeting-notes`, `/app/business-cards`, `/app/import`, `/app/trash`, `/app/settings`, `/app/more`
- 긴 이름, 긴 이메일, 긴 전화번호, 긴 URL overflow smoke
- dialog, create panel, dropdown, toast, keyboard focus smoke
- page-level horizontal overflow 금지 확인

## 4. 제외 범위

- iOS/Android 네이티브 앱 기능
- Safari QA
- 실제 모바일 기기 성능 측정
- Notification 구현
- Admin Web QA
- API response shape 변경

## 5. 구현 지침

기본 `pnpm run test:e2e`를 무겁게 만들지 않는다. 모바일/브라우저 QA는 별도 release QA 설정으로 분리한다.

권장 변경:

- `FE/user-web/playwright.release-qa.config.ts` 추가
- `FE/user-web/tests/e2e/support/user-web-api-mocks.ts` 추가 또는 기존 smoke spec의 mock helper를 안전하게 분리
- `FE/user-web/tests/e2e/mobile-browser-qa.spec.ts` 추가
- `FE/user-web/package.json`에 아래 계열 script 추가

```json
{
  "test:e2e:mobile": "playwright test -c playwright.release-qa.config.ts tests/e2e/mobile-browser-qa.spec.ts"
}
```

Release QA config의 권장 project:

```text
mobile-chrome-390: channel chrome, viewport 390x844, isMobile true, hasTouch true
mobile-chrome-360: channel chrome, viewport 360x740, isMobile true, hasTouch true
mobile-edge-390: channel msedge, viewport 390x844, isMobile true, hasTouch true
mobile-edge-360: channel msedge, viewport 360x740, isMobile true, hasTouch true
```

Edge channel이 설치되어 있지 않으면 테스트를 통과한 것처럼 기록하지 않는다. `Blocked`로 기록하고 수동 Edge 확인 또는 Edge 설치 조치를 적는다.

## 6. 자동 QA 체크

각 viewport/project에서 아래를 확인한다.

- 보호 route redirect가 동작한다.
- mock authenticated session으로 `/app` 진입이 가능하다.
- mobile header와 bottom navigation이 겹치지 않는다.
- 주요 route 이동 중 page error와 console error가 없다.
- `document.documentElement.scrollWidth <= window.innerWidth + 2`를 만족한다. 단, Import preview 같은 의도된 내부 table scroll은 page-level overflow로 보지 않는다.
- dialog는 viewport 안에서 열리고 닫힌다.
- create form의 저장 버튼이 키보드 focus 순서에서 접근 가능하다.
- 긴 텍스트 fixture가 card/list/dialog 밖으로 뚫고 나가지 않는다.

## 7. 수동 QA 체크

자동화가 확인하기 어려운 항목은 브라우저에서 직접 본다.

- 360px에서 하단 navigation label이 서로 겹치지 않는다.
- 딜 단계 탭은 가로 스크롤 또는 줄바꿈 없이 선택 가능하다.
- 일정 생성에서 mobile keyboard가 올라와도 입력 중인 필드와 저장 버튼을 사용할 수 있다.
- 회의록 긴 입력이 화면 아래로 밀려 저장 버튼을 숨기지 않는다.
- Trash 복구 버튼이 위험 행동처럼 구분된다.

## 8. 검증 명령

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
pnpm run test:e2e:mobile
git diff --check
```

## 9. 완료 기준

- Chrome 390px와 360px 결과가 기록되어 있다.
- Edge 390px와 360px 결과가 기록되어 있거나, Edge channel 부재가 `Blocked`로 기록되어 있다.
- `RQA-002`가 `Fixed` 또는 `Blocked`로 정리되어 있다.
- S0/S1/S2 모바일 이슈가 없거나 G06 선행 수정 대상으로 기록되어 있다.
- 자동 검증과 수동 확인 결과가 `COMMON/QA-RESULTS.md`에 기록되어 있다.

