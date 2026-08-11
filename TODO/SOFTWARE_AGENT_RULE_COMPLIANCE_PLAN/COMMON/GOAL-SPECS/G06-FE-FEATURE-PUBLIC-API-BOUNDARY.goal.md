# G06 FE Feature Public API Boundary

상태: Draft
영역: FE User Web / FE Admin Web
우선순위: Medium

## 0. 필수 준수 원칙

- 이 goal을 구현할 때는 `AGENT/SOFTWARE_AGENT` 하위 관련 문서를 반드시 먼저 확인하고 그대로 따른다.
- goal 문서와 `AGENT/SOFTWARE_AGENT` 규칙이 충돌하면 `AGENT/SOFTWARE_AGENT`를 우선한다.
- 충돌이나 누락이 발견되면 구현 전에 TODO 문서를 보완하고 근거를 기록한다.

## 1. 목적

Frontend feature 내부에서 다른 feature의 깊은 내부 경로를 직접 import하는 패턴을 줄이고, 필요한 공개 API는 각 feature의 `index.ts`를 통해 노출한다.

## 2. 대상 후보

- `FE/user-web/src/features/deal/components/deal-create-dialog.tsx`
- `FE/user-web/src/features/trash/hooks/use-trash-mutations.ts`
- `FE/user-web/src/features/meeting-note/*`
- `FE/user-web/src/features/follow-up-delivery/*`
- `FE/user-web/src/features/contact/*`
- `FE/user-web/src/features/product/*`
- `FE/admin-web/src/features/admin-query/*`

## 3. 포함 범위

- 각 feature의 public export 정리
- feature 간 import를 `@/features/<feature>` 또는 상대 공개 entry로 변경
- 순환 import가 생기지 않도록 export 단위 조정
- 기존 route/page/component 동작 보존
- 관련 함수/컴포넌트 주석 보완

## 4. 제외 범위

- feature 폴더 전면 재구성
- 상태 관리 라이브러리 변경
- API client response shape 변경

## 5. 완료 기준

- feature 내부에서 다른 feature의 `components/hooks/api/schemas/types/utils` 깊은 경로를 직접 import하는 후보가 크게 줄어든다.
- 남겨야 하는 예외는 이유를 기록한다.
- typecheck/lint 통과

## 6. 검증

```powershell
cd D:\workspace_repository\onehandsales\FE\user-web
pnpm.cmd run typecheck
pnpm.cmd run lint

cd D:\workspace_repository\onehandsales\FE\admin-web
pnpm.cmd run typecheck
pnpm.cmd run lint
```
