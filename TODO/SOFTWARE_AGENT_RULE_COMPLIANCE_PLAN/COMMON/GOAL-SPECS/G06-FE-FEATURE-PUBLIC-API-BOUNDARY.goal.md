# G06 FE Feature Public API Boundary

상태: Implemented / Verified
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

## 5.1 완료 결과

- 2026-08-11 기준 `FE/user-web/src/features`와 `FE/admin-web/src/features`에서 다른 feature의 `components/hooks/api/schemas/types/utils` 깊은 경로를 직접 import하는 사례를 0건으로 정리했다.
- `FE/user-web/src/pages`와 `FE/user-web/src/components/layout`의 외부 feature 내부 경로 import도 public `@/features/<feature>` import로 정리했다.
- query key, 딜 선택지, 딜 상태, 딜 후속 액션처럼 교차 feature에서 반복 참조되는 값은 `@/features/<feature>/query-keys`와 같은 top-level public sub-entry로 분리해 넓은 barrel 순환 위험을 낮췄다.
- feature 내부에서 자기 feature의 public `index.ts`를 다시 import하는 순환 위험 후보도 0건으로 확인했다.
- 유지해야 하는 예외 deep import는 없다.

## 6. 검증

```powershell
cd D:\workspace_repository\onehandsales\FE\user-web
pnpm.cmd run typecheck
pnpm.cmd run lint

cd D:\workspace_repository\onehandsales\FE\admin-web
pnpm.cmd run typecheck
pnpm.cmd run lint
```

2026-08-11 실행 결과:

- `FE/user-web`: `pnpm run typecheck`, `pnpm run lint` 통과
- `FE/admin-web`: `pnpm run typecheck`, `pnpm run lint` 통과
- import boundary 정적 감사 결과:
  - `cross_feature_deep_imports=0`
  - `external_or_cross_feature_deep_imports=0`
  - `self_feature_public_index_imports=0`
  - `feature_public_index_runtime_cycles=0`
