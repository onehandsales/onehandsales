# 05-A Business Logic

상태: Implementation-ready draft

## 1. Use case 목록

| Use case | 책임 |
|---|---|
| `RequestAiWeeklySalesReportGeneration` | 사용자가 선택한 주의 report version과 job을 생성한다. |
| `ProcessAiWeeklySalesReportJob` | snapshot을 provider에 보내고 report를 READY/FAILED로 갱신한다. |
| `GetAiWeeklySalesReportWeek` | 특정 주의 최신 성공 report와 version summary를 반환한다. |
| `GetAiWeeklySalesReportDetail` | 특정 report version의 상세 output을 반환한다. |
| `GetAiWeeklySalesReportSnapshotSummary` | 저장된 input snapshot의 요약만 반환한다. |

## 2. 생성 요청 흐름

1. AuthGuard로 current user를 확인한다.
2. request body의 `weekStart`, `timeZone`, `locale`을 검증한다.
3. `weekStart`는 요청 `timeZone` 기준 월요일이어야 한다.
4. 같은 `userId + weekStart`에 `GENERATING` report가 있으면 새 report/job을 만들지 않고 `AiWeeklySalesReportAlreadyGenerating`으로 응답한다.
5. 03 주간 일정 보고서 builder와 회의록/딜 조회를 사용해 input snapshot을 만든다.
6. snapshot에는 회의록 `details`, `nextPlan`, `requiredAction` 전체를 포함한다.
7. snapshot에는 private memo, provider raw response, internal error/log, API key, token, 삭제된 record, 다른 사용자 record를 포함하지 않는다.
8. 같은 `userId + weekStart`의 최대 version을 조회해 `version + 1`을 계산한다.
9. transaction 안에서 `AiWeeklySalesReport(status=GENERATING)`, `AiJob(status=PENDING)`을 생성한다.
10. transaction 밖에서 worker가 job을 처리한다.
11. API는 `202 Accepted`와 생성된 report/job 요약을 반환한다.

## 3. Job 처리 흐름

1. processor가 `AiJob(status=PENDING)`을 가져온다.
2. transaction 안에서 job을 `RUNNING`, report를 `GENERATING`으로 확인/갱신한다.
3. transaction 밖에서 `AiProviderCallLog(status=PENDING)`을 만든 뒤 OpenAI provider port를 호출한다.
4. provider 요청은 strict JSON schema와 `store: false`를 사용한다.
5. provider 응답이 schema에 맞으면 transaction 안에서 report를 `READY`로 갱신하고 suggestion row를 생성한다.
6. provider 실패, timeout, schema mismatch가 발생하면 transaction 안에서 report를 `FAILED`, job을 `FAILED`, provider call log를 `FAILED`로 갱신한다.
7. 실패 version도 삭제하지 않는다.
8. 실패 version의 사용자 노출 메시지는 safe error code/message만 사용한다.

## 4. AI input snapshot 구성

최상위 형태:

```json
{
  "schemaVersion": 1,
  "user": {
    "id": "user-id",
    "locale": "ko-KR",
    "timeZone": "Asia/Seoul"
  },
  "week": {
    "weekStart": "2026-07-20",
    "weekEnd": "2026-07-26",
    "rangeStartAt": "2026-07-19T15:00:00.000Z",
    "rangeEndAt": "2026-07-26T15:00:00.000Z"
  },
  "weeklyScheduleReport": {},
  "deals": [],
  "meetingNotes": [],
  "dataCoverage": {}
}
```

포함:

- 03 `GET /api/schedules/week`와 동일한 schedule/deal summary
- 이번 주 일정에 연결된 active deal
- 이번 주 회의록과 연결 회사/담당자/제품/딜 snapshot
- 회의록 `details`, `nextPlan`, `requiredAction`
- 딜 다음 행동, 예상 마감일, 단계, 금액
- 미연결 일정, 다음 행동 없는 active deal, 마감 임박/지연 deal 후보

제외:

- private memo
- provider raw response
- STT provider raw detail
- API key, token, quota detail
- 삭제된 record
- 다른 사용자 record
- 일반 structured log 원문

## 5. AI output schema

Provider는 아래 JSON schema에 맞는 객체만 반환한다.

```json
{
  "executiveSummary": {
    "title": "이번 주 영업 요약",
    "body": "이번 주에는 제안 단계 딜이 늘었고, 후속 확인이 필요한 일정이 있어요.",
    "bullets": ["제안 단계 딜 2건", "미연결 일정 1건"]
  },
  "pipelineSummary": {
    "body": "협상 단계 딜은 유지되고 있고 초기 접촉 딜은 다음 행동이 부족해요.",
    "stageHighlights": []
  },
  "riskSignals": [
    {
      "riskKey": "overdue-next-action",
      "severity": "HIGH",
      "title": "다음 행동이 지연된 딜이 있어요",
      "body": "A 딜의 다음 행동이 이번 주 안에 처리되지 않았어요.",
      "targetType": "DEAL",
      "targetId": "uuid",
      "targetPath": "/app/deals/uuid",
      "reason": "다음 행동 로그가 완료되지 않았고 예상 마감일이 가까워요."
    }
  ],
  "nextWeekActions": [
    {
      "actionKey": "follow-up-quote",
      "priority": "HIGH",
      "title": "견적 검토 follow-up",
      "body": "다음 주 화요일까지 견적 검토 의견을 확인해 보세요.",
      "targetType": "DEAL",
      "targetId": "uuid",
      "targetPath": "/app/deals/uuid"
    }
  ],
  "followUpDrafts": [
    {
      "draftKey": "follow-up-contact-uuid",
      "targetContactId": "uuid",
      "targetDealId": "uuid",
      "recommendedChannel": null,
      "purpose": "견적 검토 확인",
      "body": "지난 미팅에서 논의한 견적 검토 건 확인 부탁드려요."
    }
  ],
  "dataCleanupSuggestions": [
    {
      "cleanupKey": "unlinked-schedule-uuid",
      "title": "딜과 연결되지 않은 일정이 있어요",
      "body": "제품 데모 미팅을 관련 딜과 연결하면 리포트 정확도가 좋아져요.",
      "targetType": "SCHEDULE",
      "targetId": "uuid",
      "targetPath": "/app/schedules/uuid"
    }
  ],
  "dataCoverage": {
    "scheduleCount": 8,
    "dealCount": 5,
    "meetingNoteCount": 3,
    "missingSignals": ["딜과 연결되지 않은 일정 1건"]
  }
}
```

## 6. Suggestion 저장 규칙

- AI output의 `riskSignals`, `nextWeekActions`, `followUpDrafts`, `dataCleanupSuggestions`는 `AiWeeklySalesReportSuggestion`으로 정규화해 저장한다.
- suggestion은 삭제하지 않는다.
- 05-A에서는 suggestion을 실제 데이터에 적용하지 않는다.
- 05-B는 `FOLLOW_UP` suggestion을 source로 삼아 draft/send 흐름을 시작한다.

## 7. Transaction 기준

필요:

- report/job 생성
- job 상태 전환
- provider 성공 결과 저장과 suggestion 생성
- provider 실패 결과 저장

필요 없음:

- report 조회
- snapshot summary 조회

외부 provider 호출:

- 항상 transaction 밖에서 수행한다.

## 8. Observability 기준

Structured log event:

- `ai.weeklyReport.generationRequested`
- `ai.weeklyReport.jobStarted`
- `ai.weeklyReport.generated`
- `ai.weeklyReport.failed`
- `provider.openai.weeklySalesReport.failed`

DB log:

- `AiProviderCallLog`에 provider, model, status, latency, token, estimated cost, safe error를 저장한다.

Logging 금지:

- input snapshot 전문
- meeting note body
- private memo
- provider prompt
- provider raw response
- deal amount 원문
- contact email/phone 원문

## 9. 테스트 기준

- 월요일이 아닌 `weekStart`는 400이다.
- invalid `timeZone`은 400이다.
- 같은 user/week 생성 중복은 차단된다.
- 새 생성은 이전 successful/failed version을 덮어쓰지 않는다.
- provider 성공 시 report가 READY가 된다.
- provider 실패 시 report가 FAILED가 되고 실패 version이 남는다.
- snapshot에는 회의록 본문이 포함된다.
- snapshot에는 private memo/provider raw/다른 사용자 record가 포함되지 않는다.
- report 조회에서 사용자는 snapshot 원문 전체를 받지 않는다.
- AI 제안은 Deal/Schedule/MeetingNote를 자동 변경하지 않는다.
