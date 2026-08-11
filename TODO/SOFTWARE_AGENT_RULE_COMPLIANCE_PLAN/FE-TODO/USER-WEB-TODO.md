# User Web TODO

상태: Implemented / Verified

## 1. G06 User Web feature public API boundary

상태: 완료 / 검증 완료

대상 후보:

- `FE/user-web/src/features/deal/components/deal-create-dialog.tsx`
- `FE/user-web/src/features/trash/hooks/use-trash-mutations.ts`
- `FE/user-web/src/features/meeting-note/*`
- `FE/user-web/src/features/follow-up-delivery/*`
- `FE/user-web/src/features/contact/*`
- `FE/user-web/src/features/product/*`

작업:

- feature 간 deep import 후보를 다시 산출한다.
- 각 feature의 `index.ts`에서 외부에 공개할 API만 export한다.
- import 경로를 공개 API 중심으로 변경한다.
- 순환 import가 생기면 공개 API 단위를 더 작게 나눈다.
- 기존 UI와 API 호출 동작은 바꾸지 않는다.

검증:

```powershell
cd D:\workspace_repository\onehandsales\FE\user-web
pnpm.cmd run typecheck
pnpm.cmd run lint
```

검증 결과:

- 2026-08-11 `pnpm run typecheck` 통과
- 2026-08-11 `pnpm run lint` 통과
- cross-feature deep import 감사 결과 0건
- page/layout 포함 외부 feature deep import 감사 결과 0건
- public index runtime broad import 순환 후보 0건

## 2. G07 User Web 주석 보완

상태: 완료 / 검증 완료

우선 대상:

- `FE/user-web/src/app/router/route-elements.tsx`
- `FE/user-web/src/components/layout/app-shell.tsx`
- 주요 list/detail/create screen
- API client 함수가 많은 feature

작업:

- React component function에 `// 기능 : ...` 추가
- hook function에 `// 기능 : ...` 추가
- API client function에 `// 기능 : ...` 추가
- event handler function에 `// 기능 : ...` 추가
- 복잡한 anonymous callback은 이름 있는 함수로 분리한다.

금지:

- JSX 구조 설명 주석 남발
- commented-out code 추가
- UI copy 변경
- client log 추가

검증:

```powershell
cd D:\workspace_repository\onehandsales\FE\user-web
pnpm.cmd run typecheck
pnpm.cmd run lint
```

검증 결과:

- 2026-08-11 `pnpm run typecheck` 통과
- 2026-08-11 `pnpm run lint` 통과
- G06 수정 파일, G07 수정 파일, `route-elements.tsx`, `app-shell.tsx` 포함 대상 파일의 component/function/hook/handler 주석 감사 결과 누락 0건
- `console.*` client logging 추가 없음
- TypeScript/TSX 변경은 `// 기능 : ...` 주석 추가로만 제한
