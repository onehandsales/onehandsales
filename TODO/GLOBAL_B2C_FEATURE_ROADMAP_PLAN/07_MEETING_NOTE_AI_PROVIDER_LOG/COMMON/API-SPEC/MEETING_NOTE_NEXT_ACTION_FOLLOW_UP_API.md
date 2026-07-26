# Meeting Note Next Action Follow Up API

상태: Confirmed
확정일: 2026-07-26

## 1. 목적

저장된 회의록을 기반으로 사용자가 바로 실행할 수 있는 다음 행동 후보와 follow-up 문안을 생성한다. AI는 후보와 초안만 만들고, 저장/발송은 사용자가 확인한 뒤 기존 기능으로 수행한다.

Global B2C 관점의 구매 가치는 회의 후 해야 할 일을 놓치지 않고, 고객에게 보낼 메시지를 빠르게 작성하게 만드는 것이다.

## 2. 신규 API

| Method | Path | 목적 | 저장 여부 |
|---|---|---|---|
| `POST` | `/api/meeting-notes/:meetingNoteId/next-actions/draft` | 회의록 기반 다음 행동 후보 생성 | 저장 안 함 |
| `POST` | `/api/meeting-notes/:meetingNoteId/follow-up-draft` | 회의록 기반 follow-up 문안 생성 | 저장 안 함 |

User Web은 후보를 보여주고 사용자가 확인한 뒤 기존 API를 호출한다.

- 다음 행동 저장: `POST /api/deals/:dealId/following-action-logs`
- 이메일/SMS 발송 기능과의 직접 연결은 07 범위가 아니다.
- Follow-up 초안 DB 저장도 07 범위가 아니다.

## 3. Next Action Draft Request

```http
POST /api/meeting-notes/7c701f1e-2aa5-47b6-91b4-c5d494a3d160/next-actions/draft
Content-Type: application/json
Authorization: Bearer <accessToken>
```

```json
{
  "dealId": "39d8c871-72e9-43c6-91cb-ec534de3df71",
  "maxCandidates": 3
}
```

Request 규칙:

- `meetingNoteId`: 필수 path param, 현재 사용자 소유 회의록 UUID
- `dealId`: 선택, 회의록에 연결된 현재 사용자 소유 딜 UUID
- `maxCandidates`: 선택, 기본 3, 최대 3
- `dealId`가 없으면 회의록에 연결된 딜 중 우선순위가 높은 딜을 기준으로 후보를 만들 수 있다.

## 4. Next Action Draft Response

```json
{
  "items": [
    {
      "clientSuggestionId": "na_01",
      "title": "가격표와 보안 자료 보내기",
      "memo": "고객이 8월 초 도입 가능성을 검토한다고 했어요.",
      "recommendedDueDate": "2026-07-28",
      "dealId": "39d8c871-72e9-43c6-91cb-ec534de3df71",
      "confidence": "MEDIUM",
      "reason": "회의록의 요청 사항과 다음 계획에서 반복 확인된 행동이에요."
    }
  ]
}
```

Response 규칙:

- `items`: 0~3개 후보
- `clientSuggestionId`: 클라이언트 렌더링용 임시 ID, DB ID가 아니다.
- `title`: 사용자가 그대로 저장할 수 있는 짧은 다음 행동 문구
- `memo`: 선택, 사용자가 판단할 수 있는 짧은 근거
- `recommendedDueDate`: 선택, ISO date. 07 1차에서는 표시/판단용이며 기존 following-action 저장 API에 전달하지 않는다.
- `dealId`: 선택, 저장 대상 딜 후보
- `confidence`: `LOW` | `MEDIUM` | `HIGH`
- `reason`: 선택, 사용자에게 보여줄 수 있는 짧은 설명

저장 흐름:

```http
POST /api/deals/:dealId/following-action-logs
```

```json
{
  "followingAction": "가격표와 보안 자료 보내기"
}
```

AI next action draft API는 이 저장 API를 자동 호출하지 않는다.
현재 기존 저장 API는 `followingAction` 문자열만 받는다. 따라서 07 1차에서 `recommendedDueDate`, `memo`, `reason`은 저장하지 않고 사용자가 판단하는 보조 정보로만 표시한다.

## 5. Follow Up Draft Request

```http
POST /api/meeting-notes/7c701f1e-2aa5-47b6-91b4-c5d494a3d160/follow-up-draft
Content-Type: application/json
Authorization: Bearer <accessToken>
```

```json
{
  "channel": "EMAIL",
  "recipientContactId": "92a57c9d-5413-4745-b1f8-bf8ac70a80d6",
  "dealId": "39d8c871-72e9-43c6-91cb-ec534de3df71",
  "tone": "POLITE",
  "language": "ko"
}
```

Request 규칙:

- `meetingNoteId`: 필수 path param, 현재 사용자 소유 회의록 UUID
- `channel`: `EMAIL` | `SMS`
- `recipientContactId`: 선택, 회의록에 연결된 현재 사용자 소유 담당자 UUID
- `dealId`: 선택, 회의록에 연결된 현재 사용자 소유 딜 UUID
- `tone`: 선택, `POLITE` | `FRIENDLY` | `FORMAL`
- `language`: 선택, ISO language code. 1차 기본은 사용자 화면 언어 또는 `ko`.

## 6. Follow Up Draft Response

EMAIL:

```json
{
  "channel": "EMAIL",
  "subject": "오늘 미팅 내용 정리드립니다",
  "body": "안녕하세요. 오늘 논의한 내용 정리드립니다...\n\n가격표와 보안 자료를 함께 전달드리겠습니다.",
  "suggestedRecipient": {
    "contactId": "92a57c9d-5413-4745-b1f8-bf8ac70a80d6",
    "displayName": "홍길동"
  },
  "copyableText": "안녕하세요. 오늘 논의한 내용 정리드립니다...\n\n가격표와 보안 자료를 함께 전달드리겠습니다."
}
```

SMS:

```json
{
  "channel": "SMS",
  "subject": null,
  "body": "오늘 미팅 감사합니다. 요청하신 가격표와 보안 자료를 전달드리겠습니다.",
  "suggestedRecipient": {
    "contactId": "92a57c9d-5413-4745-b1f8-bf8ac70a80d6",
    "displayName": "홍길동"
  },
  "copyableText": "오늘 미팅 감사합니다. 요청하신 가격표와 보안 자료를 전달드리겠습니다."
}
```

Response 규칙:

- `subject`: EMAIL이면 문자열, SMS이면 `null`
- `body`: 사용자가 수정할 수 있는 본문
- `suggestedRecipient`: 선택, 추천 수신자 표시용
- `copyableText`: 사용자가 복사 버튼으로 바로 사용할 수 있는 텍스트
- DB에는 follow-up draft 전문을 저장하지 않는다.

## 7. Safe Failure Response

```json
{
  "statusCode": 502,
  "error": "MeetingNoteAiDraftFailed",
  "message": "AI 초안을 만들지 못했어요. 직접 작성으로 이어갈 수 있어요.",
  "retryable": true
}
```

오류 규칙:

- 다른 사용자 회의록/딜/담당자는 존재 여부를 노출하지 않고 안전한 not found로 처리한다.
- Provider 실패는 안전 메시지로만 응답한다.
- Follow-up 본문 전문이나 provider raw response를 structured log에 남기지 않는다.
- FE는 실패해도 기존 회의록 상세 화면에서 계속 편집, 복사, 수동 작성할 수 있어야 한다.

## 8. 비즈니스 로직

Next action draft:

1. AuthGuard로 현재 사용자를 확인한다.
2. `meetingNoteId` 소유권과 soft delete 상태를 확인한다.
3. 선택된 `dealId`가 회의록에 연결되어 있고 현재 사용자 소유인지 확인한다.
4. 회의록의 `details`, `nextPlan`, `requiredAction`, 연결 회사/담당자/딜 snapshot을 provider 입력으로 구성한다.
5. Provider 호출을 `MEETING_NOTE_NEXT_ACTION_DRAFT` operation으로 기록한다.
6. 후보를 최대 3개로 정규화한다.
7. 후보만 응답하고 DB에 저장하지 않는다.
8. 사용자가 후보를 확인하면 FE가 기존 deal following-action 저장 API를 호출한다.

Follow-up draft:

1. AuthGuard로 현재 사용자를 확인한다.
2. `meetingNoteId` 소유권과 soft delete 상태를 확인한다.
3. 선택된 `recipientContactId`, `dealId`가 회의록 맥락과 현재 사용자 소유권을 만족하는지 확인한다.
4. 회의록 내용과 연결 snapshot으로 provider 입력을 구성한다.
5. Provider 호출을 `MEETING_NOTE_FOLLOW_UP_DRAFT` operation으로 기록한다.
6. 채널별 길이와 형식을 정규화한다.
7. 초안만 응답하고 DB에 저장하지 않는다.
8. 발송 자동화는 하지 않는다.

## 9. DB 기록 계약

추가 operation:

```prisma
MEETING_NOTE_NEXT_ACTION_DRAFT
MEETING_NOTE_FOLLOW_UP_DRAFT
```

`AiProviderCallLog` 기록 예시:

```json
{
  "operation": "MEETING_NOTE_NEXT_ACTION_DRAFT",
  "targetType": "MEETING_NOTE",
  "targetId": "7c701f1e-2aa5-47b6-91b4-c5d494a3d160",
  "metadataJson": {
    "feature": "meeting-note",
    "source": "detail-ai-panel",
    "candidateCount": 3,
    "hasDealContext": true
  }
}
```

```json
{
  "operation": "MEETING_NOTE_FOLLOW_UP_DRAFT",
  "targetType": "MEETING_NOTE",
  "targetId": "7c701f1e-2aa5-47b6-91b4-c5d494a3d160",
  "metadataJson": {
    "feature": "meeting-note",
    "source": "detail-ai-panel",
    "channel": "EMAIL",
    "language": "ko",
    "hasRecipient": true
  }
}
```

금지:

- 다음 행동 후보 원문 전체를 DB log에 저장
- follow-up subject/body 전문 저장
- provider raw request/response 저장
- prompt 전문 저장
- 연락처 이메일/전화번호 전문 저장

## 10. Transaction 기준

- Provider 호출은 DB transaction 밖에서 수행한다.
- `AiProviderCallLog` 생성/갱신은 짧은 write로 처리한다.
- Next action draft와 follow-up draft는 업무 row를 생성하지 않으므로 본문 저장 transaction이 없다.
- 사용자가 다음 행동 후보를 확정하면 기존 following action 저장 API의 transaction 기준을 따른다.

## 11. Backend 구현 위치

후보 파일:

- `BE/src/modules/meeting-note/presentation/http/meeting-note.controller.ts`
- `BE/src/modules/meeting-note/presentation/http/dto/meeting-note-request.dto.ts`
- `BE/src/modules/meeting-note/application/services/meeting-note-ai-draft-application.service.ts`
- 신규 application service 또는 use case
- 신규 provider port 또는 기존 provider port 확장
- `BE/src/modules/meeting-note/infrastructure/providers/*`
- `BE/src/modules/deal/presentation/http/deal.controller.ts`의 following-action 저장 API는 재사용 대상

코드 작업 시 API handler, DTO, provider 호출, log redaction, 후보 정규화에는 반드시 한글 주석을 추가한다.

## 12. Frontend 구현 위치

후보 파일:

- `FE/user-web/src/features/meeting-note/api/meeting-note-api.ts`
- `FE/user-web/src/features/meeting-note/types/meeting-note.ts`
- `FE/user-web/src/features/meeting-note/hooks/use-meeting-note-mutations.ts`
- `FE/user-web/src/features/meeting-note/components/meeting-note-detail-screen.tsx`
- `FE/user-web/src/features/deal/api/deal-api.ts`
- `FE/user-web/src/features/deal/hooks/use-deal-mutations.ts`

UX 규칙:

- 회의록 상세 안에 Notion식 문서 편집 흐름을 유지한다.
- AI 결과는 Attio식 linked record 맥락으로 보여준다.
- 다음 행동 후보는 확인/수정 후 저장한다.
- Follow-up draft는 확인/수정/복사 중심으로 제공한다.
- 자동 저장, 자동 발송, Admin 운영 화면은 07에 넣지 않는다.
