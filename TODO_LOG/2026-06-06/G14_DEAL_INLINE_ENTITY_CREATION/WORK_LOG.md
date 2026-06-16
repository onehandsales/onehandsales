# G14 Deal inline entity creation 작업 로그

## 작업 상태

- 상태: 완료
- 작업 일자: 2026-06-06
- 관련 goal: `G14. Deal inline entity creation`
- 관련 문서:
  - `AGENT/README.md`
  - `AGENT/SOFTWARE_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
  - `AGENT/SOFTWARE_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
  - `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
  - `AGENT/UXUI_AGENT/DECISIONS/008_uxui_inline_entity_creation.md`
  - `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P2-G12-G16-DEAL-LOOP.md`
  - `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`

## 요청 내용

- G14 Deal inline entity creation 작업을 진행한다.
- 작업 전 `AGENT`와 `TODO` 정본 문서를 다시 학습한다.
- 작업 진행과 완료 결과를 `TODO_LOG`에 기록한다.

## 예정 범위

- 딜 빠른 등록 modal에서 회사/담당자/제품 검색 결과가 없을 때 inline 생성 UI 표시
- 회사 inline 생성: 회사명 필수
- 담당자 inline 생성: 이름 필수, 선택된 회사가 있으면 연결
- 제품 inline 생성: 제품명 필수, 단가 선택
- 생성 성공 후 해당 entity를 딜 form에 자동 선택
- 자유 텍스트만으로 Deal에 저장되지 않도록 기존 검증 유지

## 제외 범위

- 회사/담당자/제품 전체 상세 생성 form
- Import 기반 생성
- G15 딜 상세 패널/상세 페이지
- G16 홈 파이프라인 통합

## 진행 기록

- 2026-06-06: 작업 로그 문서 생성
- 2026-06-06: G14 관련 AGENT/TODO 문서와 기존 Deal 빠른 등록 modal 구조 재확인
- 2026-06-06: 딜 빠른 등록 modal에 회사/담당자/제품 inline 생성 패널 추가
- 2026-06-06: 회사 inline 생성 성공 시 `companyId/companySearch` 자동 선택 및 담당자 선택 초기화 적용
- 2026-06-06: 담당자 inline 생성 성공 시 선택된 회사가 있으면 `companyId`와 함께 생성하고 `contactId/contactSearch` 자동 선택
- 2026-06-06: 제품 inline 생성에 선택 단가 입력을 추가하고, 생성 성공 시 제품 chip과 `productIds` 자동 반영
- 2026-06-06: inline 생성 중 Deal 저장 버튼을 비활성화하여 생성/저장 요청 충돌 방지
- 2026-06-06: 후보가 있을 때도 후보 목록을 먼저 보여주고 `새 ... 만들기`를 선택할 수 있는 상태로 유지

## 적용 범위 또는 변경 파일

- `FE/user-web/src/features/deal/components/deal-create-dialog.tsx`
- `TODO_LOG/2026-06-06/G14_DEAL_INLINE_ENTITY_CREATION/WORK_LOG.md`

## 검증 결과

- 통과: `pnpm run typecheck`
- 통과: `pnpm run lint`
- 통과: `pnpm run build`
  - 참고: Vite 단일 chunk 500kB 초과 경고가 있으나 build 실패는 아님
- 통과: `git diff --check`
- 통과: G14 Playwright route-mock smoke
  - user-web: `http://127.0.0.1:5175`
  - API origin mock: `http://127.0.0.1:3101`
  - `/deals`에서 딜 빠른 등록 modal 열기 확인
  - 기존 회사 후보가 있는 상태에서 후보와 `새 회사 만들기`가 함께 보이는지 확인
  - inline 회사 생성 요청 body 확인: `{ name }`
  - inline 담당자 생성 요청 body 확인: `{ name, companyId }`
  - inline 제품 생성 요청 body 확인: `{ name, unitPrice, currency }`
  - Deal 생성 요청 body 확인: `companyId`, `contactId`, `productIds`가 생성된 entity id로 전송됨
  - 생성 후 회사/담당자 input 자동 선택, 제품 chip 자동 추가 확인
  - 참고: 첫 smoke 시도는 `playwright` 직접 import가 없어 실패했고, 설치된 `@playwright/test` export로 재실행하여 통과
- 통과: desktop/mobile screenshot smoke
  - `/tmp/g14-inline-desktop.png`
  - `/tmp/g14-inline-mobile.png`
  - inline 패널 텍스트와 버튼 겹침 없음 확인

## 검토 결과

- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P2-G12-G16-DEAL-LOOP.md`의 G14 완료 기준 충족
- 딜 modal을 벗어나지 않고 없는 회사/담당자/제품을 최소 정보로 생성 가능
- 자유 텍스트만으로 Deal에 저장하지 않는 기존 form 검증 유지
- 기존 후보 목록은 `DealEntitySearchField`가 먼저 보여주고, inline 생성 패널은 그 아래에서 선택 가능
- 기존 Company/Contact/Product mutation hook과 API client를 재사용하여 feature 경계를 유지
- User Web feature 구조 준수
  - 페이지/라우터 변경 없음
  - API 호출은 기존 feature API와 TanStack Query mutation 사용
  - G14 UI 변경은 Deal 빠른 등록 modal 내부로 제한

## 남은 리스크 또는 보류 사항

- G14 범위는 완료.
- 실제 백엔드/DB 인증 세션을 사용하는 end-to-end는 별도 인증 goal 전까지 route-mock smoke로 검증했다.
- 회사/담당자/제품 상세 필드는 G14 제외 범위라 inline form에 추가하지 않았다.
- 딜 상세 패널/상세 페이지는 G15 범위로 남긴다.
- 홈 파이프라인 통합은 G16 범위로 남긴다.

## 다음 권장 작업

- G14 완료 후 `G15. Deal 상세 패널과 상세 페이지`

## 전체 작업 진행 현황

- 완료: G06 Company Backend vertical slice
- 완료: G07 Company User Web
- 완료: G08 Contact Backend vertical slice
- 완료: G09 Contact User Web
- 완료: G10 Product Backend vertical slice
- 완료: G11 Product User Web
- 완료: G12 Deal Backend vertical slice
- 완료: G13 Deal User Web 목록과 빠른 생성
- 완료: G14 Deal inline entity creation
- 진행 필요: G15 Deal 상세 패널과 상세 페이지
- 진행 필요: G16 Home pipeline 통합
