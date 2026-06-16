# G01 FE Company Pages

## 작업명

User Web 회사 목록/상세/생성/메모/내보내기 화면 구현

## 작업 일자

2026-06-12

## 관련 계획과 goal

- `TODO/COMPANY_DOMAIN_PLAN/FE-TODO/G01-FE-COMPANY-PAGES.goal.md`
- `TODO/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API.md`
- `TODO/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API_DETAIL.md`

## 관련 AGENT/TODO 문서

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `FE/README.md`
- `FE/user-web/README.md`

## 예정 범위

- User Web 회사 목록 화면
- 회사 생성 모달
- 회사 분야/지역 생성/삭제 UI
- 회사 상세 화면
- 연결 Contact 요약
- 회사 일반 메모 로그와 개인 비밀 메모 로그 조회/생성/수정
- 회사 목록 XLSX 내보내기
- 새 Company API 계약에 맞는 type/API/hook 정리

## 진행 기록

- 기존 회사 FE가 이전 `name/industry/region/delete/logs` 계약에 묶여 있음을 확인했다.
- 회사 feature 타입, API client, query key, hook, schema를 새 `companyName/companyField/companyRegion` 계약으로 재구성했다.
- `201 Created` 빈 body 응답을 공통 API client에서 성공 처리하도록 바꿨다.
- `GET /api/companies/export/xlsx`를 blob으로 받고 `Content-Disposition` 파일명을 우선 사용하는 다운로드 helper를 추가했다.
- 회사 목록 화면에 검색, 분야/지역 필터, 20개 단위 페이지네이션, XLSX 내보내기, 분야/지역 관리를 구현했다.
- 회사 상세 화면에 기본 정보 수정, 연결 Contact 전체 목록, 일반 메모 로그, 개인 비밀 메모 로그를 구현했다.
- 회사 API 타입 변경으로 영향을 받는 담당자/딜/일정/상품의 회사 검색 옵션 표시를 보정했다.
- 딜 생성 모달의 회사 inline create는 새 필수 분야/지역 입력 없이 생성할 수 없어 회사 화면 등록 안내로 축소했다.
- 추가 요청에 따라 company API 명세 18개 엔드포인트를 다시 대조하고, 회사 목록/export query의 `companyName` trim 처리와 XLSX `Accept` header를 보강했다.

## 적용 범위 또는 변경 파일

- `FE/user-web/src/lib/api-client.ts`
- `FE/user-web/src/features/company/api/company-api.ts`
- `FE/user-web/src/features/company/api/company-query-keys.ts`
- `FE/user-web/src/features/company/hooks/use-company-detail.ts`
- `FE/user-web/src/features/company/hooks/use-company-list.ts`
- `FE/user-web/src/features/company/hooks/use-company-mutations.ts`
- `FE/user-web/src/features/company/types/company.ts`
- `FE/user-web/src/features/company/schemas/company-schema.ts`
- `FE/user-web/src/features/company/components/company-list-screen.tsx`
  - `initialCreateOpen` prop 추가로 `/companies/new`에서 회사 생성 모달 자동 오픈 지원
  - 회사 추가 버튼을 `/companies/new`로 연결하고, 모달 닫기 시 `/companies`로 복귀하도록 정리
- `FE/user-web/src/components/ui/pagination.tsx`
  - 목록 하단 페이지네이션을 `1 / 10` 형식의 최소 UI로 단순화
- `FE/user-web/src/features/company/components/company-create-dialog.tsx`
- `FE/user-web/src/features/company/components/company-detail-screen.tsx`
- `FE/user-web/src/features/company/components/company-edit-form.tsx`
- `FE/user-web/src/features/company/components/company-log-section.tsx`
- `FE/user-web/src/features/contact/hooks/use-company-options.ts`
- `FE/user-web/src/features/contact/components/contact-company-field.tsx`
- `FE/user-web/src/features/contact/components/contact-detail-screen.tsx`
- `FE/user-web/src/features/deal/hooks/use-deal-entity-options.ts`
- `FE/user-web/src/features/deal/components/deal-create-dialog.tsx`
- `FE/user-web/src/features/schedule/hooks/use-schedule-entity-options.ts`
- `FE/user-web/src/features/product/hooks/use-product-target-options.ts`
- `TODO/COMPANY_DOMAIN_PLAN/FE-TODO/G01-FE-COMPANY-PAGES.goal.md`
- `TODO/COMPANY_DOMAIN_PLAN/FE-TODO/README.md`
- `UX Design/PEN_UI_04_IMPLEMENTATION_LOG.md`

## 검증 결과

- `pnpm --dir FE/user-web run typecheck`: 통과
- `pnpm --dir FE/user-web run lint`: 통과
- `pnpm --dir FE/user-web run build`: 통과
- company API 명세 재대조 후 재실행한 `typecheck`, `lint`, `build`: 통과

참고:

- 로컬 Node는 `v20.20.2`이고 프로젝트 요구사항은 `>=24 <25`라 pnpm engine warning이 표시됐다.
- Vite build에서 500kB 초과 chunk warning이 표시됐지만 build는 성공했다.

## 검토 결과

- 회사 목록에는 회사명, 회사 분야, 회사 지역, 담당자 수, 등록일만 표시한다.
- 회사 목록 내보내기는 현재 검색어/분야/지역 필터만 전달하고 `page`를 전달하지 않는다.
- 회사 목록과 상세에는 딜 수를 표시하지 않는다.
- 회사 목록에는 `updatedAt`을 표시하지 않는다.
- 회사 분야/지역 목록은 `createdAt`을 사용하지 않는다.
- 개인 비밀 메모는 FE에서 별도 암호화/복호화 로직을 구현하지 않는다.

## 남은 리스크 또는 보류 사항

- 인증 세션과 테스트 데이터가 준비된 브라우저 수동 검증은 아직 실행하지 못했다.
- 딜 생성 모달의 회사 inline create는 새 회사 필수값 정책에 맞춰 별도 UX가 필요하다.
- 회사 생성 진입점은 `/companies/new`로 분리했고, 기존 회사 목록 화면은 동일한 생성 모달을 재사용한다.

## 다음 권장 작업

- 실제 BE 세션으로 회사 목록, 회사 생성, 회사 상세, 일반 메모 수정, 개인 메모 수정, XLSX 다운로드 smoke를 확인한다.
- 딜 생성 모달에서 회사 inline create를 다시 제공할지 결정한다면 분야/지역 선택 UX를 별도 설계한다.

## 전체 작업 진행 현황

- 상태: 완료
- 커밋 가능 여부: 검증 통과, `git diff --check` 통과
