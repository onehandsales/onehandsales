# Business Logic

상태: Confirmed
확정일: 2026-07-25

## 1. 목적

06의 비즈니스 로직 기준을 한곳에 모은다.

구현자는 G01에서 현재 코드와 이 문서를 대조하고, G02~G06에서는 이 문서를 API/DB/FE 계약보다 낮은 우선순위가 아니라 같은 수준의 실행 기준으로 사용한다.

## 2. 핵심 불변 조건

- 모든 `DealActivity`는 반드시 `userId`와 `dealId`를 가진다.
- 모든 조회/생성/수정은 현재 로그인 사용자의 `userId` 조건을 포함한다.
- 삭제된 딜의 activity는 일반 User Web timeline에 노출하지 않는다.
- 자동 activity는 사용자가 수정하거나 삭제할 수 없다.
- 수동 activity는 사용자가 직접 만든 `sourceType=USER` row만 수정할 수 있다.
- 1차에서는 수동 activity 삭제를 만들지 않는다.
- private memo, provider raw response, follow-up body 전체, meeting note raw text 전문은 timeline summary에 포함하지 않는다.
- 수동 activity `body`는 딜 상세 timeline response에는 포함할 수 있지만 structured log와 목록 summary에는 포함하지 않는다.
- API 응답에 없는 latest activity, products summary, dealCount를 FE에서 임의로 만들지 않는다.
- 원본 source record가 삭제되어도 activity row는 정본 이력으로 남긴다. 단 삭제된 source의 linked record link와 원문 detail은 response에 포함하지 않는다.

## 3. Timeline 조회 로직

1. AuthGuard로 현재 사용자를 확인한다.
2. `Deal`을 `id`, `userId`, `deletedAt=null` 조건으로 조회한다.
3. 딜이 없거나 타 사용자 딜이면 안전한 404를 반환한다.
4. `DealActivity`를 `userId`, `dealId` 조건으로 조회한다.
5. 정렬은 `occurredAt desc, id desc`를 사용한다.
6. cursor는 `occurredAt`과 `id`를 함께 담되, FE가 파싱하지 않는 opaque string으로 발급한다.
7. cursor는 같은 filter 조건 안에서만 유효하다. `type` filter가 바뀌면 첫 페이지부터 조회한다.
8. page size는 기존 딜 cursor log UX와 맞춰 10개로 둔다.
9. DB row를 그대로 반환하지 않고 response DTO로 변환한다.
10. 수동 activity의 `body`는 현재 사용자 딜 상세 response에만 포함한다.
11. `linkedRecordsJson`이 null이면 response의 `linkedRecords`는 빈 배열로 내려준다.
12. 삭제된 source record, 타 사용자 source record, 접근 불가 source record는 `linkedRecords`에서 제외한다.
13. `linkedRecordsJson`은 User Web route와 label만 포함한 안전한 값으로 내려준다.

## 4. 수동 Activity 생성 로직

허용 type:

- `CALL`
- `MEETING`
- `EMAIL`
- `VISIT`
- `NOTE`

처리 순서:

1. 현재 사용자의 active 딜인지 확인한다.
2. `activityType`이 수동 type인지 검증한다.
3. `title`은 trim 후 1~120자로 검증한다.
4. `body`는 trim 후 없거나 2000자 이하로 검증한다. trim 후 빈 문자열이면 null로 저장한다.
5. `occurredAt`이 없으면 서버 현재 시각을 사용한다.
6. `occurredAt`은 과거 입력을 허용하되 서버 현재 시각보다 5분 이상 미래면 거부한다.
7. transaction 안에서 `DealActivity`를 생성한다.
8. 생성 row는 `sourceType=USER`, `sourceId=null`로 저장한다.
9. response의 `isEditable`은 true로 계산한다.
10. structured log에는 title/body 원문을 남기지 않는다.

## 5. 수동 Activity 수정 로직

처리 순서:

1. 현재 사용자의 active 딜인지 확인한다.
2. `DealActivity`를 `id`, `dealId`, `userId` 조건으로 조회한다.
3. row가 없으면 안전한 404를 반환한다.
4. `sourceType`이 `USER`가 아니면 수정하지 않고 409를 반환한다.
5. 수정 요청 body에 최소 한 필드가 있어야 한다.
6. `activityType`을 바꾸는 경우 수동 type만 허용한다.
7. `title`, `body`, `occurredAt` validation은 생성 API와 같은 기준을 따른다.
8. transaction 안에서 row를 수정한다.
9. response의 `isEditable`은 true로 계산한다.

## 6. 자동 Activity 생성 로직

자동 activity는 public endpoint가 아니라 기존 mutation use case 안에서 생성한다.

| Trigger | Activity type | sourceType | sourceId 기준 | title/summary 기준 |
|---|---|---|---|---|
| 딜 생성 | `DEAL_CREATED` | `SYSTEM` | `deal.id` | 딜 생성 사실만 기록 |
| 딜 단계 변경 | `STAGE_CHANGED` | `SYSTEM` | `deal.id` | 이전 단계와 새 단계를 summary에 저장 |
| 다음 행동 생성 | `NEXT_ACTION_CREATED` | `NEXT_ACTION` | `DealFollowingActionLog.id` | 다음 행동 제목을 safe summary로 저장 |
| 다음 행동 완료 변경 | `NEXT_ACTION_COMPLETION_CHANGED` | `NEXT_ACTION` | `DealFollowingActionLog.id` | 완료/미완료 상태 변경만 저장 |
| 일정 연결 | `SCHEDULE_LINKED` | `SCHEDULE` | `ScheduleDeal.id` | 일정 제목과 시작 시각 summary |
| 일정 연결 해제 | `SCHEDULE_UNLINKED` | `SCHEDULE` | 삭제 직전 `ScheduleDeal.id` | 연결 해제 사실만 기록 |
| 회의록 연결 | `MEETING_NOTE_LINKED` | `MEETING_NOTE` | `MeetingNoteDeal.id` | 회의록 제목과 회의 시각 summary |
| 회의록 연결 해제 | `MEETING_NOTE_UNLINKED` | `MEETING_NOTE` | 삭제 직전 `MeetingNoteDeal.id` | 연결 해제 사실만 기록 |
| follow-up 발송 성공 | `FOLLOW_UP_SENT` | `FOLLOW_UP` | `FollowUpDeliveryAttempt.id` | `DEAL` target을 가진 메시지만 channel, 수신자, 발송 시각 저장 |
| follow-up 발송 실패 | `FOLLOW_UP_FAILED` | `FOLLOW_UP` | `FollowUpDeliveryAttempt.id` | `DEAL` target을 가진 메시지만 channel, safe error 저장 |

중복 기준:

- source row가 있는 자동 activity는 같은 mutation 재시도에서 같은 `dealId + activityType + sourceType + sourceId` 조합이 중복 생성되지 않게 application layer에서 확인한다.
- `STAGE_CHANGED`처럼 같은 `sourceId=deal.id`로 여러 번 발생할 수 있는 activity는 DB unique 제약을 1차에서 두지 않는다.
- G01에서 실제 mutation idempotency 패턴이 있으면 그 기준을 우선한다.
- `DealApplicationService.createDeal`은 현재 초기 `DealFollowingActionLog`를 같은 transaction에서 생성한다. 1차 기준은 딜 생성 transaction 안에서 `DEAL_CREATED`와 초기 다음 행동의 `NEXT_ACTION_CREATED`를 모두 생성하는 것이다.
- 회의록 relation update처럼 기존 연결을 delete 후 recreate하는 구현은 삭제 전에 연결 diff를 계산해 link/unlink activity를 만든다.
- follow-up activity는 `FollowUpMessageTarget.targetType=DEAL`인 target별로 만들며, 다른 target만 가진 message는 딜 timeline에 기록하지 않는다.
- follow-up 발송 성공/실패 activity의 `sourceId`는 message id가 아니라 확정된 `FollowUpDeliveryAttempt.id`로 둔다. `FollowUpMessage.id`는 `metadataJson.messageId`에 넣어 재시도 실패/성공 시도별 이력을 구분한다.
- 기존 회의록 연결 mutation이 `DealFollowingActionLog`에 남기는 proxy 로그 문구를 `DealActivity` summary로 재사용하지 않는다. 06 activity는 `MeetingNoteDeal` snapshot과 회의록 title/meetingAt 기준 safe summary로 별도 생성한다.
- G01에서 회의록 연결 시 legacy `DealFollowingActionLog` 생성을 유지할지, 중단할지, UI에서 중복 노출만 막을지 결정한다.
- source record 자체의 soft delete는 1차에서 별도 `*_DELETED` activity를 만들지 않는다. 관계 row가 실제로 제거되거나 replace diff에서 빠진 경우에만 `SCHEDULE_UNLINKED`, `MEETING_NOTE_UNLINKED`를 만든다.

Transaction 기준:

- 핵심 domain 변경과 자동 activity 생성은 같은 DB transaction 안에서 처리한다.
- 외부 provider 호출은 transaction 밖에서 수행한다.
- follow-up은 provider 호출 뒤 delivery 상태를 저장하는 DB transaction 안에서 activity를 생성한다.
- activity 생성 실패 시 같은 transaction의 원본 DB 변경도 rollback되어야 한다.

## 7. Safe Summary 생성 규칙

Timeline title/summary는 사용자가 빠르게 이해할 수 있는 짧은 문장이어야 한다.

예시:

| Activity type | title | summary |
|---|---|---|
| `DEAL_CREATED` | `딜을 만들었어요.` | `7월 신규 도입 상담` |
| `STAGE_CHANGED` | `단계가 바뀌었어요.` | `초기 접촉 -> 제안/견적` |
| `NEXT_ACTION_CREATED` | `다음 행동을 추가했어요.` | `견적서 발송하기` |
| `NEXT_ACTION_COMPLETION_CHANGED` | `다음 행동 상태가 바뀌었어요.` | `완료됨` |
| `SCHEDULE_LINKED` | `일정을 연결했어요.` | `7월 25일 14:00 데모 미팅` |
| `MEETING_NOTE_LINKED` | `회의록을 연결했어요.` | `도입 검토 미팅` |
| `FOLLOW_UP_SENT` | `이메일 follow-up을 보냈어요.` | `김민수 담당자에게 발송됨` |
| `FOLLOW_UP_FAILED` | `문자 follow-up을 보내지 못했어요.` | `일시적인 전송 실패` |

금지:

- follow-up 본문 전체 복사
- private memo 원문 복사
- meeting note details/rawText 전문 복사
- provider raw error/detail 복사
- token, API key, 외부 provider quota detail 저장

## 8. Linked Record 생성 규칙

`linkedRecords`는 timeline item에서 관련 record로 이동하기 위한 최소 정보만 가진다.

| 대상 | targetType | targetPath 예시 |
|---|---|---|
| 딜 | `DEAL` | `/app/deals/{dealId}` |
| 일정 | `SCHEDULE` | `/app/schedules/{scheduleId}` |
| 회의록 | `MEETING_NOTE` | `/app/meeting-notes/{meetingNoteId}` |
| 담당자 | `CONTACT` | `/app/contacts/{contactId}` |
| 회사 | `COMPANY` | `/app/companies/{companyId}` |
| 제품 | `PRODUCT` | `/app/products/{productId}` |
| follow-up | `FOLLOW_UP_MESSAGE` | 1차에서 전용 route가 없으면 null route를 만들지 않고 link를 생략 |

타 사용자 record나 삭제된 source record는 linkedRecords에 포함하지 않는다.

저장된 source `targetPath`가 `/contacts/{id}`처럼 `/app` prefix 없이 들어온 경우에도 timeline response의 `targetPath`는 User Web route인 `/app/contacts/{id}` 형태로 정규화한다.

## 8.1 Metadata JSON 허용 기준

`metadataJson`은 자동 activity를 해석하는 데 필요한 redacted 구조만 저장한다. 원문 전문이나 provider raw object를 그대로 넣지 않는다.

| Activity type | 허용 metadata 예 |
|---|---|
| `STAGE_CHANGED` | `fromStatus`, `fromStatusLabel`, `toStatus`, `toStatusLabel` |
| `NEXT_ACTION_COMPLETION_CHANGED` | `completed` |
| `SCHEDULE_LINKED`, `SCHEDULE_UNLINKED` | `scheduleId`, `scheduleTitle`, `startAt` |
| `MEETING_NOTE_LINKED`, `MEETING_NOTE_UNLINKED` | `meetingNoteId`, `meetingNoteTitle`, `meetingAt` |
| `FOLLOW_UP_SENT`, `FOLLOW_UP_FAILED` | `messageId`, `deliveryAttemptId`, `channel`, `recipientName`, `safeErrorCode`, `safeErrorMessage` |

금지 metadata:

- follow-up body 전체
- meeting note details/rawText
- private memo
- provider raw response
- token, API key, quota detail
- contact email/phone 원문

## 9. 목록 Summary 로직

Deal list:

1. 기존 page query로 현재 page의 딜 목록을 구한다.
2. 현재 page deal IDs에 대해서만 products summary를 조회한다.
3. 현재 page deal IDs에 대해서만 latest activity를 조회한다.
4. products summary는 `DealProduct -> Product` 관계 기준으로 만든다.
5. latest activity는 `DealActivity.occurredAt desc, id desc` 기준 첫 row를 사용한다.
6. private memo, provider raw, follow-up body 전체를 summary에 포함하지 않는다.

Contact list:

1. 기존 page query로 현재 page의 담당자 목록을 구한다.
2. 현재 page contact IDs에 대해서만 active deal count를 집계한다.
3. `DealContact`와 `Deal`을 함께 확인해 삭제된 딜과 타 사용자 딜을 제외한다.
4. FE는 응답의 `dealCount`만 표시한다.

## 10. 기존 데이터와 Backfill

1차 구현은 새 mutation부터 `DealActivity`를 쌓는 방식으로 시작한다.

- 기존 `DealFollowingActionLog`, `DealMemoLog`, `ScheduleDeal`, `MeetingNoteDeal`, `FollowUpMessageTarget` 데이터를 강제 backfill하지 않는다.
- G04에서는 기존 섹션을 갑자기 제거하지 않고, 새 timeline과 충돌하지 않게 점진 통합한다.
- 과거 데이터 backfill이 필요하면 별도 migration/운영 goal로 분리한다.
