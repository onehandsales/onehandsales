# Decision Log

상태: Confirmed
확정일: 2026-07-25
최종 업데이트: 2026-08-06

## 1. 제품 방향

| 결정 | 확정 내용 |
|---|---|
| 목표 시장 | Global B2C를 기준으로 한다. |
| UX 기준 | Notion처럼 깔끔한 record/detail page와 Attio처럼 CRM activity/linked record가 드러나는 구조를 따른다. |
| 구현 전략 | 기능 구현을 먼저 진행하고, 전체 UX/UI polish는 후속으로 고도화한다. 단 first-sale에 필요한 업무 흐름은 1차부터 깨지지 않게 만든다. |
| 실행 방식 | 06 전체 목표를 지금 문서화하되, 구현은 `/goal` 단위로 나눠 순차 진행한다. |

## 2. 06 범위 결정

| 결정 | 확정 내용 | 이유 |
|---|---|---|
| 06 핵심 | `DealActivity` 정본과 딜 상세 timeline을 만든다. | 딜 진행 맥락이 흩어져 있으면 CRM 반복 사용 가치가 약하다. |
| 자동 activity | 딜 생성, 단계 변경, 다음 행동, 일정 연결/해제, 회의록 연결/해제, follow-up 발송 성공/실패를 포함한다. | 사용자가 따로 기록하지 않아도 핵심 영업 흐름이 남아야 한다. |
| 수동 activity 생성 | 포함한다. | 통화, 미팅, 이메일, 방문 같은 실제 영업 접점을 기록할 수 있어야 한다. |
| 수동 activity 수정 | 포함한다. | 사용자가 직접 남긴 기록은 오타/시간/내용 보정이 필요하다. |
| 수동 activity 삭제 | 1차에서 제외한다. | 삭제/복구/retention/audit 정책과 묶어 Trust 기준으로 따로 결정하는 편이 낫다. |
| 자동 activity 수정/삭제 | 제외한다. | 시스템 이력 정합성을 지킨다. |
| 메모 timeline 통합 | 후속으로 둔다. | private memo와 민감정보 노출 정책을 먼저 확정해야 한다. |
| 목록 summary | DealActivity 정본 뒤 G05/G06에서 구현한다. | API 정본 없이 FE에서 꾸미면 Global B2C 품질 기준에 맞지 않는다. |
| 상위 backlog 승격 | `NBA-001`, `NBA-002`, `NBA-008`, `NBA-014`와 `NBA-003`의 Deal latest activity subset만 06으로 승격한다. | 원본 가이드의 "바로 구현 금지" 상태를 06의 confirmed 계약과 `/goal` 순서로 해소한다. |
| first-sale global bundle | Admin 운영, 결제/구독/세금, 앱 내부 다국어, 다국가 데이터 모델, 제품 분석은 06에서 구현하지 않는다. | DealActivity와 record summary의 구현 범위를 넘는 별도 큰 계획이다. |

## 3. Goal 분할 결정

| Goal | 결정 |
|---|---|
| G01 | 구현 전 현재 코드와 API/DB/FE 계약을 다시 대조한다. |
| G02 | `DealActivity` DB/Prisma/migration만 처리한다. |
| G03 | timeline API와 자동/수동 activity Backend를 처리한다. |
| G04 | 딜 상세 timeline User Web을 처리한다. |
| G05 | Deal/Contact list summary Backend를 처리한다. |
| G06 | Deal/Contact list summary User Web을 처리한다. |
| G07 | QA, review, closeout만 처리한다. |

## 4. 주석/문서화 결정

- 실제 코드를 작성할 때 Backend class/interface/method/function에는 `AGENT/SOFTWARE_AGENT` 규칙에 맞춰 한글 주석을 남긴다.
- Controller method는 `// API : ...`, 내부 함수는 `// 기능 : ...`, class/interface는 `// 역할 : ...` 형태를 따른다.
- 복잡한 application orchestration에는 필요한 경우 번호가 있는 한글 주석을 둔다.
- UI 표시 문구는 `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`의 톤을 따른다.

## 5. 2026-08-06 후속 재검토 결정

사용자 결정 A에 따라 06 완료 의미를 유지한다.

| 항목 | 결정 | 이유 |
|---|---|---|
| 06 재오픈 | 하지 않는다. | `DealActivity`, 딜 상세 timeline, Deal list `products/latestActivity`, Contact list `dealCount`, page size 15 계약은 G07 기준 완료됐다. |
| Company/Contact/Product latest summary | 12 전 계약화/구현하지 않는다. | Global B2C first-sale 필수 blocker로 확정되지 않았고, B2B/team CRM에서 더 강한 가치가 있는 후보로 본다. |
| generic summary endpoint | 12 전 만들지 않는다. | 현재 first-sale 개인 영업자 흐름에서는 Deal 중심 activity 정본이 우선이고, 범용 record summary는 API/DB/정책 영향이 크다. |
| record별 상세 activity timeline | 12 전 만들지 않는다. | Company/Contact/Product별 timeline은 Attio식 최종 방향에는 맞지만 팀 CRM/고급 CRM 성격이 강하다. |
| UX/UI polish | 지금 06 후속으로 하지 않는다. | UX/UI는 12와 post-12 재검토 이후 별도 전면 유지보수 계획에서 한 번에 다룬다. |

이 결정은 잔여 후보를 삭제한다는 뜻이 아니다. `PRE12_FOLLOWUP_RECHECK`와 post-12 재검토에서 근거만 보존하고, 새 TODO 승격 여부는 12 완료 후 다시 판단한다.
