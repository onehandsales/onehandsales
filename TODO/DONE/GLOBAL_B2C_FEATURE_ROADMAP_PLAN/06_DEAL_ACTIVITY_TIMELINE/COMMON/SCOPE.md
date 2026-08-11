# Scope

상태: Confirmed
확정일: 2026-07-25
최종 업데이트: 2026-08-06

## 1. 목적

06은 딜 중심 활동 정본을 만든다. 사용자는 딜 상세에서 단계 변화, 다음 행동, 일정, 회의록, follow-up, 수동 영업 활동을 시간순으로 읽고 다음 행동을 판단할 수 있어야 한다.

## 2. 포함 범위

상위 입력 계획 기준의 포함/제외 매핑은 `COMMON/SOURCE-PLAN-COVERAGE.md`를 따른다.

| 항목 | 확정 내용 |
|---|---|
| DealActivity 정본 | 딜 activity를 별도 model로 저장한다. |
| Timeline 조회 | `GET /api/deals/:dealId/activities`로 딜 상세 timeline을 cursor pagination 조회한다. |
| 자동 activity | 딜 생성, 단계 변경, 다음 행동 생성/완료, 일정 연결/해제, 회의록 연결/해제, follow-up 발송 성공/실패 |
| 수동 activity | 통화, 미팅, 이메일, 방문, 기타를 사용자가 직접 남긴다. |
| 수동 activity 수정 | 수동 activity의 제목/본문/발생 시각/type을 수정할 수 있다. |
| 자동 activity 보호 | 자동 activity는 사용자 수정/삭제를 허용하지 않는다. |
| Follow-up 연결 | follow-up 본문 전체가 아니라 채널, 수신자, 상태, 발송 시각, 안전한 요약만 timeline에 표시한다. |
| Deal list products summary | `GET /api/deals` item에 연결 제품 summary를 추가한다. |
| Deal latest activity summary | `GET /api/deals` item에 최신 activity summary 후보를 추가한다. |
| Contact dealCount | `GET /api/contacts` item에 active deal count를 추가한다. |
| Page size 15 cleanup | 목록 API/FE/test 문서의 15개 page 계약을 함께 정리한다. |
| NBA-003 Deal subset | `NBA-003` 중 Deal list `latestActivity`만 06 범위로 승격한다. |
| NBA-014 gate | 신규 migration 전 DB/Prisma 운영 gate를 확인한다. |
| 보안 | user ownership, soft delete 제외, private memo와 provider raw redaction을 지킨다. |
| UX | Notion식 detail page와 Attio식 CRM activity timeline 기준을 따른다. |

## 3. 1차 구현 제외

| 항목 | 이유 |
|---|---|
| 수동 activity 삭제 | 삭제/복구/retention/audit 정책과 연결되므로 후속으로 분리한다. |
| 자동 activity 수정/삭제 | 시스템 이력 정합성을 지킨다. |
| 메모 activity 통합 | 일반 메모와 private memo의 노출 정책을 먼저 확정해야 한다. |
| activity trash/restore | 11 Admin/Trust/policy와 연결해 후속으로 결정한다. |
| 모든 도메인 공통 activity bus | 1차는 Deal 중심으로 제한한다. |
| 고급 검색/필터 전체 개편 | timeline 정본 뒤 별도 goal로 확장한다. |
| 딜 가능성/확률 score | 1차 timeline과 별개로 후속 제품 결정이 필요하다. |
| AI activity 자동 판단 | 05/07 이후 AI 정책과 연결한다. |
| Admin raw activity audit | 11 Admin Operation에서 다룬다. |
| first-sale global bundle | Admin 운영, 결제/구독/세금, 앱 내부 다국어, 다국가 데이터 모델, 제품 분석은 별도 큰 계획으로 분리한다. |
| Company/Contact/Product latest summary | `NBA-003`의 나머지 record summary는 2026-08-06 A 결정에 따라 12 전 계약화/구현하지 않고 post-12 B2B/team CRM 전략 후보로 둔다. |

## 4. Activity Type

1차 enum 후보:

| Type | 의미 | source |
|---|---|---|
| `DEAL_CREATED` | 딜 생성 | 자동 |
| `STAGE_CHANGED` | 딜 단계 변경 | 자동 |
| `NEXT_ACTION_CREATED` | 다음 행동 생성 | 자동 |
| `NEXT_ACTION_COMPLETION_CHANGED` | 다음 행동 완료/미완료 변경 | 자동 |
| `SCHEDULE_LINKED` | 일정 연결 | 자동 |
| `SCHEDULE_UNLINKED` | 일정 연결 해제 | 자동 |
| `MEETING_NOTE_LINKED` | 회의록 연결 | 자동 |
| `MEETING_NOTE_UNLINKED` | 회의록 연결 해제 | 자동 |
| `FOLLOW_UP_SENT` | follow-up email/SMS 발송 성공 | 자동 |
| `FOLLOW_UP_FAILED` | follow-up email/SMS 발송 실패 | 자동 |
| `CALL` | 수동 통화 기록 | 수동 |
| `MEETING` | 수동 미팅 기록 | 수동 |
| `EMAIL` | 수동 이메일 기록 | 수동 |
| `VISIT` | 수동 방문 기록 | 수동 |
| `NOTE` | 수동 기타 기록 | 수동 |

## 5. Source 정책

| Source | 설명 |
|---|---|
| `SYSTEM` | 딜 생성, 단계 변경 같은 Backend 자동 기록 |
| `USER` | 사용자가 직접 만든 수동 activity |
| `FOLLOW_UP` | FollowUpMessage 발송 상태 기반 기록 |
| `SCHEDULE` | ScheduleDeal 연결 기반 기록 |
| `MEETING_NOTE` | MeetingNoteDeal 연결 기반 기록 |
| `NEXT_ACTION` | DealFollowingActionLog 기반 기록 |

## 6. 민감정보와 노출 제한

- private memo 원문은 activity summary에 포함하지 않는다.
- follow-up 본문 전체는 timeline 목록에 노출하지 않는다.
- provider raw response, token, API key, quota detail은 저장/응답/log에 노출하지 않는다.
- 회의록 details/rawText 전문은 timeline summary에 넣지 않는다.
- activity title/body에는 사용자가 민감정보를 적을 수 있으므로 structured log에 원문을 남기지 않는다.
- 목록 summary에는 짧은 safe summary만 내려준다.

## 7. 삭제/복구 정책

- 1차에서 수동 activity 삭제 API는 만들지 않는다.
- `DealActivity` 자체는 soft delete field를 1차 schema에 포함하지 않는다.
- 삭제 정책이 필요하면 11 Admin/Trust/policy gate와 연결해 후속으로 추가한다.

## 8. 완료 기준

- 딜 상세에서 timeline을 볼 수 있다.
- 핵심 자동 activity가 transaction과 함께 생성된다.
- 수동 activity를 만들고 수정할 수 있다.
- 자동 activity는 수정할 수 없다.
- 다른 사용자의 딜 activity에 접근할 수 없다.
- 삭제된 딜, 삭제된 source, private memo, provider raw detail이 timeline response에 섞이지 않는다.
- 딜 목록 products/latest activity와 담당자 dealCount는 API 응답 기준으로 표시된다.
- page size 15 계약이 Backend/FE/test에서 일치한다.
- Company/Contact/Product latest summary, generic summary endpoint, record별 상세 activity timeline은 06 완료 조건에 포함하지 않는다.
