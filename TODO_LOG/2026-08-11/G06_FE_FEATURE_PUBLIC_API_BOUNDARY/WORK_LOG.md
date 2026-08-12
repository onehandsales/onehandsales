# G06 FE Feature Public API Boundary Work Log

날짜: 2026-08-11
상태: Implemented / Verified / 2026-08-12 Re-review Verified
재검토일: 2026-08-12

## 1. 범위

- `TODO/DONE/SOFTWARE_AGENT_RULE_COMPLIANCE_PLAN/COMMON/GOAL-SPECS/G06-FE-FEATURE-PUBLIC-API-BOUNDARY.goal.md`
- `FE/user-web/src/features`
- `FE/user-web/src/pages`
- `FE/user-web/src/components/layout`
- `FE/admin-web/src/features` 감사

## 2. 작업 내용

- User Web의 company/contact/deal/meeting-note/product/schedule/trash/auth/notification/public-site public `index.ts` export를 필요한 범위로 보강했다.
- feature 내부에서 다른 feature의 `components/hooks/api/schemas/types/utils` 깊은 경로를 직접 import하던 코드를 public `@/features/<feature>` import로 변경했다.
- page와 layout 같은 외부 consumer가 feature 내부 파일을 직접 import하던 경로도 public index import로 정리했다.
- query key, 딜 선택지, 딜 상태, 딜 후속 액션처럼 교차 feature에서 반복 참조되는 값은 top-level public sub-entry로 분리해 넓은 barrel 순환 위험을 낮췄다.
- same-feature 내부 의존성은 public index를 거치지 않고 내부 상대 경로를 유지해 순환 import 위험을 줄였다.
- API response shape, route, 화면 동작, 상태 관리 방식은 변경하지 않았다.

## 3. 검토 결과

- cross-feature deep import 감사 결과: 0건
- page/layout 포함 외부 feature deep import 감사 결과: 0건
- feature 내부에서 자기 feature public `index.ts`를 import하는 순환 위험 후보: 0건
- public `index.ts` export 파일의 runtime broad import 순환 후보: 0건
- 유지 예외로 남긴 deep import는 없다.
- `prompt.md`의 기존 수정은 이번 G06 범위와 무관하므로 제외했다.

## 4. 검증

```powershell
cd D:\workspace_repository\onehandsales\FE\user-web
pnpm.cmd run typecheck
pnpm.cmd run lint

cd D:\workspace_repository\onehandsales\FE\admin-web
pnpm.cmd run typecheck
pnpm.cmd run lint
```

통과 결과:

- `FE/user-web`: `pnpm run typecheck` 통과
- `FE/user-web`: `pnpm run lint` 통과
- `FE/admin-web`: `pnpm run typecheck` 통과
- `FE/admin-web`: `pnpm run lint` 통과

## 5. 2026-08-12 재검토 결과

- `FE/user-web/src` 335개 TS/TSX 파일, feature file 248개 기준 `cross_feature_deep_imports=0`, `external_or_cross_feature_deep_imports=0`, `self_feature_public_index_imports=0`, `feature_public_index_runtime_cycles=0`이다.
- `FE/admin-web/src` 93개 TS/TSX 파일 기준 feature deep import boundary 위반은 0건이다.
- G06 완료 로그와 상위 TODO 문서 참조는 `TODO/DONE/SOFTWARE_AGENT_RULE_COMPLIANCE_PLAN` 기준으로 정합성을 맞췄다.

## 6. 남은 후속 보완

- 2026-08-12 재검토 기준 G06 코드 후속 보완 항목은 없다.
