# G07 FE Comment Coverage

상태: Implemented / Verified / Re-review Follow-up Recorded
영역: FE User Web / FE Admin Web
우선순위: Medium

## 0. 필수 준수 원칙

- 이 goal을 구현할 때는 `AGENT/SOFTWARE_AGENT` 하위 관련 문서를 반드시 먼저 확인하고 그대로 따른다.
- goal 문서와 `AGENT/SOFTWARE_AGENT` 규칙이 충돌하면 `AGENT/SOFTWARE_AGENT`를 우선한다.
- 충돌이나 누락이 발견되면 구현 전에 TODO 문서를 보완하고 근거를 기록한다.

## 1. 목적

Frontend component/function/hook/API client/event handler에 `// 기능 : ...` 주석 규칙을 보완한다.

## 2. 우선 대상

- `FE/admin-web/src/features/auth/*`
- `FE/user-web/src/app/router/route-elements.tsx`
- `FE/user-web/src/components/layout/app-shell.tsx`
- User Web 주요 list/detail/create screen
- API client function이 많은 feature

## 3. 포함 범위

- React component function 주석
- hook function 주석
- API client function 주석
- event handler function 주석
- 복잡한 anonymous callback은 이름 있는 함수로 분리 후 주석 추가

## 4. 제외 범위

- JSX 구조 설명용 주석 남발
- commented-out code 추가
- UI copy 변경
- 비즈니스 로직 변경

## 5. 완료 기준

- G01/G06에서 수정한 파일은 주석 규칙을 만족한다.
- 우선 대상 파일의 export function과 주요 internal function에 `// 기능 : ...`가 있다.
- `console.log`나 PII client logging을 추가하지 않는다.

## 6. 검증

```powershell
cd D:\workspace_repository\onehandsales\FE\user-web
pnpm.cmd run typecheck
pnpm.cmd run lint

cd D:\workspace_repository\onehandsales\FE\admin-web
pnpm.cmd run typecheck
pnpm.cmd run lint
```

검증 결과:

- 2026-08-11 G06 수정 파일, G07 수정 파일, `FE/admin-web/src/features/auth/*`, `route-elements.tsx`, `app-shell.tsx` 포함 64개 대상 파일의 component/function/hook/handler 주석 AST 감사 결과 누락 0건
- 2026-08-11 `FE/user-web`: `pnpm run typecheck` 통과
- 2026-08-11 `FE/user-web`: `pnpm run lint` 통과
- 2026-08-11 `FE/admin-web`: `pnpm run typecheck` 통과
- 2026-08-11 `FE/admin-web`: `pnpm run lint` 통과
- `console.*` client logging 추가 없음
- TypeScript/TSX 변경은 `// 기능 : ...` 주석 추가로만 제한했고 UI copy, business logic, API 동작은 변경하지 않았다.

## 7. 2026-08-12 재검토 결과

재검토 범위:

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`의 Frontend 주석/로깅 규칙을 다시 확인했다.
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`의 Frontend 주석/로깅 체크리스트를 다시 확인했다.
- G01, G06, G07 관련 커밋의 Frontend source 변경 파일과 G07 우선 대상인 `FE/admin-web/src/features/auth/*`, `FE/user-web/src/app/router/route-elements.tsx`, `FE/user-web/src/components/layout/app-shell.tsx`를 현재 파일 기준으로 재감사했다.
- 상위 TODO 문서의 G07 완료 로그 참조와 실제 완료 로그 위치를 확인했다.

통과 결과:

- 복원한 G07 감사 대상 65개 파일 기준 function declaration 390개, variable function 105개 중 주석 감사 대상 473개를 확인했다.
- FE source에서 직접 `console.log`, `console.debug`, `console.info`, `console.warn`, `console.error` 사용은 없다.
- 실제 `fetch(` 호출은 User Web `src/lib/api-client.ts`와 Admin Web `src/lib/admin-api-client.ts`에만 있다.
- User Web의 `/admin/api` 검색 결과는 `src/lib/api-client.ts`의 차단 guard 2곳에 한정된다.
- Admin Web source에서 직접 `"/api/"`를 사용하는 경로는 없다.
- `FE/user-web` `pnpm.cmd run typecheck` 통과
- `FE/user-web` `pnpm.cmd run lint` 통과
- `FE/admin-web` `pnpm.cmd run typecheck` 통과
- `FE/admin-web` `pnpm.cmd run lint` 통과
- `BE` `pnpm.cmd run typecheck` 통과
- `BE` `pnpm.cmd run lint` 통과
- `git diff --check` 통과

후속 보완 기록:

- `FE/user-web/src/features/follow-up-delivery/components/follow-up-compose-dialog.tsx`의 `requestSend`는 `onClick`에 연결된 named event handler이고, 바로 위 `// 기능 : ...` 주석이 없다.
- 위 1개 handler는 G07의 event handler function 주석 기준에 맞춰 후속 보완이 필요하다.
- FE 전체 source에 같은 주석 규칙을 엄격 적용하면 User Web 335개 파일의 주석 감사 대상 1,867개 중 996건, Admin Web 93개 파일의 주석 감사 대상 300개 중 67건이 누락으로 잡힌다. 이는 기존 G07 완료 기준의 64개 대상 파일 범위를 넘는 source-wide 적용 리스크로 별도 관리한다.
- G07 완료 로그는 기존 루트 `TODO_LOG/2026-08-11/G07_FE_COMMENT_COVERAGE/WORK_LOG.md`에도 존재하지만, 상위 `SOFTWARE_AGENT_RULE_COMPLIANCE_PLAN` 문서들이 참조하는 경로인 `TODO/DONE/SOFTWARE_AGENT_RULE_COMPLIANCE_PLAN/TODO_LOG/2026-08-11/G07_FE_COMMENT_COVERAGE/WORK_LOG.md`에도 보강했다.
