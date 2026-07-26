# Decision Log

상태: Confirmed
확정일: 2026-07-26

## 1. 사용자 결정

| 항목 | 결정 |
|---|---|
| 최상위 목표 | Global B2C에서 실제 판매 가능한 제품을 만든다. 기능은 구매 이유와 연결되어야 한다. |
| UX/UI 기준 | `AGENT/UXUI_AGENT`를 따른다. Notion식 작업공간 UX와 Attio식 CRM record 관계 UX를 참고한다. |
| Software 기준 | `AGENT/SOFTWARE_AGENT`를 따른다. API/DB/BE/FE 계약, transaction, observability, 주석 규칙을 지킨다. |
| AI/STT log | 기존 공통 `AiProviderCallLog`를 확장한다. 회의록 전용 log table은 만들지 않는다. |
| STT transcript | 기본 저장하지 않는다. 사용자 확인 전 임시 표시만 허용한다. |
| raw/prompt | provider raw response, prompt 원문, 회의록 원문, transcript 원문은 저장하지 않는다. |
| next action | AI가 후보만 만들고 사용자가 확인한 뒤 저장한다. |
| follow-up | AI가 초안만 만들고 사용자가 확인/수정/복사한다. 자동 발송하지 않는다. |
| follow-up 초안 저장 | subject/body를 DB에 저장하지 않고 response로만 반환한다. |
| 사용자 실패 메시지 | safe message와 retryable만 제공한다. provider detail은 숨긴다. |
| AI data cleanup | 07 1차에서 제외하고 후속 후보로 남긴다. |
| MeetingNote 목록 summary | 07 1차에서 제외하고 후속 후보로 남긴다. |
| Admin 조회 | 07에서 제외하고 11 Admin Operation에서 다룬다. |

## 2. 07 제품 판단

07은 provider log 자체가 구매 기능이 아니다. 구매 가치는 회의 직후 다음 행동과 후속 연락을 빠르게 만드는 데 있다.

따라서 07 1차는 다음 순서로 판단한다.

1. AI/STT provider log로 유료 제품 운영 안정성을 만든다.
2. 안전한 실패 UX로 사용자가 업무를 멈추지 않게 한다.
3. next action 후보로 회의 후 행동 누락을 줄인다.
4. follow-up 초안으로 고객 연락 시간을 줄인다.

## 3. 후속으로 남긴 결정

| 항목 | 후속 위치 |
|---|---|
| AI data cleanup 제안 저장/적용 | 09 Product Analytics 또는 별도 data quality 계획 |
| MeetingNote 목록 latest/next summary | 07 후속 또는 06 record summary 후속 |
| Admin provider failure 조회 | 11 Admin Operation |
| transcript 장기 저장 예외 | 11 Trust/policy 또는 별도 개인정보/retention 결정 |
| follow-up 자동 발송/예약 | 05 Follow-up Delivery 후속 |
