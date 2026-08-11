# G07 FE Comment Coverage

상태: Draft
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
