# Deal Quick Create Inline Entities Work Log

## 작업명

딜 빠른 등록 모달 회사/거래처 빠른 생성, 제품 선택 UI, 금액 입력 표시 개선

## 작업 일자

- 2026-06-13

## 관련 계획과 goal

- `TODO/DEAL_DOMAIN_PLAN/FE-TODO/G02-FE-DEAL-PAGES.goal.md`
- `TODO/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API.md`
- `TODO/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API_DETAIL.md`

## 관련 AGENT/TODO 문서

- `AGENT/AGENT_USAGE_RULES.md`
- `AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/UXUI_AGENT/DECISIONS/007_uxui_create_flow.md`
- `AGENT/UXUI_AGENT/DECISIONS/008_uxui_inline_entity_creation.md`

## 예정 범위

- 딜 빠른 등록 모달에서 회사와 거래처를 최소 입력으로 빠르게 생성할 수 있게 한다.
- 제품 선택은 카테고리 버튼과 같은 드롭다운/팝오버 형태로 정리한다.
- 금액 입력은 화면 표시에서만 원 단위 콤마를 넣고, form 데이터와 API 요청은 숫자 값으로 유지한다.

## 진행 기록

- 2026-06-13: 작업 시작. 관련 Deal/Product/Company/Contact FE 구조 확인 중.
- 2026-06-13: 딜 빠른 등록 모달에 회사/거래처 빠른 등록 하위 모달 연결.
- 2026-06-13: 제품 선택을 버튼형 드롭다운 다중 선택 UI로 변경.
- 2026-06-13: 금액 입력 표시값에만 콤마를 넣고 form 값은 숫자 문자열로 유지하도록 변경.
- 2026-06-13: 금액 hidden form 값과 표시 입력을 분리하고 schema도 콤마 값을 숫자 문자열로 정규화하도록 보강.
- 2026-06-13: 회사/거래처/제품 선택을 빈 검색 입력에서 검색어 입력 후 결과를 클릭하는 형태로 변경.
- 2026-06-13: 예상 마감일 입력을 text 입력으로 바꾸고 `20260410` 입력 시 `2026-04-10` form 값으로 변환하도록 변경.
- 2026-06-13: 딜 등록/빠른 등록 하위 모달의 필드 오류 문구 영역을 고정 높이로 예약하고, 거래처 선택 해제 버튼과 제품 선택 칩으로 인한 높이 변화를 제거.

## 적용 범위 또는 변경 파일

- `FE/user-web/src/features/deal/components/deal-create-dialog.tsx`
  - 회사 선택 영역에 `등록` 버튼과 회사 빠른 등록 모달 추가.
  - 거래처 선택 영역에 `등록` 버튼과 거래처 빠른 등록 모달 추가.
  - 회사/거래처 선택 UI를 select에서 검색 입력 + 결과 클릭 선택으로 변경.
  - 제품 선택 UI를 검색 입력 + 결과 클릭 다중 선택으로 변경.
  - 금액 입력의 화면 표시 포맷과 hidden form 값을 분리.
  - 예상 마감일 `YYYYMMDD` 입력을 `YYYY-MM-DD`로 자동 변환.
- `FE/user-web/src/features/deal/schemas/deal-schema.ts`
  - 금액 schema가 콤마 포함 문자열을 숫자 문자열로 정규화하도록 보강.
  - 날짜 schema가 `YYYYMMDD` 문자열도 `YYYY-MM-DD`로 정규화하도록 보강.
- `FE/user-web/src/components/ui/modal-form.tsx`
  - `ModalFieldGroup` 오류/도움말 영역을 항상 1줄 높이로 예약해 validation 상태 변화가 필드 위치를 밀지 않게 변경.
- `TODO_LOG/2026-06-13/DEAL_QUICK_CREATE_INLINE_ENTITIES/WORK_LOG.md`

## 검증 결과

- `pnpm --dir FE/user-web exec eslint src/features/deal/components/deal-create-dialog.tsx`: 통과
- `pnpm --dir FE/user-web exec eslint src/features/deal/components/deal-create-dialog.tsx src/features/deal/schemas/deal-schema.ts`: 통과
- `pnpm --dir FE/user-web exec eslint src/components/ui/modal-form.tsx src/features/deal/components/deal-create-dialog.tsx src/features/deal/schemas/deal-schema.ts`: 통과
- `git diff --check`: 통과
- `pnpm --dir FE/user-web typecheck`: 실패
  - 현재 Node는 `v20.20.2`이며 프로젝트 요구 엔진은 `>=24 <25`.
  - 이번 변경 파일 오류는 없음.
  - 남은 오류는 기존 범위로 보이는 `src/features/product/components/product-edit-form.tsx` resolver 타입 불일치.

## 검토 결과

- 딜 생성 payload는 `toCreateDealInput` 경로를 그대로 사용하므로 금액은 콤마 없는 숫자 값으로 전달된다.
- 회사/거래처 빠른 등록은 기존 Company/Contact create schema, mutation, option query를 재사용한다.
- 빠른 등록 성공 후 옵션을 refetch하고 이름 기준으로 방금 생성한 항목을 찾아 딜 폼에 자동 선택한다.
- 회사/거래처/제품은 검색어가 있을 때만 후보 목록을 표시하고, 클릭 시 실제 id 값을 form에 저장한다.
- 예상 마감일은 화면과 form 값 모두 `YYYY-MM-DD` 형식으로 정규화되므로 `toCreateDealInput` 계약을 유지한다.
- `ModalFieldGroup` 사용 필드는 오류/도움말 문구가 없을 때도 동일한 message slot을 유지하므로 딜 등록 모달과 하위 빠른 등록 모달에서 입력창 위치가 validation 상태에 따라 이동하지 않는다.
- 제품 선택 칩 영역은 항상 한 줄 높이를 예약하고 가로 스크롤로 처리해 제품 선택 개수 변화가 아래 필드를 밀지 않는다.

## 남은 리스크 또는 보류 사항

- 전체 typecheck는 이번 변경과 무관해 보이는 기존 product edit form 오류 때문에 완료되지 않았다.
- 빠른 등록 후 같은 이름의 회사/거래처가 여러 개 있으면 이름 기준 자동 선택이 첫 번째 일치 항목을 선택할 수 있다. 생성 API가 id를 반환하는 계약이 노출되면 id 기반 선택으로 바꾸는 것이 더 안전하다.

## 다음 권장 작업

- `deal-pipeline-home-screen.tsx`, `product-edit-form.tsx`의 기존 타입 오류를 별도 작업으로 정리한 뒤 전체 typecheck/build를 재실행한다.
- 회사/거래처 생성 API 응답에서 생성 id를 안정적으로 사용할 수 있는지 확인해 자동 선택 로직을 id 기반으로 개선한다.

## 전체 작업 진행 현황

- 상태: 조건부 완료
