# Next Feature Priorities

기준일: 2026-08-11
전략 보강: 2026-08-11 `AGENT/PM_AGENT/DECISIONS/030_global_b2c_closeout_and_paddle_defer.md`

이 문서는 `onehand.sales`의 다음 작업 우선순위를 정리한다. 현재 기준에서는 새 기능 개발이나 Paddle checkout 구현보다 기존 01~11 기능 유지보수, UX/UI 상품성 개선, 결제창 없는 100명 베타 준비가 우선이다.

2026-08-11 기준 `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN`의 01~11 기능 선구현 로드맵은 완료 archive다. 기존 12 Billing/Subscription/Tax는 `TODO/PADDLE_PLAN`으로 이관했고 Deferred / Draft 상태로 둔다.

현재 결론:

- 기존 01~11 기능 유지보수와 S0/S1/S2 버그 수정을 가장 먼저 한다.
- 그 다음 UX/UI 상품성 개선과 결제창 없는 100명 베타 준비를 진행한다.
- 베타 전에는 Paddle checkout, 결제 webhook/API/DB migration, AI 사용량 제한 billing source-of-truth 연결을 하지 않는다.
- Paddle/Billing은 베타 피드백과 가격/플랜/entitlement/정책 확정 이후 `TODO/PADDLE_PLAN`을 confirmed 계획으로 승격할 때 시작한다.
- 글로벌 B2C 유료 판매와 Series A급 제품 방향은 `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_SERIES_A_ROADMAP.md`를 따른다.

## 1. 현재 제품 범위

현재 제품 범위는 다음과 같다.

- Web
- 반응형 Web
- 모바일 브라우저 Web
- 공개/인증 화면의 URL locale 지원
- 앱 내부 관리 화면은 08_GLOBAL_DATA_I18N 완료 기준 `ko-KR`, `en` 1차 지원

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
- `zh-tw`
- `en-gb`
- `en-sg`
- `en-au`

현재 범위가 아닌 항목은 다음과 같다.

- iOS/Android 네이티브 앱
- 네이티브 푸시
- 네이티브 연락처/캘린더 연동
- 오프라인 앱 동작
- 앱스토어/플레이스토어 배포
- 결제/구독 자동화
- 글로벌 세금/컴플라이언스 자동화
- `/app` 내부 `ja`, `zh-TW`, `zh-CN` 추가 번역
- Admin 결제/구독 운영 도구

따라서 모바일 QA는 네이티브 앱 QA가 아니라, 현재 Web 제품이 모바일 브라우저에서도 핵심 업무를 수행할 수 있는지 확인하는 QA다.

## 2. 현재 완료 상태

### 2.1 기능 QA happy path 완료

아래 흐름은 수동 QA 기준으로 동작 확인 완료 상태다.

1. 로그인
2. 회사 생성/조회/수정/삭제/복구
3. 담당자 생성/조회/수정/삭제/복구
4. 제품 생성/조회/수정/삭제/복구
5. 딜 생성/조회/수정/삭제/복구
6. 일정 생성/조회/수정/삭제
7. 회의록 생성/조회/수정/삭제/복구
8. 명함 OCR
9. 데이터 가져오기 Import
10. 검색
11. 휴지통
12. 도메인별 XLSX Export
13. 설정/더보기

### 2.2 자동 검증 완료

2026-07-10 기준 자동 검증 결과는 다음과 같다.

- BE `typecheck`, `lint`, `test`, `build` 통과
- BE test: 17 suites / 82 tests passed
- FE/user-web `typecheck`, `lint`, `build`, `test:e2e` 통과
- FE/user-web E2E: 핵심 업무 smoke 1 passed
- FE/admin-web `typecheck`, `lint`, `build` 선택 점검 통과. 이후 2026-08-09 G05 closeout에서 현재 Admin route smoke E2E도 통과 상태로 기록됨

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
- User Web API client는 `/admin/api/*` 호출을 차단한다.
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
- 긴 회사명/담당자명/제품명/딜이름
- 긴 이메일/전화번호/URL
- 회사 생성 오른쪽 문서형 패널의 resize, 70% max 폭, 목록 컬럼 유지, 가로 스크롤
- 모달/드롭다운/토스트 위치
- Tab/Enter/Escape 기본 접근성
- 에러 메시지와 입력 필드 연결
- Notion식 작업도구 UX 기준과의 차이

### 3.2 모바일 브라우저 QA

현재 제품은 모바일 브라우저 Web을 포함한다.

우선 확인할 흐름:

- 모바일 로그인
- 홈
- 회사/담당자/제품 목록
- 딜 단계 탭과 딜 목록
- 일정 생성 form
- 회의록 긴 입력
- Import 표 가로 스크롤
- 휴지통 복구
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
- XLSX export에 다른 사용자 데이터 미포함
- 다중 계정 검색 결과 격리
- 다중 계정 휴지통 격리
- Admin/API 권한 침투성 확인

### 3.5 DB/운영 환경 정합성

현재 기능 수동 QA는 통과했지만, 운영 전 별도 정리가 필요하다.

- Prisma generate가 실행 중 BE 프로세스의 query engine DLL lock 때문에 실패했던 기록 정리
- migration 기록 정합성 확인
- seed 실행 여부와 실제 Supabase OAuth/CRM QA 데이터 분리
- 배포 DB와 로컬 DB의 migration 상태 차이 정리

## 4. 알려진 한계

현재 실패로 처리하지 않고 `N/A` 또는 `Known limitation`으로 기록하는 항목은 다음이다.

- `/app/export`는 `/app`으로 redirect됨
- Billing Admin과 B2B tenant/team admin은 현재 범위에서 제외
- 결제, 구독, 세금, invoice, refund, entitlement, paywall은 `TODO/PADDLE_PLAN` Deferred / Draft 범위
- iOS/Android 네이티브 앱은 현재 제품 범위가 아님
- Kakao OAuth는 로그인 기능에서 제거. 08_GLOBAL_DATA_I18N 완료 기준 Google/LINE/Apple은 runtime provider이며 실제 provider smoke는 운영 provider 설정과 secret 준비 후 별도 확인
- 가입 국가/마지막 로그인 국가는 proxy geo header가 없으면 `KR` fallback 또는 `기록 없음`일 수 있음
- 현재 전화번호 입력/검증은 KR/US를 1차 지원한다. KR/US/CA 우선 전략에 맞춘 CA 전화번호, CAD, 캐나다 회사 지역은 후속 구현 대상이다.

## 5. 실행 우선순위

| 순서 | 작업 | 목적 | 완료 기준 |
| --- | --- | --- | --- |
| 1 | 기능 유지보수 | 01~11 foundation을 베타 제공 가능한 상태로 안정화 | S0/S1/S2가 수정 또는 명확히 보류 판단됨 |
| 2 | UX/UI 상품성 개선 | 반복 사용자가 보기 좋은 업무 도구 품질 확보 | 핵심 화면의 레이아웃/문구/상태/접근성 이슈 정리 |
| 3 | 모바일/브라우저 확인 | 현재 Web 제품의 실제 사용성 확인 | 390px/360px, Chrome/Edge 핵심 흐름 사용 가능 |
| 4 | 베타 준비 | 결제창 없는 100명 베타 운영 준비 | onboarding, feedback loop, 지원 흐름 정리 |
| 5 | Paddle 의사결정 | 결제 구현 전 정책 확정 | 가격/플랜/entitlement/AI usage/refund/tax/invoice confirmed |
| 6 | `TODO/PADDLE_PLAN` 승격 | 결제 구현 착수 조건 충족 | API/DB/User Web/Admin 범위가 confirmed 문서로 작성됨 |

기능 추가 판단 기준:

- 위 1~4번이 끝나기 전에는 Paddle/Billing 구현을 시작하지 않는다.
- 글로벌 B2C 유료 판매 기능은 베타 이후 결제/구독, 세금/컴플라이언스, Billing Admin, `/app` 추가 언어 확장을 한 계획으로 묶어 설계한다.
- Series A급 기능은 이미 구현된 Notification/Reminder, AI report/follow-up, mobile field-use, Product Analytics foundation을 실제 리텐션/매출 지표로 고도화할 때 의미가 있다.

## 6. 베타 이후 기능 우선순위

아래 항목은 기능 유지보수, UX/UI 상품성 개선, 결제창 없는 100명 베타 이후 검토한다.

| 순서 | 작업 | 이유 |
| --- | --- | --- |
| 1 | Paddle/Billing | 유료 판매를 위해 subscription/payment/tax/invoice/refund/entitlement가 필요 |
| 2 | Billing Admin | 구독 상태, 결제 이슈, invoice/refund/failed payment 운영 필요 |
| 3 | paid conversion/churn analytics | 결제 이후 전환/해지/ARPU/LTV/CAC 판단 필요 |
| 4 | 캐나다 데이터 정합성 및 추가 국가/언어 rollout | KR/US/CA 우선 전략에 맞춰 CA/CAD/캐나다 전화번호/지역을 정리하고, 이후 일본/대만/호주 등 보류 시장 확장 |
| 5 | native/PWA packaging | 모바일 현장 사용성이 매출/리텐션에 직접 기여할 때 검토 |
| 6 | B2B tenant/team admin | 개인 B2C보다 팀/seat 기반 ARPU가 더 강하다고 확인될 때 검토 |

## 7. 지금 바로 할 일

바로 다음 행동은 새 기능 개발이 아니다.

1. 01~11 기능 유지보수 범위를 정리한다.
2. UX/UI 상품성 개선 범위를 정리한다.
3. 발견 버그를 S0/S1/S2/S3/S4로 분류한다.
4. S0/S1/S2를 Paddle/Billing보다 먼저 수정한다.
5. 결제창 없는 100명 베타 운영 방식과 feedback loop를 정한다.
6. 베타 이후 `TODO/PADDLE_PLAN` gate를 confirmed로 바꿀지 판단한다.

이 순서가 끝나기 전에는 Paddle checkout을 구현하지 않는다.

특히 지금 질문에 대한 PM 판단은 다음과 같다.

- 지금은 유지보수와 UX/UI 상품성 개선을 신경써야 하는 타이밍이다.
- 결제창만 붙이는 작업은 아직 이르다.
- 이미 구현된 01~11 기능이 베타 사용자가 반복해서 쓰기에 충분히 안정적이고 읽기 쉬운지 먼저 확인해야 한다.
- Paddle/Billing은 100명 베타 이후 가격/플랜/권한 정책이 확정되면 시작한다.

## 8. 관련 정본 문서

- `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_SERIES_A_ROADMAP.md`
- `AGENT/PM_AGENT/DECISIONS/029_global_b2c_series_a_priority.md`
- `AGENT/PM_AGENT/DECISIONS/030_global_b2c_closeout_and_paddle_defer.md`
- `AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md`
- `AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md`
- `AGENT/PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md`
- `TODO/PADDLE_PLAN/README.md`
