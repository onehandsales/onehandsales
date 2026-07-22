# Current vs Final Gap Matrix

상태: Draft Guide

## 0. 완료 반영

- [x] `NBA-006 ImportJob persistence/resume API`: Done (2026-07-21)
- [x] Import gap 중 "confirm 전 job in-memory" 항목은 닫힘
- [x] `NBA-010 Notification`: Done (2026-07-22)
- [x] 일정/딜 reminder 기반 retention loop와 `/app/notifications` UX 구현 완료

## 1. Gap 분류 기준

| 분류 | 의미 |
|---|---|
| MVP/internal quality | 이미 기능은 있으나 내부 품질 기준에서 안정성, 흐름, UX 완성도를 더 봐야 하는 영역 |
| UX/UI productization | 이미 기능은 있으나 Global B2C 유료 제품처럼 읽히고 쓰이는지 더 봐야 하는 영역 |
| UX/API gap | UX에서 필요한 정보가 확정되면 API 계약으로 승격할 수 있는 영역 |
| Feature gap | 최종 서비스에는 필요하지만 현재 기능/API가 없는 영역 |
| Ops/security gap | 운영, 보안, 감사, 복구, DB 안전성 관련 영역 |
| First-sale global gap | Global B2C 첫 판매를 위해 필요한 결제, 현지화, 운영, 정책, 분석 영역 |
| First-sale/Series A gap | 첫 판매에 필요한 최소 리텐션인지 Series A 이후 기능인지 결정해야 하는 영역 |
| Series A gap | 리텐션, AI 차별화, 성장/분석 관련 영역 |

## 2. 최종 대비 현재 차이

| 영역 | 최종 서비스에 필요한 상태 | 현재 상태 | 차이 | 분류 | 우선 판단 |
|---|---|---|---|---|---|
| 핵심 CRM 루프 | 회사/담당자/제품/딜/일정/회의록이 한 흐름으로 이어진다. | 대부분 구현 완료 | MVP 핵심 루프는 있으나 Global B2C 유료 사용자가 반복 사용할 완성감 점검 필요 | UX/UI productization | 첫 판매 전 점검 |
| 홈 | 오늘 일정, 진행 딜, 다음 행동, 최근 회의록이 바로 읽힌다. | `/app` dashboard 구현 | 실제 사용자가 하루 업무를 시작하기 충분한지 재점검 필요 | UX/UI productization | 첫 판매 전 점검 |
| 딜 목록 | 단계, 금액, 회사/담당자/제품, 다음 행동, 마감일이 빠르게 비교된다. | pipeline/list/detail 구현. product summary는 list API에 없음 | 제품 linked record, row density, 다음 행동 강조 gap | UX/API gap | UX 먼저, API는 후속 |
| 회사/담당자/제품 목록 | linked record, 진행 딜, 최근 활동, 다음 행동 맥락이 보인다. | 기본 목록/count 구현. 일부 summary 없음 | Contact dealCount, latest activity summary 후보 | UX/API gap | UX 먼저, API는 후속 |
| 일정 | 월간/목록과 딜 연결이 된다. 주간 보고서가 있다. | CRUD와 월간/목록 구현, week route redirect | 주간 보고서/PDF/Excel 없음 | Feature gap | 후속 |
| 회의록 | 직접 작성, AI/STT, 딜 활동 연결, 후속 행동 추출이 된다. | 직접/AI/STT draft와 딜 연결 구현 | next/latest summary, provider log, transcript 정책 없음 | Feature/Ops gap | 후속 |
| 명함 스캔 | 모바일 현장 촬영, OCR, 다국가 연락처 검증까지 자연스럽다. | 이미지 업로드 OCR 구현 | 카메라 UX, 다국가 전화번호, provider failure contract 부족 | Feature/Ops gap | 후속 |
| Import | 업로드 중단/새로고침/배포에도 이어받는다. | ImportJob DB persistence/resume 구현 완료 | Live Supabase 수동 QA와 장기 운영 cleanup은 운영 확인 단계 | Closed for NBA-006 | 완료 |
| Search | 빠르고 안전하며 다른 사용자 데이터가 섞이지 않는다. | 구현 및 보안 QA 완료 | 고급 필터/정렬은 후속 | UX/UI productization | 낮음 |
| Trash | 7일 이내 복구와 만료 후 정책이 명확하다. | 7일 이내 복구 구현 | 7일 이후 정책, private memo backend restriction 후보 | Ops/security gap | 후속 |
| Export | 도메인별 export와 민감 export 정책이 안전하다. | 도메인별 xlsx 구현 | 민감 export, 대량/비동기 export 정책 없음 | Ops/security gap | 후속 |
| Notification | 다음 행동/일정/딜 지연 reminder가 온다. | 일정/딜 reminder, 앱 안 알림, email/browser push delivery attempt, `/app/notifications` 구현 | 실제 SMTP/Web Push provider smoke는 env 준비 후 운영 확인. 회의록 follow-up 알림은 후속 기능 | Closed for NBA-010 | 완료 |
| Admin 운영 | 사용자/구독/결제/민감정보/감사를 운영한다. | `/admin/api/me`만 구현, 운영 route redirect | Admin API, screen, masking, audit 필요 | First-sale global gap | 첫 판매 전 필요 |
| 결제/구독 | trial, 월/연 구독, 환불, 영수증, failed payment recovery | 구현 없음 | 결제 provider/MoR, plan, entitlement 필요 | First-sale global gap | 첫 판매 전 필요 |
| 세금/컴플라이언스 | VAT/GST, 환불, chargeback, 국가별 약관 | 구현 없음 | 글로벌 판매 운영 계층 필요 | First-sale global gap | 첫 판매 전 필요 |
| `/app` 다국어 | 판매 시장 기준 앱 내부 언어/문구 지원 | `/app` 한국어 우선 | 다국어 UX writing, 국가별 표시 필요 | First-sale global gap | 첫 판매 전 필요 |
| 다국가 데이터 모델 | 전화번호, 통화, 날짜/주소가 국가별로 자연스럽다. | 한국 휴대폰 형식 중심 | 다국가 phone/currency/address model 필요 | First-sale global gap | 첫 판매 전 필요 |
| 제품 분석 | activation, retention, paid conversion, churn, AI cost를 본다. | 정본 없음 | event taxonomy, analytics pipeline 필요 | First-sale global gap | 첫 판매 전 필요 |
| AI next action | 딜 리스크, follow-up, 다음 행동을 추천한다. | 회의록 AI/STT draft만 있음 | AI가 핵심 영업 판단으로 확장되지 않음 | Series A gap | 후속 |
| 모바일 앱/PWA | 현장 입력, 카메라, 음성, push reminder가 자연스럽다. | 모바일 브라우저 Web과 browser push UX 구현 | native 앱/PWA 패키징, 모바일 카메라/음성 최적화는 후속 | Series A gap | 후순위 |

## 3. 당장 판단해야 할 질문

| 질문 | 답을 정해야 하는 이유 |
|---|---|
| Global B2C 첫 판매 국가를 어디로 볼지 | 언어, 결제, 세금, 약관, 전화번호/통화/날짜 기준이 달라진다. |
| 첫 판매를 Stripe 직접 결제로 할지, Merchant of Record로 할지 | 세금/환불/인보이스/Admin 범위가 크게 달라진다. |
| MVP를 내부 검증으로만 둘 때 어떤 품질 gate를 통과해야 Global B2C 계획으로 넘어갈지 | 화면 QA와 Backend 운영 gate의 범위가 달라진다. |
| User Web의 최우선 화면이 `/app` 홈인지 `/app/deals`인지 | UX polish와 API summary 우선순위가 달라진다. |
| 딜 목록에서 제품/최근 활동/다음 행동을 얼마나 1급 정보로 볼지 | `NBA-001`, `NBA-003`, `NBA-008` 필요성이 달라진다. |
| ImportJob 유실이 Global B2C 첫 판매 blocker인지 known limitation인지 | 완료 처리됨. `NBA-006`은 `01_IMPORT_JOB_PERSISTENCE`에서 구현 및 QA closeout 완료. |
| Notification 실제 provider smoke와 회의록 follow-up 알림을 언제 다룰지 | 일정/딜 reminder는 완료됐고, 실제 SMTP/Web Push env 검증과 회의록 follow-up은 운영/후속 범위로 남는다. |
| Admin 운영을 결제 전에 어느 수준까지 구현할지 | 유료 고객 지원/민감정보 정책 범위가 달라진다. |

## 4. 권장 다음 큰 방향

1. User Web 화면별 제품화 gap을 실제 화면 기준으로 다시 확인한다.
2. MVP를 판매 버전이 아니라 Global B2C 첫 판매 gate로 가기 위한 내부 품질 기준으로 고정한다.
3. 결제, Admin, 정책, 앱 다국어, 다국가 데이터, 제품 분석을 Global B2C 첫 판매 필수 bundle로 따로 계획한다.
4. API/DB 후보는 UX/UI와 첫 판매 운영 필요성으로 확인된 것만 `confirmed` 계약으로 승격한다.
