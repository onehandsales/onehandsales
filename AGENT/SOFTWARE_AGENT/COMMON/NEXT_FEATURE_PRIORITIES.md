# Next Feature Priorities

기준일: 2026-09-12
전략 기준: `AGENT/PM_AGENT/DECISIONS/000_확정_결정.md`

이 문서는 OneHand CRM 전환 상태의 다음 작업 우선순위를 정리한다. 현재 기준에서는 결제나 새 대형 기능보다 남은 foundation 안정화, 첫 Kit 결정, 다음 CRM Core 설계가 우선이다.

고정형 고객사 관리, 전용 검색, xlsx export는 현재 런타임 범위에서 제거됐다.

현재 결론:

- 현재 활성 기능 유지보수와 S0/S1/S2 버그 수정을 가장 먼저 한다.
- 그 다음 첫 Kit, 다음 CRM Core, `/app` foundation UX/UI 상품성 개선을 진행한다.
- 베타 전에는 Paddle checkout, 결제 webhook/API/DB migration, AI 사용량 제한 billing source-of-truth 연결을 하지 않는다.
- Paddle/Billing은 베타 피드백과 가격/플랜/entitlement/정책 확정 이후 별도 confirmed TODO 계획이 생길 때 시작한다.

## 1. 현재 제품 범위

현재 제품 범위는 다음과 같다.

- Web
- 반응형 Web
- 모바일 브라우저 Web
- 공개/인증 화면의 URL locale 지원
- 앱 내부는 `ko-KR`, `en` 1차 지원
- 인증/세션/계정 설정
- 오류 신고와 지원 문의
- 공개 문의

우선 판매/검토 대상 국가는 다음으로 본다.

- 한국
- 미국
- 캐나다

현재 public/auth 언어 선택 UI에 노출하는 locale slug는 다음이다.

- `ko`
- `en-us`
- `en-ca`

추후 확장 후보 locale slug는 다음이다.

- `ja`
- `en-gb`
- `en-sg`
- `en-au`

현재 범위가 아닌 항목은 다음과 같다.

- 고정형 고객사 관리 재도입
- 고정형 고객사 전용 검색과 xlsx export
- Workspace/Object/Attribute/Record/List/View 기반 CRM 코어 구현
- 결제/구독 자동화
- 글로벌 세금/컴플라이언스 자동화
- `/app` 내부 `ja` 등 후속 시장 언어 추가 번역
- Admin 결제/구독 운영 도구

따라서 기존 모바일 QA는 현재 Web 제품이 모바일 브라우저에서도 핵심 업무를 수행할 수 있는지 확인하는 QA다.

## 2. 현재 완료 상태

### 2.1 기능 QA happy path

아래 흐름은 현재 활성 범위 기준으로 우선 확인해야 한다.

1. 로그인
2. `/app` 빈 홈
3. `/app/more`
4. 계정 설정 모달
5. 오류 신고와 지원 요청
6. 공개 문의

### 2.2 자동 검증

문서와 코드 변경 후에는 현재 package script 기준으로 자동 검증을 다시 실행한다.

- BE: `pnpm prisma:validate`, `pnpm prisma:generate`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`
- FE/user-web: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm test:e2e`
- FE/admin-web: `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test:e2e`

### 2.3 진입/인증/라우팅 smoke 완료

- Public/auth canonical URL은 `/{locale}`와 `/{locale}/login` 형식을 사용한다.
- legacy `/`, `/login`, `/pricing` 등은 선호 locale URL로 redirect한다.
- `/auth/callback`은 locale prefix 없이 유지한다.
- 로그인/회원가입 provider 버튼은 가능한 경우 browser popup으로 Supabase OAuth authorize URL을 열고, popup이 차단되면 기존 full-page redirect로 fallback한다.
- `/app/*`는 locale prefix를 붙이지 않는다.
- 비로그인 `/app/*` 접근은 선호 locale의 login URL로 이동한다.

### 2.4 API/보안 기본 smoke 완료

- `GET /api/health` 200 확인
- 보호 API 인증 없음 401 확인
- 잘못된 token 401 확인
- 존재하지 않는 route 404 확인
- AdminGuard 403은 자동 테스트로 확인
- User Web API client는 일반 `/api/*` 계약만 사용한다.
- 로그인/보호 redirect URL에 token-like query가 붙지 않는다.
- 비로그인 상태에서 앱 access token이 localStorage에 생성되지 않는다.
- FE/BE source에서 `console.*` 사용자 데이터 출력은 발견되지 않았다.
- refresh token은 httpOnly cookie와 hash 저장 구조를 사용한다.

## 3. 아직 남은 출시 전 품질 범위

### 3.1 UX/UI 공통 QA

현재 가장 중요한 남은 범위다.

확인할 항목:

- 1440px desktop
- 1280px notebook
- 768px tablet
- 390px mobile
- 360px mobile
- 브라우저 확대 125%
- 긴 주소/URL
- 모달/드롭다운/토스트 위치
- Tab/Enter/Escape 기본 접근성
- 에러 메시지와 입력 필드 연결
- 공개 문의 폼의 회사명/회사 규모 입력 보존
- Notion식 작업도구 UX 기준과의 차이

### 3.2 모바일 브라우저 QA

현재 제품은 모바일 브라우저 Web을 포함한다.

우선 확인할 흐름:

- 모바일 로그인
- 홈
- 더보기
- 작은 화면 모달
- 모바일 키보드가 올라온 상태의 저장 버튼 접근

### 3.3 브라우저 QA

우선순위는 Chrome, 그다음 Edge다.

확인할 항목:

- Chrome 최신 버전 핵심 시나리오
- Edge 최신 버전 핵심 시나리오
- 새로고침 후 상태 유지
- 뒤로가기/앞으로가기
- 여러 탭에서 같은 데이터 수정
- 느린 네트워크에서 로딩 상태

### 3.4 다중 계정 보안 QA

일반 smoke로는 확인하지 않은 보안 범위다.

별도 계정 또는 DB 상태 조작이 필요하다.

- 다른 사용자 UUID 추측 접근 불가
- 지원 요청과 오류 신고가 현재 사용자 snapshot으로 저장되는지 확인
- Admin/API 권한 침투성 확인

### 3.5 DB/운영 환경 정합성

현재 기능은 운영 전 별도 정리가 필요하다.

- Prisma generate가 실행 중 BE 프로세스의 query engine DLL lock 때문에 실패했던 기록 정리
- migration 기록 정합성 확인
- seed 실행 여부와 실제 Supabase OAuth QA 데이터 분리
- 배포 DB와 로컬 DB의 migration 상태 차이 정리

## 4. 알려진 한계

현재 실패로 처리하지 않고 `N/A` 또는 `Known limitation`으로 기록하는 항목은 다음이다.

- B2B tenant/team 기능은 현재 범위에서 제외
- 결제, 구독, 세금, invoice, refund, entitlement, paywall은 현재 활성 구현 범위가 아니며 별도 TODO 계획 생성 전까지 deferred 상태
- Kakao OAuth는 로그인 기능에서 제거. 08_GLOBAL_DATA_I18N 완료 기준 Google/LINE/Apple은 runtime provider이며 실제 provider smoke는 운영 provider 설정과 secret 준비 후 별도 확인
- 가입 국가/마지막 로그인 국가는 proxy geo header가 없으면 `KR` fallback 또는 `기록 없음`일 수 있음
- KR/US/CA 우선 전략에 맞춘 CAD, 캐나다 기본 설정, 가격/세금/정책 문구는 후속 구현 대상이다.

## 5. 실행 우선순위

| 순서 | 작업 | 목적 | 완료 기준 |
| --- | --- | --- | --- |
| 1 | 기능 유지보수 | User Web foundation을 베타 제공 가능한 상태로 안정화 | S0/S1/S2가 수정 또는 명확히 보류 판단됨 |
| 2 | UX/UI 상품성 개선 | 반복 사용자가 보기 좋은 업무 도구 품질 확보 | 핵심 화면의 레이아웃/문구/상태/접근성 이슈 정리 |
| 3 | 모바일 브라우저/브라우저 확인 | 현재 Web 제품의 실제 사용성 확인 | 390px/360px, Chrome/Edge 핵심 흐름 사용 가능 |
| 4 | 베타 준비 | 결제창 없는 100명 베타 운영 준비 | onboarding, feedback loop, 지원 흐름 정리 |
| 5 | Paddle 의사결정 | 결제 구현 전 정책 확정 | 가격/플랜/entitlement/AI usage/refund/tax/invoice confirmed |
| 6 | Billing TODO 계획 생성 | 결제 구현 착수 조건 충족 | API/DB/User Web 범위가 confirmed 문서로 작성됨 |

기능 추가 판단 기준:

- 위 1~4번이 끝나기 전에는 Paddle/Billing 구현을 시작하지 않는다.
- 글로벌 B2C 유료 판매 기능은 베타 이후 결제/구독, 세금/컴플라이언스, `/app` 추가 언어 확장을 한 계획으로 묶어 설계한다.

## 6. 베타 이후 기능 우선순위

아래 항목은 기능 유지보수, UX/UI 상품성 개선, 결제창 없는 100명 베타 이후 검토한다.

| 순서 | 작업 | 이유 |
| --- | --- | --- |
| 1 | Paddle/Billing | 유료 판매를 위해 subscription/payment/tax/invoice/refund/entitlement가 필요 |
| 2 | paid conversion/churn analytics | 결제 이후 전환/해지/ARPU/LTV/CAC 판단 필요 |
| 3 | 캐나다 데이터 정합성 및 추가 국가/언어 rollout | KR/US/CA 우선 전략에 맞춰 CA/CAD/캐나다 전화번호/지역을 정리하고, 이후 일본/호주 등 보류 시장 확장 |
| 4 | 모바일 브라우저 현장 사용성 고도화 | 모바일 현장 사용성이 매출/리텐션에 직접 기여할 때 검토 |
| 5 | B2B tenant/team 기능 | 개인 B2C보다 팀/seat 기반 ARPU가 더 강하다고 확인될 때 검토 |

## 7. 지금 바로 할 일

바로 다음 행동은 새 기능 개발이 아니다.

1. 현재 활성 기능 유지보수 범위를 정리한다.
2. UX/UI 상품성 개선 범위를 정리한다.
3. 발견 버그를 S0/S1/S2/S3/S4로 분류한다.
4. S0/S1/S2를 Paddle/Billing보다 먼저 수정한다.
5. 결제창 없는 100명 베타 운영 방식과 feedback loop를 정한다.
6. 베타 이후 Billing TODO 계획을 만들지 판단한다.

이 순서가 끝나기 전에는 Paddle checkout을 구현하지 않는다.

특히 지금 질문에 대한 PM 판단은 다음과 같다.

- 지금은 유지보수와 UX/UI 상품성 개선을 신경써야 하는 타이밍이다.
- 결제창만 붙이는 작업은 아직 이르다.
- 현재 활성 기능이 베타 사용자가 반복해서 쓰기에 충분히 안정적이고 읽기 쉬운지 먼저 확인해야 한다.
- Paddle/Billing은 100명 베타 이후 가격/플랜/권한 정책이 확정되면 시작한다.

## 8. 관련 정본 문서

- `AGENT/PM_AGENT/PLANNING/PRODUCT_DIRECTION.md`
- `AGENT/PM_AGENT/PLANNING/ROADMAP.md`
- `AGENT/PM_AGENT/DECISIONS/030_billing_paddle_defer_policy.md`
- `AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md`
- `AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md`
- `AGENT/PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md`
