# Sales CRM External Market Research

작성일: 2026-07-27
범위: 외부 CRM/영업관리 제품과 공개 사용자/시장 문서를 기준으로, 영업자가 실제로 돈을 내고 기대하는 기능을 빠르게 정리한다.

## 0. 결론

지금까지의 `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN` 01~07은 시장에서 팔리는 CRM의 핵심 축과 꽤 잘 맞는다. 특히 record 관리, 딜 중심 pipeline, 일정/알림, import 안정성, Google Calendar read-only, DealActivity timeline, MeetingNote AI 후속 작업은 실제 CRM 시장의 주요 구매 이유와 겹친다.

하지만 외부 시장 기준으로 보면 CRM은 단순히 "기록할 수 있음"으로 팔리지 않는다. 판매되는 CRM은 대체로 아래 약속을 판다.

- 입력을 줄여준다.
- 후속 조치를 놓치지 않게 한다.
- 연락처/딜/일정/이메일/회의록 맥락을 한 화면에서 이어준다.
- 모바일 현장에서 바로 기록할 수 있다.
- 영업 성과와 pipeline 상태를 볼 수 있다.
- 결제/운영/보안/지원이 신뢰 가능하다.

따라서 01~07의 제외 항목을 전부 구현해야 UXUI로 갈 수 있는 것은 아니다. 다만 UXUI 제품화 단계에서 반드시 다시 판정해야 하는 항목은 있다. 특히 "다음 행동/follow-up을 놓치지 않게 하는가", "모바일에서 빠르게 기록되는가", "기록한 데이터가 다시 쓸모 있게 돌아오는가"는 외부 시장 신호상 중요하다.

## 1. 조사 소스

공식 제품/가격/기능 페이지:

- Pipedrive pricing/features: https://www.pipedrive.com/en/pricing
- HubSpot Sales Hub: https://www.hubspot.com/products/sales
- Attio pricing/features: https://attio.com/pricing
- folk official site: https://www.folk.app/
- Zoho CRM pricing/features: https://www.zoho.com/crm/zohocrm-pricing.html
- Salesforce KR SFA guide: https://www.salesforce.com/kr/blog/sfa/

시장/리뷰/문제 인식 참고:

- G2 CRM category: https://www.g2.com/categories/crm
- Salesmap Korea CRM comparison/article: https://salesmap.kr/blog/top-7-crm-2024-korea
- Clari article on CRM adoption/data entry pain: https://www.clari.com/blog/why-sales-reps-hate-using-crm/
- Reddit CRM discussion, anecdotal only: https://www.reddit.com/r/CRM/comments/1qgx475/am_i_solving_a_real_problem_or_wasting_my_time/

주의:

- 이 문서는 desk research다. 실제 onehand.sales 타깃인 30~50대 개인 영업자 인터뷰, 결제 테스트, 사용성 테스트를 대체하지 않는다.
- vendor 글은 자기 제품을 좋게 보이게 하는 편향이 있다. 따라서 "공통적으로 반복되는 기능/불만"만 신호로 본다.

## 1.1 초기 페르소나 가설

이 섹션은 확정 페르소나가 아니라, onehand.sales가 먼저 검증해야 할 사용자 가설이다. 공통 기준은 "혼자 또는 작은 팀으로 고객을 직접 만나고, 엑셀/메모/캘린더/메신저에 흩어진 영업 기록을 다시 찾기 힘든 사람"이다.

### Primary Persona A: 개인 현장 영업자

대표 업종:

- 보험 설계사, 금융상품 상담사
- 자동차 영업자
- 의료기기, 제약, B2B 소모품 영업자
- 인테리어, 리모델링, 건설/설비 수주 영업자
- 교육, 프랜차이즈, 광고/마케팅 대행 영업자

특징:

- 30~50대 개인 영업자 또는 소규모 팀의 실무자다.
- 고객, 담당자, 미팅, 견적, 다음 행동을 직접 관리한다.
- 하루 업무가 전화, 문자, 카카오톡/LINE, 미팅, 일정, 명함, 메모로 흩어진다.
- CRM을 쓰더라도 입력이 귀찮으면 금방 엑셀/메모장/캘린더로 돌아간다.
- "나중에 연락해야 하는 사람"을 놓치지 않는 것이 가장 큰 가치다.

onehand.sales가 이 사람에게 팔아야 하는 약속:

- 회의 직후 30초 안에 다음 행동이 남는다.
- 명함, 메모, 일정, 회의록이 딜과 연결된다.
- 오늘 볼 고객과 놓친 follow-up이 바로 보인다.
- 복잡한 팀 CRM이 아니라 혼자 써도 부담이 없다.
- 모바일에서 기록하고 데스크톱에서 정리할 수 있다.

### Primary Persona B: 부동산 중개/분양/임대 영업자

대표 업종:

- 공인중개사
- 분양 상담사
- 임대/상가/오피스 중개 영업자
- 부동산 투자 상담/매물 영업자

특징:

- 고객, 매물, 일정, 상담 이력이 빠르게 쌓인다.
- 고객 한 명이 여러 매물에 관심을 가지거나, 한 매물에 여러 고객이 붙는다.
- 현장 방문, 전화 follow-up, 계약 가능성, 재문의 시점이 중요하다.
- 카카오톡/문자/전화 중심으로 커뮤니케이션하고, CRM 입력을 길게 하지 않는다.
- "이 고객이 어떤 매물을 봤고 다음에 뭘 해야 하는지"가 바로 보여야 한다.

onehand.sales에 주는 의미:

- 현재 Product는 부동산에서는 "제품"보다 "매물/상품"에 가까운 추상 record로 해석될 수 있다.
- Deal은 "계약 가능 건" 또는 "상담/거래 후보"로 맞출 수 있다.
- 일정, 회의록, follow-up, activity timeline은 부동산 영업과 잘 맞는다.
- 다만 부동산 최적화를 깊게 하려면 매물 주소/가격/면적/거래 유형 같은 별도 도메인 필드가 필요하다. 이것은 초기에 바로 만들기보다 UXUI/시장 검증 후 결정한다.

### Primary Persona C: 반복 고객을 관리하는 서비스형 영업자

대표 업종:

- 세무/노무/법무/컨설팅 상담 영업
- B2B SaaS 또는 대행 서비스 영업
- 학원/교육 상담, 고가 서비스 상담
- 웨딩/행사/여행/프리미엄 서비스 상담

특징:

- 계약 전 상담이 여러 번 이어진다.
- 회의록, 견적, 다음 연락일, 의사결정자, 예산, 니즈가 중요하다.
- 고객 수가 늘면 "누가 어디까지 이야기했는지" 기억이 안 난다.
- 큰 팀 CRM보다 개인 업무 도구에 가까운 CRM을 원할 수 있다.

onehand.sales에 주는 의미:

- MeetingNote AI, DealActivity timeline, 다음 행동, 주간 리포트는 이 페르소나에 잘 맞는다.
- 견적서/계약서/파일 관리까지 가면 범위가 커진다. 첫 판매 전에는 "기록과 follow-up" 중심으로 제한한다.

### Secondary Persona: 팀장/소규모 영업 관리자

특징:

- 본인이 직접 영업도 하면서 팀원 2~10명의 진행 상황을 본다.
- pipeline, 활동량, 미응답 고객, 지연 딜, 매출 forecast를 원한다.
- Admin/analytics/reporting 요구가 강하다.

현재 판단:

- onehand.sales의 1차는 개인 영업자 B2C다.
- 팀 관리자 기능은 매력적이지만 권한, 조직, 팀 billing, audit, reporting 범위가 커진다.
- 11 Admin, 12 Billing 이후 지표를 보고 B2B/team 확장으로 판단한다.

### 초기에 피해야 할 페르소나

- 대기업 영업조직 전체 CRM 교체 수요
- 콜센터/텔레마케팅 대량 발신 조직
- 재고/주문/배송이 중심인 유통 ERP 수요
- 복잡한 견적/계약/전자서명 workflow가 먼저 필요한 기업
- marketing automation/campaign이 핵심인 조직

이들은 CRM 시장에는 존재하지만, onehand.sales의 초기 개인 영업자 B2C 포지션과 다르다. 초기에 이쪽 요구를 따라가면 제품이 무거워지고 UXUI 판단이 흐려진다.

### 페르소나별 우선 기능 신호

| 페르소나 | 가장 중요한 기능 | UXUI에서 확인할 질문 |
|---|---|---|
| 개인 현장 영업자 | 다음 행동, 일정, 회의 메모, 명함, 모바일 기록 | 30초 안에 기록하고 다시 찾을 수 있는가? |
| 부동산 중개/분양 | 고객-매물-상담-일정-follow-up 연결 | "이 고객이 어떤 매물을 봤는지"가 바로 보이는가? |
| 서비스형 영업자 | 회의록, 견적 전 단계, 의사결정 맥락, follow-up | 여러 번의 상담 흐름이 끊기지 않는가? |
| 소규모 팀장 | pipeline, 지연 딜, 활동량, 팀 상태 | 개인 도구를 넘어서 팀 관리가 필요한 증거가 있는가? |

현재 추천:

- 08~12까지는 개인 영업자 B2C를 기준으로 유지한다.
- 부동산은 강한 후보 페르소나로 보되, 매물 전용 도메인 모델은 바로 만들지 않는다.
- UXUI 제품화 단계에서 부동산/보험/자동차/서비스형 영업 화면 시나리오를 각각 1개씩 만들어 실제 흐름을 검증한다.

## 2. 외부 제품들이 실제로 파는 기능

### 2.1 기본 유료/무료 진입 기능

Pipedrive, HubSpot, Zoho 같은 범용 CRM의 기본 진입 기능은 대체로 비슷하다.

- contacts/leads/deals 관리
- pipeline/stage 관리
- tasks/calls/meetings/activity 관리
- calendar 또는 meeting scheduling
- import/export
- reports
- mobile app
- integrations

Pipedrive는 Lite plan에서도 leads, deals, contacts, calendar events, pipeline, reports, follow-up tracking, spreadsheet/CRM import, integrations를 묶어서 판다. Growth 이상에서는 Gmail/Outlook sync, email tracking, email/follow-up automation, meeting scheduler, contacts timeline, forecast 같은 기능을 붙인다.

HubSpot은 Free에서 deal tracking, live chat, meeting scheduling을 제공하고, Starter부터 personalized outreach automation과 payment, Professional부터 AI forecasting과 automated follow-up을 강조한다.

Zoho는 tasks/meetings/calls, import/export, reports, API, mobile app을 기본 판매 포인트로 둔다.

시장 해석:

- "회사/담당자/딜/일정/회의록 기록"은 기본이다.
- 돈을 받기 시작하는 지점은 "follow-up 자동화", "email/calendar 통합", "report/forecast", "mobile", "결제/구독/권한" 쪽으로 올라간다.

## 3. 영업자가 반복해서 원하는 것

### 3.1 적게 입력하고 빨리 남기는 것

외부 CRM 불만에서 가장 반복되는 것은 manual data entry다. Clari는 영업 담당자가 CRM 입력과 여러 도구 간 record 연결에 시간을 빼앗긴다는 문제를 CRM adoption의 핵심 pain으로 다룬다.

한국어 자료에서도 비슷한 신호가 있다. 세일즈맵 글은 엑셀 고객 관리가 고객 수와 팀 규모가 늘수록 한계에 부딪힌다는 문제를 다룬다. 콜라보 글은 영업 담당자가 꼼꼼한 활동 기록을 힘들어하고, 기록을 해도 다시 볼 일이 없으면 입력 빈도가 떨어진다고 설명한다.

onehand.sales에 주는 의미:

- 회의 직후 빠른 메모, 음성/STT, 명함 촬영, AI 요약은 시장 니즈와 맞다.
- 반대로 필드가 많고 저장까지 오래 걸리면 CRM adoption을 망친다.
- UXUI 단계에서 모든 화면은 "최소 입력으로 다음 행동이 남는가"를 기준으로 재점검해야 한다.

### 3.2 후속 조치를 놓치지 않는 것

Pipedrive는 follow-up tracking, overdue task, meeting scheduler, contacts timeline을 전면에 둔다. HubSpot과 folk도 automated follow-up, follow-up assistant, next-step suggestion을 강조한다.

folk는 email/WhatsApp conversation을 분석해 follow-up timing과 draft를 제안하는 흐름을 전면 기능으로 판다. 이건 "기록"보다 "다음 액션을 놓치지 않게 해주는 assistant" 쪽에 가깝다.

onehand.sales에 주는 의미:

- 02의 일정/딜 reminder, 05/07의 follow-up draft, 06의 DealActivity timeline은 방향이 맞다.
- 01~07 제외 항목 중 "다음 행동 알림"과 "회의록 follow-up 알림"은 UXUI 제품화 단계에서 다시 강하게 검토해야 한다.
- 단, 자동 발송/캠페인/마케팅 automation까지 바로 갈 필요는 없다. 개인 영업자에게는 "확인 후 보냄"이 더 안전하다.

### 3.3 한 화면에서 맥락을 이어 보는 것

Salesforce의 SFA 설명은 안건 상태, 상담 정체, 계약 확률, 단계별 액션, 활동 관리가 중요하다고 설명한다. Pipedrive는 pipeline, contacts timeline, email/calendar integration을 묶고, Attio는 email/calendar sync와 records 위의 email visibility를 제공한다.

onehand.sales에 주는 의미:

- DealActivity timeline은 외부 시장 방향과 잘 맞는다.
- 딜 상세에서 회사/담당자/제품/일정/회의록/follow-up/다음 행동이 끊기지 않게 보여야 한다.
- Company/Contact/Product latest summary는 모든 도메인에 꼭 당장 필요하진 않지만, UXUI에서 "목록에서 판단이 안 된다"는 문제가 나오면 다시 API 후보로 승격할 수 있다.

### 3.4 모바일 현장 입력

Zoho는 mobile app을 판매 포인트로 둔다. Salesforce SFA 설명도 영업 활동은 한정된 시간 안에서 고객 커뮤니케이션을 놓치지 않는 것이 중요하다고 본다. field sales는 데스크톱보다 모바일 기록과 push reminder가 중요하다는 시장 신호가 많다.

onehand.sales에 주는 의미:

- 10 Mobile/PWA는 장식이 아니라 개인 영업자에게 중요할 수 있다.
- 특히 명함 촬영, 회의 직후 음성 기록, local draft, 권한 거부 fallback은 실제 현장 UX에 가깝다.
- native app은 아직 후순위여도 되지만, mobile web/PWA polish는 UXUI 전후로 강하게 봐야 한다.

### 3.5 분석과 pipeline visibility

HubSpot은 sales analytics/reporting, forecasting, activity tracking, revenue tracking을 강조한다. Salesforce/Zoho도 forecast, performance, reports를 주요 기능으로 둔다.

onehand.sales에 주는 의미:

- 09 Product Analytics는 내부 운영용만이 아니라, product-market fit 판단용으로 필요하다.
- 개인 영업자 화면에도 "이번 주 놓친 것", "진행 중인 딜", "다음 행동 없는 딜", "오래 멈춘 딜" 같은 가벼운 분석은 가치가 있을 수 있다.
- 관리자용 BI dashboard 전체는 지금 당장 필요 없지만, activation/retention/follow-up success는 반드시 측정해야 한다.

## 4. onehand.sales 01~07과 외부 시장의 정합성

### 이미 시장 방향과 맞는 것

- 01 ImportJob persistence/resume: 엑셀/스프레드시트에서 CRM으로 옮기는 pain을 줄인다.
- 02 Notification: 영업자가 follow-up을 놓치지 않게 하는 기본 루프와 맞다.
- 03 Weekly Schedule Report: 한 주 영업 행동을 정리해주는 retention/reporting 가치가 있다.
- 04 Google Calendar read-only import: 일정/CRM 분리를 줄이는 방향과 맞다.
- 05 AI weekly report/follow-up delivery: AI assistant, follow-up draft, sales summary 시장 방향과 맞다.
- 06 DealActivity timeline: record context, timeline, pipeline visibility와 맞다.
- 07 MeetingNote AI next action/follow-up draft: 회의 후 입력 부담과 다음 행동 누락을 줄이는 방향과 맞다.

### 01~07 중 UXUI 전에 다시 봐야 하는 항목

아래는 "전부 구현"이 아니라, UXUI 제품화 QA에서 실제로 막히는지 확인해야 하는 항목이다.

1. 다음 행동 알림
   - 외부 시장에서 follow-up reminder는 강한 반복 신호다.
   - 02에서 제외됐지만, 06/07 이후 데이터 구조가 잡혔으므로 다시 판단 가능하다.

2. 회의록 follow-up 알림
   - 07은 draft까지만 구현했다.
   - 영업자는 "초안을 만들었지만 안 보냈다"보다 "보내야 할 시점에 알려준다"를 원할 가능성이 높다.

3. 명함 OCR 모바일 촬영 UX
   - 업로드만으로는 현장 영업 사용성과 거리가 있다.
   - 10에서 다루되 UXUI 관점에서는 꽤 중요하다.

4. provider failure 사용자 UX
   - AI/OCR/STT/Calendar 실패 시 "왜 안 되는지, 다음에 뭘 해야 하는지"가 안전하게 보여야 한다.
   - Admin provider audit 전체는 11이지만, 사용자 실패 메시지는 제품화 품질에 직접 영향이 있다.

5. Company/Contact/Product latest summary
   - Deal은 06에서 많이 보강됐다.
   - 나머지 record 목록은 UXUI에서 "목록에서 판단이 안 된다"면 다시 API/DB 후보로 승격한다.

6. Export/Trash private data 정책
   - 판매 제품에서는 민감정보/삭제/복구/보관 정책이 신뢰와 직결된다.
   - 범용 ExportJob 전체보다 먼저, private memo와 민감 export 정책을 확정해야 한다.

7. 실제 provider smoke
   - SMTP/Web Push/Google/OpenAI 계열은 env 준비 후 실제 동작 확인이 필요하다.
   - 이건 UXUI polish 이전의 운영 신뢰 gate에 가깝다.

### 01~07 중 당장 최종 구현하지 않아도 되는 항목

외부 시장에는 존재하지만, onehand.sales 첫 판매 전에 모두 만들 필요는 낮다.

- Google Calendar 양방향 sync/write/export
- Google webhook/watch
- 반복 일정 정식 모델
- PDF export
- 범용 ExportJob과 대용량 background worker
- 모든 도메인 공통 activity bus
- activity 삭제/복구/audit 전체 체계
- AI 자동 일정 생성/딜 변경
- 자동 follow-up 발송
- campaign/bulk marketing 발송
- native push/native app
- transcript 장기 저장

이 항목들은 최종형 또는 Series A급 확장으로 둘 수 있다. UXUI 단계에서 사용자가 실제로 막히는 증거가 나오면 그때 승격한다.

## 5. 08 이후 추천 기준

현재 다음 작업은 08 Global Data I18N이 맞다. 외부 시장 기준으로도 글로벌 판매를 하려면 app 내부 언어, 날짜/시간, 통화, 전화번호, 주소, auth provider가 자연스러워야 한다.

다만 08 이후에는 아래 필터를 추가한다.

1. "영업자가 입력을 덜 하게 하는가?"
2. "다음 행동을 놓치지 않게 하는가?"
3. "딜/담당자/회사/일정/회의록 맥락이 한 흐름으로 이어지는가?"
4. "모바일 현장에서 바로 쓸 수 있는가?"
5. "돈을 받고 운영할 만큼 billing/admin/trust가 준비됐는가?"
6. "측정할 수 있는가?"

이 필터에 통과하지 못하는 01~07 후속 항목은 최종형 욕심으로 바로 만들지 않는다.

## 6. UXUI 단계로 넘어가기 전 최소 체크

UXUI로 넘어가기 전에 모든 후속 기능을 구현할 필요는 없다. 대신 아래 판단은 필요하다.

- 다음 행동/회의록 follow-up 알림을 첫 판매 전 구현할지, known limitation으로 둘지 결정한다.
- 명함 OCR 모바일 촬영 UX를 10에서 반드시 다룰지 결정한다.
- Company/Contact/Product latest summary가 UXUI 첫 판매 gate에 필요한지 화면 기준으로 본다.
- Trash private memo와 export 민감정보 정책은 Backend response 기준으로 닫는다.
- provider 실패 메시지와 실제 smoke 미실행 사유를 문서화한다.
- 09 analytics에서 activation, retention, paid conversion, churn, AI cost/user는 최소 측정 가능하게 만든다.

## 7. 최종 판단

01~07의 제외 항목을 다 만들고 UXUI로 가는 전략은 비효율적이다. 외부 시장 기준으로 봐도 중요한 것은 기능 개수가 아니라 판매자가 반복 업무에서 실제로 도움을 받는지다.

따라서 추천은 다음이다.

1. 08은 계획대로 진행한다.
2. 09~12는 Global B2C 첫 판매 gate 중심으로 닫는다.
3. 01~07 후속 항목은 "follow-up, mobile capture, record context, provider failure, privacy/trust" 중심만 재판정한다.
4. UXUI 제품화 QA에서 실제 사용자 흐름을 막는 항목만 기능으로 다시 승격한다.
5. 나머지는 Series A 또는 후속 확장 backlog로 둔다.
