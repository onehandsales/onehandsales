# Frontend User Web

현재 React User Web은 공개/인증 화면, Workspace와 범용 CRM 화면, 계정·도움말 모달을 제공한다.

## Route

[구현 현황](../../../PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md)의 route 표와 [실제 router](../../../../FE/user-web/src/app/router/router.tsx)를 따른다. `/app`은 기본 Workspace로 이동하고 Object/List/View ID 경로가 공통 화면을 사용한다. 과거 contacts/products/deals/export는 redirect다.

## Feature와 상태

- API client·query key·response type은 feature 내부에서 관리한다.
- 서버 상태는 TanStack Query, 입력은 React Hook Form/Zod 또는 local state를 사용한다.
- 공통 UI는 components와 components/ui에 둔다.
- Workspace/Group/View별 캐시·늦은 응답을 격리한다.
- 기존 CRM feature는 동작 중이며 folk 대상 feature/route는 [전환 설계](CRM_CORE_FRONTEND.md)에서 별도로 정한다.

## 검증

Auth·Workspace 진입, Object/List/View 조회·값 수정·설정 저장, 계정·지원 접수의 실제 변경 영향을 검증한다. folk 전환에서는 연락처 등록→Group→Table/Pipeline→상세, 그룹별 값 격리·권한·모바일 흐름을 추가한다.

[UX 기준](../../../UXUI_AGENT/DECISIONS/025_uxui_folk_reference.md)과 [QA](../../COMMON/QA_CHECKLIST.md)를 따른다.
