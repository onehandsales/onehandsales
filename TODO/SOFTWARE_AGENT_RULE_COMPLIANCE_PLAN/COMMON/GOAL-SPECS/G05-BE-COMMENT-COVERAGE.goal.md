# G05 BE Comment Coverage

상태: Implemented / Verified
영역: BE
우선순위: Medium

## 0. 필수 준수 원칙

- 이 goal을 구현할 때는 `AGENT/SOFTWARE_AGENT` 하위 관련 문서를 반드시 먼저 확인하고 그대로 따른다.
- goal 문서와 `AGENT/SOFTWARE_AGENT` 규칙이 충돌하면 `AGENT/SOFTWARE_AGENT`를 우선한다.
- 충돌이나 누락이 발견되면 구현 전에 TODO 문서를 보완하고 근거를 기록한다.

## 1. 목적

Backend 코드의 `// 역할 :`, `// API :`, `// 기능 :`, numbered step comment 규칙을 보완한다.

## 2. 우선 대상

- `BE/src/modules/notification/presentation/http/notification.controller.ts`
- `BE/src/modules/follow-up/presentation/http/follow-up-message.controller.ts`
- `BE/src/modules/follow-up/presentation/http/follow-up-delivery-settings.controller.ts`
- `BE/src/modules/schedule/presentation/http/google-calendar.controller.ts`
- `BE/src/modules/sales-report/presentation/http/ai-weekly-sales-report.controller.ts`
- G02-G04에서 수정한 모든 class/interface/function/method

## 3. 포함 범위

- 모든 Backend class/interface 바로 앞 `// 역할 : ...`
- HTTP route decorator 바로 앞 `// API : ...`
- 내부 function/method 바로 앞 `// 기능 : ...`
- controller와 application orchestration의 주요 흐름 numbered step comment

## 4. 제외 범위

- 의미 없는 줄 단위 주석 추가
- 단순 getter/mapper에 과도한 numbered step comment 추가
- 비즈니스 로직 변경

## 5. 완료 기준

- 우선 대상 controller의 모든 HTTP method에 `// API : ...`가 있다.
- 수정 파일의 class/interface/function/method 주석 규칙을 만족한다.
- 새로 추가한 주석은 한국어이고 책임/기능을 설명한다.

## 6. 검증

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint
```

## 7. 구현 결과

- 2026-08-11 구현 및 검증 완료.
- 우선 대상 controller 5개의 class 역할 주석, HTTP route decorator 직전 `// API : ...`, controller 처리 흐름 numbered step comment를 보강했다.
- G02-G04에서 수정한 Backend class/interface/function/method 범위의 누락 주석을 보강했다.
- 변경은 주석 보강과 TODO 문서 기록에 한정했고 API shape, DB schema, 비즈니스 로직은 변경하지 않았다.
- 추가 주석 감사 결과: 우선 대상 controller와 G02-G04 변경 Backend source 66개 파일 기준 class/interface/function/method/API 주석 누락 0개.

## 8. 검증 결과

2026-08-11 수동 실행:

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd test
```

통과 결과:

- `pnpm run typecheck` 통과
- `pnpm run lint` 통과
- `pnpm test` 통과: 98개 suite / 524개 test
- `git diff --check` 통과
