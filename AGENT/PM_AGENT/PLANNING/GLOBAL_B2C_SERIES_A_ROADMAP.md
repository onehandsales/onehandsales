# Global B2C And Series A Roadmap

> 기준일: 2026-07-18  
> 상태: PM 전략 정본  
> 구현 상태 기준: `AGENT/PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md`  
> 제품 범위 기준: `AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md`

## 1. 목적

이 문서는 `한손에 영업 / onehand.sales`가 현재 미완성인 부분, 최종 완성 형태, 글로벌 B2C 유료 판매 가능 조건, Series A급 제품/사업으로 가기 위해 추가해야 할 기능을 정리한다.

이 문서는 기능 TODO가 아니라 제품 전략 정본이다. 실제 구현을 시작할 때는 이 문서를 기준으로 새 `TODO/{PLAN_NAME}`을 만들고, API가 포함되면 `COMMON/API-SPEC/*` 계약을 먼저 작성한다.

## 2. 현재 판단 요약

현재 제품은 핵심 MVP 업무 기능이 상당히 구현된 상태다.

완료된 핵심 축:

- Auth/User
- 공개/인증 URL locale
- `/app` 홈
- Company
- Contact
- BusinessCard OCR
- Product
- Deal
- Schedule
- MeetingNote
- Search
- Trash
- DataImport
- Company/Contact/Product/Deal 도메인별 XLSX export

하지만 글로벌 B2C 유료 제품으로 판매하기에는 아직 제품화, 운영, 결제, 로컬라이제이션, 리텐션 계층이 부족하다.

현재 바로 해야 할 일은 새 기능 추가가 아니라 출시 전 품질 라운드다.

우선순위 결론:

1. 지금은 UX/UI와 모바일 브라우저 QA를 신경써야 하는 타이밍이다.
2. 기능 추가는 UX/UI 공통 QA, 모바일 브라우저 QA, Chrome/Edge QA, 다중 계정 보안 QA, DB/Prisma 운영 정합성 확인 이후에 시작한다.
3. QA 중 S0/S1/S2 버그가 발견되면 새 기능보다 먼저 수정한다.
4. QA 이후 첫 기능 후보는 DataImport Job 영속화, Notification/Reminder, 결제/구독 기반, Admin 운영 도구 순으로 본다.

## 3. 현재 미완성 영역

| 영역 | 현재 상태 | 미완성 내용 | 우선순위 판단 |
|---|---|---|---|
| 출시 전 UX/UI 품질 | 핵심 기능 happy path는 통과 | 1440/1280/768/390/360px, 125% 확대, 긴 텍스트, 모달/토스트, 접근성, UX writing QA | 최우선 |
| 모바일 브라우저 | 반응형 Web 범위 | 모바일 로그인, 홈, 딜 단계 탭, 일정 form, 회의록 긴 입력, Import table, 휴지통 복구, 키보드 상태 QA | 최우선 |
| 브라우저 호환 | User Web E2E는 Chromium 중심 | Chrome/Edge 최신 버전, 새로고침, 뒤로/앞으로, 다중 탭, 느린 네트워크 QA | 최우선 |
| 다중 계정 보안 | 기본 smoke는 통과 | 다른 사용자 데이터 UUID 접근, Search/Trash/Export 격리, Admin/API 권한 침투성 확인 | 최우선 |
| DB/운영 정합성 | 기능 QA는 통과 | Prisma generate DLL lock 이력, migration 상태, seed/QA/production 데이터 분리, 배포 DB 정합성 | 최우선 |
| 결제/구독 | MVP 제외 | 요금제, 무료체험, 월/연 결제, 환불, 쿠폰, 구독 상태, 결제 실패 복구, 영수증/인보이스 | 글로벌 유료 판매 전 필요 |
| 글로벌 세금/컴플라이언스 | 미구현 | VAT/GST/판매세 계산/징수/신고, 환불/차지백, 국가별 약관/환불 정책 | 글로벌 유료 판매 전 필요 |
| 앱 내부 다국어 | `/app`은 한국어 우선 | `/app` 전체 locale, 국가별 날짜/전화번호/통화/문구, UX writing 현지화 | 글로벌 확장 전 필요 |
| 다국가 데이터 모델 | 한국 중심 | 다국가 전화번호, 국가/지역 입력, 통화, 국가별 export 표시 | 글로벌 확장 전 필요 |
| Admin 운영 | `/admin/api/me`만 완료 | 사용자/도메인 조회, 결제 상태, 감사 로그, 민감 원문 조회, 고객 지원 도구 | 유료 운영 전 필요 |
| Notification | Backend 없음, route 숨김 | 알림 목록, 읽음 처리, unread count, 설정, email/browser push | 리텐션 강화 전 필요 |
| DataImport | pre-confirm job in-memory | ImportJob DB 영속화, 서버 재시작 후 이어받기, 배포 중 유실 방지 | QA 이후 우선 |
| Schedule 고도화 | CRUD와 월간 화면 완료 | 주간 보고서, PDF/Excel, 반복 일정, Google Calendar 가져오기/내보내기 | 리텐션 강화 |
| Deal 활동 | FollowingAction/Memo 중심 | 범용 DealActivity, 활동 타입, 단계 변경 자동 로그, 일정/회의록 통합 타임라인 | 제품 완성도 강화 |
| MeetingNote AI/STT | draft 기능 완료 | transcript 저장 여부, provider call log, 품질 분석, 템플릿, 개인정보 정책 | AI 운영 고도화 |
| BusinessCard OCR | 업로드 OCR 완료 | 모바일 카메라 촬영 UX, 다국가 전화번호 검증, provider error observability | 모바일/글로벌 강화 |
| 민감정보/보안 | 기본 보호 | 자동 민감정보 감지, Admin 원문 조회 사유/감사, 민감 export 마스킹 | 유료 운영 신뢰 |
| 모바일 앱 | 없음 | iOS/Android, push, 카메라, 음성 기록, 오프라인 임시 저장 | Series A급 확장 후보 |
| 제품 분석 | 정본 없음 | activation, retention, churn, CAC, LTV, cohort, paywall funnel, AI cost/user | Series A 전 필수 |

## 4. 최종 완성 형태

최종 완성 형태는 하나가 아니라 세 단계로 정의한다.

### 4.1 출시 가능한 MVP 완성형

출시 가능한 MVP 완성형은 현재 구현된 핵심 업무 기능이 실제 사용자 환경에서 안정적으로 동작하는 상태다.

필수 조건:

- 회사/담당자/제품/딜/일정/회의록/명함 OCR/DataImport/Search/Trash/Export 핵심 흐름이 desktop과 mobile browser에서 깨지지 않는다.
- UX/UI 공통 QA가 완료되어 주요 화면의 레이아웃, 문구, 입력 상태, empty/error/loading 상태가 제품 톤과 맞는다.
- 390px/360px 모바일 브라우저에서 핵심 업무를 수행할 수 있다.
- Chrome/Edge에서 핵심 시나리오가 통과한다.
- 다중 계정 데이터 격리가 Search, Trash, Export, 직접 URL 접근에서 확인된다.
- DB/Prisma/migration/seed 운영 정합성이 배포 가능한 수준으로 정리된다.
- S0/S1 버그가 없고, S2 버그는 수정 또는 출시 판단에 맞게 명시적으로 보류된다.

이 단계에서는 결제 자동화가 없어도 제한된 베타 또는 수동 유료 검증은 가능하다.

### 4.2 글로벌 B2C 유료 판매 가능형

글로벌 B2C 유료 판매 가능형은 제품 기능 외에 돈을 받고 운영할 수 있는 계층이 갖춰진 상태다.

필수 조건:

- 무료체험, 월간/연간 구독, AI 사용량 포함/초과 정책이 정의된다.
- 결제 provider 또는 Merchant of Record를 붙여 카드, Apple Pay/Google Pay, 국가별 결제 수단을 지원한다.
- VAT/GST/판매세, 환불, chargeback, invoice, receipt 처리가 가능하다.
- `ko`, `ja`, `zh-tw`, `en-us`, `en-gb`, `en-sg`, `en-au`, `en-ca` 중 실제 판매 대상 시장의 `/app` 내부 다국어가 준비된다.
- 국가별 날짜/시간/전화번호/통화/주소 표시가 자연스럽다.
- Admin에서 사용자, 구독 상태, 결제 이슈, 민감정보 마스킹, 감사 로그, 고객 지원 흐름을 운영할 수 있다.
- 개인정보 처리, 계정 삭제, 데이터 export, 환불/약관/보안 문서가 실제 판매 국가 기준으로 준비된다.
- 제품 분석으로 가입, 활성화, 유료전환, 해지, 재방문, AI 사용 비용을 추적한다.

이 단계가 되어야 세계를 대상으로 B2C 유료 판매를 실질적으로 시도할 수 있다.

### 4.3 Series A급 제품/사업 완성형

Series A급은 기능이 많다는 뜻이 아니다. 반복 매출, 리텐션, 성장 경로, 운영 신뢰, 차별화된 제품 가치가 지표로 증명되는 상태다.

필수 방향:

- 사용자가 매일 열 이유가 있는 리텐션 루프가 있다.
- 일정, 다음 행동, 회의록, 명함, Import, Search가 딜 타임라인으로 자동 연결된다.
- AI가 회의록 요약 보조가 아니라 딜 리스크, 다음 행동, follow-up, 영업 리포트, 데이터 정리까지 핵심 가치에 들어간다.
- 모바일 브라우저 또는 네이티브 앱에서 현장 입력, 명함 촬영, 음성 기록, push reminder가 자연스럽다.
- 요금제, 무료체험, annual plan, 국가별 가격, paywall A/B test, churn survey가 운영된다.
- 활성화율, D7/D30 retention, 유료 전환율, churn, ARPU, LTV/CAC, AI cost/user, gross margin을 지속적으로 본다.
- Admin 운영, 보안, 감사 로그, 데이터 삭제/내보내기, 장애 대응이 유료 고객을 감당할 수 있다.
- 개인 영업자 B2C에서 시작하되 prosumer, solo-to-small-team, 보험/부동산/프리랜서 영업 등 더 높은 ARPU segment로 확장할 수 있다.

## 5. 세계 대상 B2C 판매 가능성

최종 유료 판매 가능형까지 갖추면 세계 대상 B2C 판매는 가능하다.

단, 전 세계 동시 공략은 기본 전략으로 보지 않는다. 초기에는 한국에서 유료 전환과 리텐션을 검증하고, 이후 일본/대만, 그 다음 영어권으로 넓히는 단계적 확장을 우선한다.

이유:

- B2C subscription app 시장은 경쟁이 강하고 acquisition cost와 churn 압력이 크다.
- 낮은 월 구독료만으로 의미 있는 ARR을 만들려면 많은 유료 사용자가 필요하다.
- 영업 업무 도구는 국가별 언어, 전화번호, 날짜/시간, 영업 관행, 결제/세금 정책의 영향을 받는다.
- 글로벌 결제와 세금은 Stripe Tax, Paddle 같은 도구나 Merchant of Record로 줄일 수 있지만 제품 내부 로컬라이제이션과 고객 지원은 직접 해결해야 한다.

초기 가격 가설 월 6,900원 기준 단순 계산:

| 목표 ARR | 필요한 유료 사용자 수 |
|---|---:|
| 10억 원 ARR | 약 12,100명 |
| 30억 원 ARR | 약 36,300명 |
| 70억 원 ARR | 약 84,600명 |

따라서 글로벌 B2C 판매를 목표로 할수록 `Basic / Pro / AI Plus / Annual`처럼 ARPU를 높이는 패키징이 필요하다.

## 6. 지금 당장 해야 하는 우선순위

지금은 UX/UI를 신경써야 하는 타이밍이다.

기능을 더 붙이기 전에 현재 구현된 핵심 기능이 실제 유료 사용자에게 팔 수 있는 수준으로 보이는지, 모바일 브라우저에서 사용 가능한지, 데이터 격리가 안전한지, 운영 DB 상태가 배포 가능한지를 먼저 확인해야 한다.

### P0. 출시 전 품질 라운드

1. UX/UI 공통 QA
2. 모바일 브라우저 390px/360px QA
3. Chrome/Edge QA
4. 다중 계정 보안 QA
5. DB/Prisma/migration 운영 정합성 정리

완료 기준:

- `AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md` 기준으로 결과가 기록된다.
- S0/S1/S2 버그가 분류된다.
- S0/S1은 모두 수정된다.
- S2는 수정 또는 출시 보류 판단이 문서화된다.

### P1. 외부 진입면과 신뢰 문구 점검

1. 공개/인증 화면의 가치 제안이 개인 영업자 B2C와 맞는지 확인한다.
2. pricing/contact/security/terms/privacy 문구가 실제 제품 범위와 맞는지 점검한다.
3. 앱 내부 문구가 `UX_WRITING_GUIDE.md`의 해요체, 행동형 기준을 따르는지 확인한다.

### P2. QA 이후 첫 기능

QA 이후 첫 기능은 아래 순서로 본다.

1. DataImport Job 영속화
2. Notification/Reminder
3. 결제/구독 기반 설계
4. Admin 운영 조회/구독 상태 관리
5. 다국가 전화번호와 `/app` 내부 다국어

### P3. 리텐션/Series A 기반 기능

1. 주간 영업 리포트
2. 범용 DealActivity timeline
3. Google Calendar 가져오기/내보내기
4. AI follow-up/next action 추천
5. 모바일 앱 또는 강한 PWA
6. 제품 분석과 paywall 실험

## 7. Series A급으로 가기 위한 추가 기능

### 7.1 리텐션 루프

- 다음 행동 reminder
- 일정 알림
- 회의록 follow-up reminder
- 주간 영업 리포트
- 딜 마감 임박/지연 알림
- 모바일 push 또는 browser push

### 7.2 AI 핵심 가치

- 회의록 요약을 넘어 딜 리스크 탐지
- 다음 행동 추천
- follow-up 메시지 초안
- 영업 리포트 자동 요약
- 명함/Import/회의록 데이터 정리 품질 개선
- 사용자별 영업 패턴 기반 추천

### 7.3 모바일 현장 사용성

- 모바일 브라우저 최적화 우선
- 이후 iOS/Android 또는 PWA
- 명함 카메라 촬영
- 회의 직후 음성 기록
- 오프라인 임시 저장
- push reminder

### 7.4 결제와 성장 실험

- free trial
- annual plan
- 국가별 가격
- AI 사용량 기반 plan
- paywall A/B test
- coupon/referral
- churn survey
- failed payment recovery

### 7.5 운영과 신뢰

- Admin dashboard
- 사용자/도메인 조회
- 결제/구독 상태 관리
- 민감정보 마스킹
- 원문 조회 사유 입력
- 감사 로그
- 계정 삭제/데이터 export
- 장애 대응과 provider status 기록

### 7.6 제품 분석

- activation funnel
- first company/contact/product/deal created
- first schedule linked
- first meeting note saved
- first OCR/import success
- D1/D7/D30 retention
- paid conversion
- churn
- ARPU
- LTV/CAC
- AI cost per active user

## 8. Series A 판단 기준 메모

Series A는 기능 수가 아니라 성장성과 반복 매출의 질로 판단한다.

참고 기준:

- 2026년 SaaS Series A 시장은 전반적으로 ARR, 성장률, 리텐션, 매출 품질을 더 강하게 본다.
- B2B SaaS benchmark는 일반적으로 수백만 달러 ARR가 언급되지만, B2C는 revenue threshold가 다를 수 있고 retention/growth evidence가 더 중요하다.
- AI 관련 회사에 자금이 강하게 쏠리는 시장이므로, 일반 SaaS로 보이면 더 강한 지표가 필요하다.
- 이 제품은 "AI 기능이 있는 CRM"이 아니라 "AI가 개인 영업자의 다음 행동과 기록 정리를 실질적으로 자동화하는 도구"로 진화해야 Series A급 차별화를 만들 수 있다.

이 문서의 외부 benchmark는 전략 참고용이다. 투자 유치, 가격, 세금, 법무 판단 전에는 최신 자료와 전문가 검토를 다시 확인한다.

## 9. 관련 정본 문서

- `AGENT/PM_AGENT/PLANNING/SERVICE_OVERVIEW.md`
- `AGENT/PM_AGENT/PLANNING/PRD.md`
- `AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md`
- `AGENT/PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md`
- `AGENT/SOFTWARE_AGENT/COMMON/NEXT_FEATURE_PRIORITIES.md`
- `AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`

## 10. 외부 참고 자료

- CRV, Series A Metrics VCs Expect in 2026: `https://www.crv.com/content/series-a-metrics-vcs-expect`
- Carta, State of Private Markets Q1 2026: `https://carta.com/data/state-of-private-markets-q1-2026/`
- RevenueCat, State of Subscription Apps 2026: `https://www.revenuecat.com/state-of-subscription-apps/`
- Paddle, Merchant of Record / global SaaS billing: `https://www.paddle.com/`
- Stripe Tax: `https://stripe.com/tax`
- Stripe, Merchant of Record for SaaS: `https://stripe.com/resources/more/merchant-of-record-for-saas`
