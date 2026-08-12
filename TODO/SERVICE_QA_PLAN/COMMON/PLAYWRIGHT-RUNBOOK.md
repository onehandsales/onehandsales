# Playwright Runbook

## 1. 목적

기존 Playwright 테스트를 QA 첫 축으로 사용한다. 이 문서는 실행 명령, 결과 해석, 한계, 실패 처리 기준을 정리한다.

## 2. 현재 Playwright 구성

User Web:

- 기본 config: `FE/user-web/playwright.config.ts`
- release QA config: `FE/user-web/playwright.release-qa.config.ts`
- product analytics config: `FE/user-web/playwright.product-analytics.config.ts`
- 테스트 위치: `FE/user-web/tests/e2e`

Admin Web:

- 기본 config: `FE/admin-web/playwright.config.ts`
- 테스트 위치: `FE/admin-web/tests/e2e`

## 3. 실행 명령

User Web 기본 E2E:

```powershell
cd D:\workspace_repository\onehandsales\FE\user-web
pnpm.cmd run test:e2e
```

User Web 모바일 QA:

```powershell
cd D:\workspace_repository\onehandsales\FE\user-web
pnpm.cmd run test:e2e:mobile
```

User Web 브라우저 호환 QA:

```powershell
cd D:\workspace_repository\onehandsales\FE\user-web
pnpm.cmd run test:e2e:browsers
```

User Web analytics QA:

```powershell
cd D:\workspace_repository\onehandsales\FE\user-web
pnpm.cmd run test:e2e:analytics
```

Admin Web E2E:

```powershell
cd D:\workspace_repository\onehandsales\FE\admin-web
pnpm.cmd run test:e2e
```

## 4. Report 확인

실패 후 HTML report가 생성되면 다음 명령으로 확인한다.

```powershell
cd D:\workspace_repository\onehandsales\FE\user-web
pnpm.cmd exec playwright show-report
```

Admin Web report:

```powershell
cd D:\workspace_repository\onehandsales\FE\admin-web
pnpm.cmd exec playwright show-report
```

## 5. 결과 해석

PASS로 볼 수 있는 것:

- 화면 진입, 버튼 클릭, dialog, form, route 이동이 기대대로 동작함
- API client가 올바른 path와 authorization header를 사용함
- mock 응답 기준으로 UI 상태가 올바르게 표시됨
- console에 민감 원문이 직접 노출되지 않음

PASS로 보면 안 되는 것:

- 실제 DB 저장 성공
- 실제 transaction rollback 성공
- 실제 provider 연동 성공
- 실제 migration 상태 정상
- 실제 사용자 ownership 완전 보장

위 항목은 `G04-REAL-BE-INTEGRATION-QA`와 `G06-SECURITY-ADMIN-PRIVACY-QA`에서 별도로 확인한다.

## 6. 실패 처리

Playwright 실패는 다음 순서로 분류한다.

1. 테스트 fixture 또는 mock이 현재 UI/API와 불일치하는가?
2. browser 설치 또는 channel 문제인가?
3. 실제 제품 버그인가?
4. flaky timing 문제인가?

분류 기준:

- 제품 버그면 `ISSUE-LOG.md`에 severity를 부여한다.
- 테스트 fixture 문제면 `S3` 또는 `QA infra`로 기록한다.
- browser 미설치면 `BLOCKED`로 기록한다.
- flaky면 동일 명령 1회 재실행 결과를 함께 기록한다.

## 7. 실제 BE 연동 Playwright 확장 방향

실제 QA가 반복될 경우 mock 기반 spec과 별도로 `real-integration` 계열 spec을 만든다.

권장 기준:

- 실제 provider는 직접 호출하지 않는다.
- 로컬 전용 DB 또는 disposable DB를 사용한다.
- 테스트 계정은 명시적으로 QA 전용 계정만 사용한다.
- 테스트 데이터 prefix는 `qa-` 또는 날짜 기반 prefix를 사용한다.
- 테스트 종료 후 cleanup 가능해야 한다.

