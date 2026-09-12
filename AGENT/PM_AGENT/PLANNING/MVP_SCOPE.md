# MVP 기능 범위

Status: Current Scope Baseline
Date: 2026-09-12

## 1. 목적

이 문서는 현재 구현된 foundation 범위와 다음 OneHand CRM 제품 MVP 범위를 분리해 설명한다.

현재 코드에 남아 있는 기능은 서비스 운영 기반이고, 다음 MVP는 No Setup CRM의 핵심 가치를 검증하기 위한 제품 범위다. 두 범위를 섞어서 "이미 CRM MVP가 완성됐다"고 판단하지 않는다.

## 2. 현재 Foundation 포함 범위

현재 구현되어 유지하는 범위:

- OAuth 기반 로그인과 앱 세션 관리
- 내 프로필, 연결 계정, 로그인 기기, 세션 관리
- `/app` 빈 홈
- `/app/more` 더보기와 계정 설정 모달
- 오류 신고
- 지원 문의
- 공개 문의
- 관리자 access token 권한 확인
- locale 기반 공개 사이트

현재 Foundation 완료 기준:

- 남은 기능이 BE/FE/Prisma에서 빌드된다.
- 사용자 화면의 `/app` 이후 route가 현재 활성 기능만 노출한다.
- 문서와 코드의 활성 도메인 목록이 일치한다.

## 3. 다음 Product MVP 목표

다음 제품 MVP의 목표는 사용자가 CRM을 직접 설계하지 않고도 첫 업무 CRM을 시작하게 만드는 것이다.

핵심 검증 질문:

- 사용자가 직군 또는 업무를 선택하면 적절한 CRM 구조가 준비되는가?
- 사용자가 첫 기록을 빠르게 만들 수 있는가?
- 준비된 구조가 해당 직군의 실제 업무 흐름처럼 느껴지는가?
- 이후 확장 가능성이 막히지 않는가?

## 4. 다음 Product MVP 포함 범위

필수 포함:

- 기본 Workspace
- 첫 출시 Kit 1개 이상
- Kit 선택 또는 적용 흐름
- Kit 기준 Object 정의
- Object별 Attribute 정의
- Object 간 Relationship 정의
- Record 생성, 조회, 수정
- 기본 List/View
- 첫 기록 생성 흐름
- 빈 상태와 다음 행동
- 최소한의 onboarding copy

권장 포함:

- Kit별 예시 record
- 업무 상태별 빠른 필터
- 최근 기록 또는 해야 할 일 중심 홈
- Kit 변경 또는 재설정에 대한 안전 정책 초안

## 5. 다음 Product MVP 제외 범위

의도적으로 제외:

- 모든 직군 Kit 동시 출시
- 사용자가 처음부터 자유롭게 모든 Object/Relation을 설계하는 builder
- 복잡한 Team/조직 권한
- 고급 permission matrix
- 결제와 구독 운영 화면
- Paddle checkout, webhook, tax, invoice
- 대량 데이터 import/export
- 외부 업무 도구 양방향 연동
- 자동화 builder
- AI 기반 완전 자동 CRM 생성

## 6. 첫 Kit 선정 전제

MVP 구현 전에는 첫 Kit을 확정해야 한다.

첫 Kit 후보:

- 부동산 중개
- 헤드헌팅/채용 컨설팅
- 보험/재무 상담
- 프리랜서/컨설팅
- 교육/코칭

선정 기준은 `KIT_STRATEGY.md`와 `034_first_kit_selection_policy.md`를 우선한다.

## 7. 성공 기준

MVP는 아래 상태가 되면 성공으로 본다.

- 신규 사용자가 Kit을 선택하고 Workspace를 준비할 수 있다.
- 사용자가 첫 Record를 생성할 수 있다.
- 기본 List/View에서 자신이 입력한 Record를 다시 찾을 수 있다.
- 첫 화면이 빈 CRM builder처럼 느껴지지 않는다.
- Product/Company/Deal 같은 특정 영업 도메인이 전역 기본 모델로 고정되지 않는다.
- 현재 Auth/User/Support/PublicContact foundation과 충돌하지 않는다.

## 8. 관련 문서

- `README.md`
- `AGENT/PM_AGENT/PLANNING/PRODUCT_DIRECTION.md`
- `AGENT/PM_AGENT/PLANNING/PRD.md`
- `AGENT/PM_AGENT/PLANNING/KIT_STRATEGY.md`
- `AGENT/PM_AGENT/PLANNING/FIRST_USE_EXPERIENCE.md`
- `AGENT/PM_AGENT/PLANNING/CRM_CORE_CONCEPT_MODEL.md`
- `AGENT/PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md`
