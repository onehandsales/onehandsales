# Final Service Shape

상태: Draft Guide

## 1. 최종 서비스는 3단계로 보되 판매 기준은 Global B2C다

| 단계 | 이름 | 의미 |
|---|---|---|
| 1 | 비판매 MVP / 내부 품질 기준 | 현재 핵심 영업 업무 기능이 실제 사용자 환경에서 안정적으로 동작하는지 확인하는 상태. 이 단계에서는 판매하지 않는다. |
| 2 | Global B2C 첫 판매 가능형 | 돈을 받고 운영할 수 있는 결제/운영/현지화/신뢰 계층이 갖춰진 첫 판매 제품 상태. 상세 기준은 `GLOBAL-B2C-FIRST-SALE-GATE.md`를 따른다. |
| 3 | Series A급 제품/사업형 | 리텐션, 반복 매출, AI 차별화, 운영 신뢰가 지표로 증명되는 상태 |

## 2. 비판매 MVP / 내부 품질 기준

MVP는 판매 버전이 아니다. 이 단계의 목적은 개인 영업자의 핵심 업무 루프가 깨지지 않고 작동하는지 검증하고, Global B2C 첫 판매 gate에 들어갈 gap을 선명하게 분리하는 것이다.

| 영역 | 최종적으로 필요한 상태 |
|---|---|
| 핵심 업무 | 회사, 담당자, 제품, 딜, 일정, 주간 일정 보고서, 회의록, 명함 OCR, Import, Search, Trash, Export를 한 사람의 영업 루프로 사용할 수 있다. |
| UX/UI | Notion식 workspace/page/database/detail 문법과 Attio식 CRM linked record 맥락이 살아 있다. |
| 홈 | 오늘 일정, 진행 딜, 다음 행동, 최근 회의록이 바로 읽힌다. |
| 딜 | 단계, 금액, 회사/담당자/제품, 다음 행동, 마감일이 목록에서 빠르게 비교된다. |
| 목록 | desktop은 업무용 record table 밀도, mobile은 card/list로 핵심 정보를 잃지 않는다. |
| 상세 | 속성, linked record, 메모, 일정/회의록, 활동 맥락이 분명하다. |
| 모바일 브라우저 | 390px/360px에서 핵심 생성/수정/조회/복구/업로드 흐름이 깨지지 않는다. |
| 브라우저 | Chrome/Edge에서 reload, history, multi-tab, slow network 상태가 안정적이다. |
| 보안 | 다른 사용자 데이터가 Search, Trash, Export, 직접 API 접근에서 섞이지 않는다. |
| DB/운영 | Prisma generate, migration status, seed 정책, DB target이 배포 전 판단 가능하다. |

## 3. Global B2C 첫 판매 가능형

이 단계가 실제 판매 기준선이다. 가격을 공개하고 결제를 받으려면 아래 계층이 최소한으로 연결되어야 한다.

| 영역 | 최종적으로 필요한 상태 |
|---|---|
| 가격/플랜 | 판매 국가, 가격표, trial 여부, 무료/유료 제한, paywall 기준이 명확하다. |
| 결제/구독 | 무료체험, 월간/연간 구독, 국가별 가격, 환불, 결제 실패 복구, 영수증/인보이스가 있다. |
| 세금/컴플라이언스 | VAT/GST/판매세 또는 Merchant of Record 처리가 가능하다. |
| 앱 내부 다국어 | 실제 판매 국가 기준으로 `/app` 내부 locale과 UX writing이 준비된다. |
| 다국가 데이터 | 전화번호, 날짜/시간, 통화, 주소/지역 표시가 국가별로 자연스럽다. |
| Admin 운영 | 사용자, 구독, 결제 이슈, 도메인 데이터, 민감정보 마스킹, 감사 로그를 운영할 수 있다. |
| 고객 신뢰 | 약관, 개인정보, 보안, 계정 삭제, 데이터 export, 환불 정책이 실제 판매 범위와 맞는다. |
| 제품 분석 | activation, retention, paid conversion, churn, ARPU, LTV/CAC, AI cost/user를 추적한다. |
| 지원/운영 | 결제 실패, 로그인 문제, OCR/STT provider 실패, 데이터 복구 요청을 운영자가 처리할 수 있다. |

## 4. Series A급 제품/사업형

| 영역 | 최종적으로 필요한 상태 |
|---|---|
| 리텐션 | 다음 행동, 일정, 회의록 follow-up, 딜 지연, AI/고급 주간 리포트가 사용자를 다시 부른다. 기본 주간 일정 보고서는 구현 완료 상태로 본다. |
| AI 핵심 가치 | 회의록 요약을 넘어 딜 리스크, 다음 행동, follow-up 문구, 영업 리포트를 제안한다. |
| 모바일 현장성 | 모바일 브라우저 또는 앱에서 명함 촬영, 음성 기록, 빠른 입력, push reminder가 자연스럽다. |
| Deal timeline | 일정, 회의록, 메모, 다음 행동, 단계 변경이 하나의 영업 활동 흐름으로 연결된다. |
| 성장 실험 | trial, annual plan, AI plan, paywall, coupon/referral, churn survey를 운영한다. |
| 운영 신뢰 | Admin, 감사 로그, 민감정보 원문 조회 사유, 장애/provider 상태 기록이 유료 고객을 감당한다. |

## 5. 최종 형태 판단 원칙

- MVP 완료를 판매 가능으로 해석하지 않는다. 판매 기준은 Global B2C 첫 판매 gate다.
- 새 기능을 추가하는 것보다 먼저, 현재 핵심 루프가 Global B2C 유료 사용자에게 충분히 읽히고 안정적인지 본다.
- Backend/API 후보는 화면에서 필요한 정보 구조와 Global B2C 운영 필요성이 확정된 뒤 계약화한다.
- Series A급 기능은 기능 단독으로 만들지 않고 retention, revenue, analytics와 같이 판단한다.
- Admin/결제/분석/정책/현지화는 후순위 장식이 아니라 첫 판매 gate의 일부로 본다.
