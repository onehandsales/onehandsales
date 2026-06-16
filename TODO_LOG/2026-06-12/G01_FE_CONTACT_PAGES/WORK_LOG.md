# G01 FE Contact Pages

## 작업명

User Web 담당자 목록/상세/생성/메모/내보내기 화면 구현

## 작업 일자

2026-06-12

## 관련 계획과 goal

- `TODO/CONTACT_DOMAIN_PLAN/FE-TODO/G01-FE-CONTACT-PAGES.goal.md`
- `TODO/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API.md`
- `TODO/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API_DETAIL.md`

## 관련 AGENT/TODO 문서

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`

## 진행 기록

- 기존 contact FE가 구 API 계약(name/phone/department 문자열/position 문자열/address/initialMemo)에 묶여 있음을 확인했다.
- contact feature 타입, API client, query key, hook, schema를 새 계약(username/mobile/contactDepartmentId/contactJobGradeId)으로 전면 재구성했다.
- `useInfiniteQuery`를 사용해 cursor 기반 메모 로그 / 개인 비밀 메모 로그 무한스크롤을 구현했다.
- 부서/직급 인라인 생성(생성 후 자동 선택) 및 목록 관리 UI를 구현했다.
- 담당자 삭제/복구/휴지통 UI를 모두 제거했다.
- xlsx export를 blob 다운로드로 처리하고 Content-Disposition 파일명을 우선 사용했다.
- deal/product/schedule의 담당자 관련 표시 필드를 새 계약에 맞게 보정했다.

## 적용 범위 또는 변경 파일

- `FE/user-web/src/features/contact/types/contact.ts`
- `FE/user-web/src/features/contact/api/contact-api.ts`
- `FE/user-web/src/features/contact/api/contact-query-keys.ts`
- `FE/user-web/src/features/contact/hooks/use-contact-list.ts`
- `FE/user-web/src/features/contact/hooks/use-contact-detail.ts`
- `FE/user-web/src/features/contact/hooks/use-contact-mutations.ts`
- `FE/user-web/src/features/contact/hooks/use-company-options.ts`
- `FE/user-web/src/features/contact/schemas/contact-schema.ts`
- `FE/user-web/src/features/contact/index.ts`
- `FE/user-web/src/features/contact/components/contact-list-screen.tsx`
- `FE/user-web/src/features/contact/components/contact-create-dialog.tsx`
- `FE/user-web/src/features/contact/components/contact-edit-form.tsx`
- `FE/user-web/src/features/contact/components/contact-detail-screen.tsx`
- `FE/user-web/src/features/contact/components/contact-log-section.tsx`
- `FE/user-web/src/features/contact/components/contact-company-field.tsx`
- `FE/user-web/src/features/deal/hooks/use-deal-entity-options.ts`
- `FE/user-web/src/features/deal/components/deal-create-dialog.tsx`
- `FE/user-web/src/features/product/hooks/use-product-target-options.ts`
- `FE/user-web/src/features/schedule/hooks/use-schedule-entity-options.ts`

## 검증 결과

- `pnpm --dir FE/user-web run typecheck`: 통과
- `pnpm --dir FE/user-web run lint`: 통과
- `pnpm --dir FE/user-web run build`: 통과

참고:
- 로컬 Node는 v20.20.2이고 프로젝트 요구사항은 `>=24 <25`라 pnpm engine warning이 표시됐다.
- Vite build에서 500kB 초과 chunk warning이 표시됐지만 build는 성공했다.

## 남은 리스크 또는 보류 사항

- 딜 생성 모달의 인라인 담당자 생성은 새 담당자 필수값(부서/직급 ID) 정책으로 인해 제거됨. 별도 UX가 필요하면 미니 담당자 생성 모달을 별도 설계한다.
- 담당자 회사 옵션(`/api/contacts/company-options`)은 전체 목록을 반환하므로 회사가 매우 많을 경우 성능 확인 필요.
- 인증 세션과 테스트 데이터가 준비된 브라우저 수동 검증은 아직 실행하지 못했다.

## 전체 작업 진행 현황

- 상태: 완료
- 커밋 가능 여부: 검증 통과
