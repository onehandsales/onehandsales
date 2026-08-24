# PRD

> 제품명: 한손에 영업 / onehand.sales  
> 상태: MVP 정본 초안  
> 기준: `AGENT/PM_AGENT/DECISIONS/000_확정_결정.md`
> 현재 구현 스냅샷: 2026-08-11 `BE`, `FE/user-web`, `FE/admin-web`, `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN`
> 글로벌/Series A 전략 보강: 2026-08-11 `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_SERIES_A_ROADMAP.md`

---

## 1. 제품 정의

한손에 영업은 B2C 개인 영업자를 위한 영업 업무 관리 도구다.

영업자가 회사 시스템이나 개인 메모장, 엑셀, 명함, 캘린더에 흩어진 영업 정보를 한곳에 모아 관리하고, 담당자 앞에서 필요한 정보를 빠르게 확인하며, 딜/일정/회의록을 개인 기준으로 정리할 수 있게 한다.

## 2. 주 타겟

- 30~50대 남성 영업직
- 특히 40~50대 비중이 높을 것으로 가정
- 회사/팀이 도입하는 솔루션이 아니라 영업자 개인이 직접 사용하는 B2C 도구
- 초기 가격 가설: 월 5,900~6,900원
- 우선 판매/검토 국가: 한국, 미국, 캐나다
- 공개/인증 URL locale 노출: `ko`, `en-us`, `en-ca`
- 추후 확장 후보 locale: `ja`, `zh-tw`, `en-gb`, `en-sg`, `en-au`
- 08_GLOBAL_DATA_I18N 완료 기준 로그인 이후 `/app` 관리 화면은 `ko-KR`, `en`을 1차 지원한다. `ja`, `zh-TW`, `zh-CN` 앱 내부 번역은 후속 시장 확장 범위로 둔다.
- 글로벌 B2C 유료 판매는 전 세계 동시 공략이 아니라 한국, 미국, 캐나다 우선 검증 후 일본/대만/호주 등 보류 시장으로 넓히는 단계적 전략을 기본으로 둔다.

## 3. 핵심 문제

- 회사, 담당자, 제품, 딜 정보가 흩어져 있다.
- 영업자가 개인적으로 기억해야 하는 맥락을 공식 시스템에 남기기 어렵다.
- 딜 금액, 진행 상태, 후속 조치, 일정이 한 화면에서 연결되지 않는다.
- 주간 일정 보고를 위해 캘린더/엑셀/메모를 다시 정리해야 한다.
- 회의 후 정리한 내용을 딜 활동으로 연결하는 과정이 번거롭다.
- 명함 기반 담당자 입력이 귀찮고 누락되기 쉽다.

## 4. 핵심 가치

1. 회사/담당자/제품/딜을 개인 기준으로 통합 관리한다.
2. 딜 금액, 단계, 다음 행동, 활동 기록을 한곳에서 관리한다.
3. 일정을 딜과 연결하고 일정 화면에서 확인한다. 주간 보고서와 파일 출력은 후속 범위다.
4. 회의 내용을 직접 저장하거나 AI/STT로 정리한 뒤 딜 활동 로그에 연결한다.
5. 명함 OCR과 AI Import 매핑으로 초기 입력 비용을 줄인다.

## 5. MVP 핵심 루프

1. 회사/담당자/제품을 등록한다.
2. 회사/담당자/제품을 기반으로 딜을 생성한다.
3. 딜 단계, 금액, 다음 행동, 활동 로그를 관리한다.
4. 일정을 딜과 연결한다.
5. 일정 화면에서 딜과 연결된 일정을 확인한다. 별도 주간 보고서 화면/PDF/Excel은 후속 범위다.
6. 회의 내용을 직접 작성해 저장하거나 텍스트/음성 AI 정리로 초안을 만든 뒤 저장한다.
7. 저장한 회의록을 딜과 연결해 딜 활동 로그를 자동 생성한다.

현재 구현 기준:

- 구현 완료: URL locale 공개/인증 진입면, Auth/User, `/app` 홈 대시보드, 회사, 담당자, 제품, 딜, 일정, 회의록 직접 작성/저장, 회의록 AI/STT draft UI, 회의록 저장 후 딜 연동/활동 로그 생성, 회의록 삭제/휴지통 복구, 통합검색 Backend API와 User Web GlobalSearch, 휴지통 목록/상세/7일 이내 복구.
- 구현 완료: Company/Contact/Product/Deal 도메인별 xlsx export. 범용 ExportJob은 현재 제품 방향에서 사용하지 않는다.
- 구현 완료: 명함 OCR은 `/app/business-cards` 화면과 `/api/business-card-scans` API로 제공한다. 이미지를 업로드하면 `명함스캔` 진행 표시 후 추출값을 확인/수정하고, 저장 시 회사/담당자를 재사용하거나 생성한다.
- 구현 완료: DataImport는 `ImportJob` 기반으로 회사/담당자/제품/딜 양식 다운로드, CSV/XLSX 업로드, AI 컬럼 매핑, 사용자 보정/검증, 셀 단위 validation 메시지, 확정 전 job 재개, confirm/cancel/expire, 확정 저장, 성공 내역 조회를 제공한다. 딜 import 누락 회사/담당자/제품 보정 배열은 FE API/controller/application/repository confirm 경로에 연결되어 있다.
- 구현 완료: Notification/Reminder, Weekly Schedule Report, Google Calendar Integration, AI Weekly Sales Report/Follow-up, DealActivity Timeline, MeetingNote AI provider log, Global Data/I18N, Product Analytics, Mobile Field Use foundation, Admin Operation foundation.
- Backend 미구현 또는 후속 범위: Paddle/Billing, Billing Admin, B2B tenant/team admin, native/PWA packaging, 7일 이후 유료 복구 API, 영구 삭제 운영 mutation, 민감 데이터 포함 export.
- 2026-08-11 기준 Global B2C 01~11 기능 선구현 로드맵은 완료 archive다. 기존 12 Billing/Subscription/Tax는 `TODO/PADDLE_PLAN`으로 이관했고, 베타 전 checkout/webhook/API/DB migration은 만들지 않는다.
- 현재 다음 작업은 새 기능 추가나 결제창 구현이 아니라 기능 유지보수, UX/UI 상품성 개선, 결제창 없는 100명 베타 준비다.

## 6. MVP 포함 기능

- 소셜 인증: 08_GLOBAL_DATA_I18N 완료 기준 Google, LINE, Apple을 runtime provider로 사용한다. Kakao는 legacy enum/과거 데이터 호환으로만 유지한다.
- 공개/인증 화면 URL locale
- 회사 관리
- 담당자 관리
- 제품 관리
- 딜 관리
- 딜 활동 로그
- 일정 관리
- 일정 목록/캘린더 화면
- 회의록 직접 작성/저장
- 회의록 텍스트 입력 기반 AI 정리
- 회의록 음성 STT+AI 정리
- 회의록 딜 연결
- 명함 이미지 업로드 OCR과 확인/수정 후 회사/담당자 저장
- 회사/담당자/제품/딜 엑셀 다운로드
- Memo 기록
- 민감정보 저장 경고
- 휴지통 7일 무료 복구

## 7. MVP 제외 기능

- 결제/구독 자동화
- 모바일 앱
- STT transcript 영구 저장과 고도화된 브라우저 녹음 UX
- 구글 캘린더 write/watch/export 고도화
- 주간 일정 보고서 고도화
- 알림 email/browser push 운영 고도화
- 범용 ExportJob과 `/api/exports`
- Billing Admin과 B2B tenant/team admin
- 카카오 알림톡
- 사용자 커스텀 필드 UI
- 캐나다 국가/통화 rollout 및 추가 국가/통화 rollout
- 자동 민감정보 키워드/패턴 감지
- 팀 공유/협업

## 8. 결제 전략

MVP와 100명 베타 전에는 결제를 붙이지 않는다.

기존 12 Billing/Subscription/Tax 작업은 `TODO/PADDLE_PLAN`으로 이관했다. Paddle은 Merchant of Record 후보로 유지하되, plan, 가격, trial, entitlement, AI 사용량 제한, 환불/해지/failed payment 정책이 확정되기 전에는 checkout-only 구현도 하지 않는다.

100명 베타 이후 반복 사용, 이탈 지점, 유료 전환 후보 기능, 플랜별 가치 차이를 확인한 뒤 무료체험, 월간/연간 구독, 국가별 가격, 환불, 결제 실패 복구, 영수증/인보이스, VAT/GST/판매세 또는 Merchant of Record 처리를 함께 설계한다.

## 9. 글로벌 B2C와 Series A 전략

글로벌 B2C 유료 판매 가능형은 핵심 기능 완성만으로 정의하지 않는다. 결제/구독, 세금/컴플라이언스, 추가 `/app` 내부 다국어, 국가별 전화번호/날짜/통화/문구, Billing Admin, 고객 지원, paid conversion/churn 분석이 함께 있어야 한다.

Series A급으로 가려면 기능 수보다 반복 매출과 리텐션의 질이 중요하다. `한손에 영업 / onehand.sales`는 단순히 AI 기능이 붙은 CRM이 아니라, 개인 영업자의 다음 행동과 기록 정리를 AI가 실질적으로 돕는 도구로 진화해야 한다.

Series A급 제품 방향:

- Notification/Reminder 기반 리텐션 루프
- AI next action, follow-up 문구, 딜 리스크, 주간 영업 리포트
- 모바일 현장 입력, 명함 촬영, 음성 기록, push reminder
- free trial, annual plan, 국가별 가격, paywall 실험
- activation, D7/D30 retention, paid conversion, churn, ARPU, LTV/CAC, AI cost/user 분석
- Admin 운영 고도화, 민감정보 마스킹, 원문 조회 사유, 감사 로그, 결제/구독 상태 관리

자세한 정본은 `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_SERIES_A_ROADMAP.md`를 따른다.

## 10. 성공 기준

- 사용자가 회사/담당자/제품을 등록하고 딜을 만들 수 있다.
- 딜에 금액, 단계, 다음 행동, 활동 로그를 누적할 수 있다.
- 일정이 딜과 연결되고 일정 화면에서 확인된다.
- 명함 OCR 결과를 확인/수정 후 회사/담당자로 저장할 수 있다.
- 회의록을 직접 저장하거나 AI/STT 정리 후 저장하고, 딜 활동 로그로 연결할 수 있다.
- 민감 데이터는 기본적으로 보호된다. 민감 데이터 포함 export와 Admin 원문 조회는 후속으로 마스킹/사유/감사 로그 정책을 함께 구현한다.
- 글로벌 유료 판매 단계에서는 구독 결제, 세금/컴플라이언스, 추가 다국어, Billing Admin, paid conversion/churn 분석이 함께 준비되어야 한다.
- Series A급 판단은 기능 완성이 아니라 리텐션, 유료 전환, 반복 매출, 성장 효율, AI 차별화가 지표로 증명되는지로 본다.

## 11. 관련 문서

- `AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md`
- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_SERIES_A_ROADMAP.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/PM_AGENT/DECISIONS/000_확정_결정.md`
- `AGENT/PM_AGENT/DECISIONS/029_global_b2c_series_a_priority.md`
- `AGENT/PM_AGENT/DECISIONS/030_global_b2c_closeout_and_paddle_defer.md`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/README.md`
- `TODO/PADDLE_PLAN/README.md`
