# AI Weekly Report API

계약 상태: confirmed
소비자: User Web
호환성: 신규 API, 기존 `/api/schedules/week` 변경 없음

## 1. 공통 계약

Base path: `/api/sales-reports/weekly`

인증:

- `Authorization: Bearer <app_access_token>`
- `AuthGuard`

권한:

- current user의 `userId`로만 report/job/snapshot/suggestion을 조회하고 변경한다.
- Admin API는 만들지 않는다.

시간:

- `weekStart`, `weekEnd`는 `YYYY-MM-DD` date-only string이다.
- `timeZone`은 IANA timezone ID다.
- `requestedAt`, `startedAt`, `completedAt`, `generatedAt`, `failedAt`, `createdAt`, `updatedAt`은 UTC ISO string이다.

민감정보:

- input snapshot 전체는 DB에 저장하지만 일반 report response에는 포함하지 않는다.
- 사용자 response에는 snapshot summary만 제공한다.
- provider prompt/raw response는 response에 포함하지 않는다.

## 2. POST /api/sales-reports/weekly

- API 이름: AI 주간 리포트 생성 요청 API
- API 식별자: `RequestAiWeeklySalesReportGeneration`
- Method: `POST`
- Path: `/api/sales-reports/weekly`
- Request 이름: `CreateAiWeeklySalesReportRequest`
- Response 이름: `AiWeeklySalesReportGenerationAcceptedResponse`
- Status: `202 Accepted`

### 목적

사용자가 선택한 주의 AI report version과 비동기 job을 만든다.

### Request

Header:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `Authorization` | string | 예 | Bearer app access token |
| `Idempotency-Key` | string | 선택 | 같은 사용자 action 중복 방지용 key. 없으면 Backend가 생성 요청 단위로 처리한다. |

Body:

| 필드 | 타입 | 필수 | nullable | validation | 예시 | 설명 |
|---|---|---:|---:|---|---|---|
| `weekStart` | string | 예 | 아니오 | `YYYY-MM-DD`, 월요일 | `2026-07-20` | 생성할 주의 시작일 |
| `timeZone` | string | 아니오 | 아니오 | IANA timezone ID | `Asia/Seoul` | 주간 범위와 표시 기준. 없으면 `User.timeZone` |
| `locale` | string | 아니오 | 아니오 | BCP 47 또는 앱 locale | `ko-KR` | 리포트 생성 언어. 없으면 `User.preferredLocale` |

### 비즈니스 로직

1. current user를 확인한다.
2. `weekStart`, `timeZone`, `locale`을 검증한다.
3. 같은 `userId + weekStart + timeZone`에 `GENERATING` report가 있는지 확인한다.
4. 생성 중 report가 있으면 새 row를 만들지 않고 `AiWeeklySalesReportAlreadyGenerating`을 반환한다.
5. 03 weekly schedule report builder와 meeting note/deal repository로 input snapshot을 만든다.
6. 같은 `userId + weekStart + timeZone`의 최대 version에 1을 더한다.
7. transaction 안에서 `AiWeeklySalesReport`, `AiJob`을 생성한다.
8. response에는 snapshot 원문을 넣지 않고 report/job 요약만 반환한다.

### Response

```json
{
  "report": {
    "id": "9d7f8b1e-1111-4444-9999-111111111111",
    "weekStart": "2026-07-20",
    "weekEnd": "2026-07-26",
    "timeZone": "Asia/Seoul",
    "locale": "ko-KR",
    "version": 3,
    "status": "GENERATING",
    "requestedAt": "2026-07-24T05:10:00.000Z",
    "generatedAt": null,
    "failedAt": null
  },
  "job": {
    "id": "a0c5b06a-2222-4444-9999-222222222222",
    "status": "PENDING"
  }
}
```

### 연결 DB 스키마

- 생성: `AiWeeklySalesReport`, `AiJob`
- 조회: `User`, `Schedule`, `ScheduleDeal`, `Deal`, `MeetingNote`, 연결 snapshot table
- 수정: 없음
- 감사 로그: 없음
- transaction: `AiWeeklySalesReport`, `AiJob`

### Transaction

- 필요 여부: 필요
- 이유: report version과 job은 같은 사용자 action의 정본이다.
- rollback 범위: report/job 생성 전체
- 외부 Provider 호출 위치: 없음. 이 API에서는 provider를 호출하지 않는다.
- audit log 포함 여부: 없음

### Observability

- log event key: `ai.weeklyReport.generationRequested`
- audit log: 없음
- request id: 사용
- redaction: snapshot 원문, meeting note body, provider prompt logging 금지
- provider error context: 없음

### 에러 응답

| 상황 | error code | HTTP | FE 처리 |
|---|---|---:|---|
| 인증 없음 | `Unauthorized` | 401 | 로그인으로 이동 |
| `weekStart` invalid | `ValidationError` | 400 | 날짜를 다시 선택 |
| `timeZone` invalid | `ValidationError` | 400 | 사용자 timezone fallback 후 재시도 |
| 같은 주 생성 중 | `AiWeeklySalesReportAlreadyGenerating` | 409 | 기존 생성 중 report를 polling |

## 3. GET /api/sales-reports/weekly

- API 이름: 주간 AI 리포트 목록/최신 조회 API
- API 식별자: `GetAiWeeklySalesReportWeek`
- Method: `GET`
- Path: `/api/sales-reports/weekly`
- Request 이름: `GetAiWeeklySalesReportWeekQuery`
- Response 이름: `AiWeeklySalesReportWeekResponse`
- Status: `200 OK`

### Request

Query:

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `weekStart` | string | 예 | `YYYY-MM-DD`, 월요일 | 조회할 주 |
| `timeZone` | string | 아니오 | IANA timezone ID | 표시 timezone |
| `includeFailed` | boolean | 아니오 | `true` 또는 `false` | 실패 version summary 포함 여부. 기본 `true` |

### Response

```json
{
  "weekStart": "2026-07-20",
  "weekEnd": "2026-07-26",
  "timeZone": "Asia/Seoul",
  "latestSuccessfulReport": {
    "id": "report-id",
    "version": 3,
    "status": "READY",
    "generatedAt": "2026-07-24T05:15:00.000Z",
    "summaryPreview": "이번 주에는 제안 단계 딜이 늘었어요."
  },
  "generatingReport": null,
  "versions": [
    {
      "id": "report-id",
      "version": 3,
      "status": "READY",
      "generatedAt": "2026-07-24T05:15:00.000Z",
      "failedAt": null
    }
  ],
  "failedVersionCount": 1,
  "failedVersions": [
    {
      "id": "failed-report-id",
      "version": 2,
      "status": "FAILED",
      "generatedAt": null,
      "failedAt": "2026-07-24T04:30:00.000Z",
      "safeErrorCode": "AI_PROVIDER_TIMEOUT",
      "safeErrorMessage": "리포트를 만들지 못했어요. 다시 시도해 주세요."
    }
  ]
}
```

### 비즈니스 로직

1. current user를 확인한다.
2. `weekStart`, `timeZone`을 검증한다.
3. current user의 해당 주 report만 조회한다.
4. 최신 성공 version은 `status=READY`, `version DESC` 기준이다.
5. 생성 중 version은 `status=GENERATING` 기준이다.
6. 실패 version은 count와 접은 목록 표시용 summary를 반환한다.
7. FE는 `failedVersions`를 기본 접힘 상태로 보여준다.

### Transaction

- 필요 여부: 없음
- 이유: 조회 전용이다.

### Observability

- log event key: `ai.weeklyReport.weekViewed`
- audit log: 없음
- request id: 사용
- redaction: output summary preview 외 snapshot/log 원문 logging 금지

## 4. GET /api/sales-reports/weekly/:reportId

- API 이름: AI 주간 리포트 상세 조회 API
- API 식별자: `GetAiWeeklySalesReportDetail`
- Method: `GET`
- Path: `/api/sales-reports/weekly/:reportId`
- Request 이름: `GetAiWeeklySalesReportDetailRequest`
- Response 이름: `AiWeeklySalesReportDetailResponse`
- Status: `200 OK`

### Request

Path param:

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `reportId` | string | 예 | UUID | 조회할 report ID |

### Response

```json
{
  "id": "report-id",
  "weekStart": "2026-07-20",
  "weekEnd": "2026-07-26",
  "timeZone": "Asia/Seoul",
  "locale": "ko-KR",
  "version": 3,
  "status": "READY",
  "requestedAt": "2026-07-24T05:10:00.000Z",
  "generatedAt": "2026-07-24T05:15:00.000Z",
  "failedAt": null,
  "safeErrorCode": null,
  "safeErrorMessage": null,
  "sections": {
    "executiveSummary": {
      "title": "이번 주 영업 요약",
      "body": "이번 주에는 제안 단계 딜이 늘었어요.",
      "bullets": ["제안 단계 딜 2건"]
    },
    "pipelineSummary": {
      "body": "협상 단계 딜은 유지되고 있어요.",
      "stageHighlights": []
    },
    "riskSignals": [],
    "nextWeekActions": [],
    "followUpDrafts": [],
    "dataCleanupSuggestions": []
  },
  "dataCoverage": {
    "scheduleCount": 8,
    "dealCount": 5,
    "meetingNoteCount": 3,
    "missingSignals": []
  }
}
```

`status=FAILED`인 경우:

- `sections`는 `null`
- `safeErrorCode`, `safeErrorMessage`는 nullable이 아니다.

### 비즈니스 로직

1. current user를 확인한다.
2. `reportId` 소유권을 `userId`로 검증한다.
3. report output과 suggestion을 section별 response로 변환한다.
4. input snapshot 원문 전체는 반환하지 않는다.

### Transaction

- 필요 여부: 없음
- 이유: 조회 전용이다.

### Observability

- log event key: `ai.weeklyReport.detailViewed`
- audit log: 없음
- request id: 사용
- redaction: snapshot 원문, provider prompt/raw response logging 금지

### 에러 응답

| 상황 | error code | HTTP | FE 처리 |
|---|---|---:|---|
| report 없음 또는 소유권 없음 | `AiWeeklySalesReportNotFound` | 404 | 주간 리포트 목록으로 복귀 |

## 5. GET /api/sales-reports/weekly/:reportId/snapshot-summary

- API 이름: AI 입력 snapshot 요약 조회 API
- API 식별자: `GetAiWeeklySalesReportSnapshotSummary`
- Method: `GET`
- Path: `/api/sales-reports/weekly/:reportId/snapshot-summary`
- Request 이름: `GetAiWeeklySalesReportSnapshotSummaryRequest`
- Response 이름: `AiWeeklySalesReportSnapshotSummaryResponse`
- Status: `200 OK`

### 목적

DB에 저장된 input snapshot 전체를 사용자에게 그대로 노출하지 않고, AI가 참고한 데이터 범위와 연결 record 요약만 보여준다.

### Response

```json
{
  "reportId": "report-id",
  "snapshotSchemaVersion": 1,
  "capturedAt": "2026-07-24T05:10:00.000Z",
  "counts": {
    "schedules": 8,
    "deals": 5,
    "meetingNotes": 3,
    "contacts": 4
  },
  "records": [
    {
      "targetType": "DEAL",
      "targetId": "deal-id",
      "targetLabel": "하반기 CRM 도입",
      "targetPath": "/app/deals/deal-id"
    }
  ],
  "excluded": [
    "private memo",
    "provider raw response",
    "deleted records"
  ]
}
```

### Transaction

- 필요 여부: 없음
- 이유: 조회 전용이다.

### Observability

- log event key: `ai.weeklyReport.snapshotSummaryViewed`
- audit log: 없음
- request id: 사용
- redaction: snapshot 원문 logging 금지

## 6. FE/BE 동기화 기준

FE:

- `POST` 성공 후 week query와 detail query를 polling한다.
- `409 AiWeeklySalesReportAlreadyGenerating`이면 응답의 existing report 정보를 사용해 polling한다.
- `READY`가 되면 detail을 표시하고 week query를 invalidate한다.
- `FAILED`가 되면 safe message와 `다시 생성` 버튼을 표시한다.

BE:

- controller는 DTO validation과 application service 호출만 담당한다.
- application service는 ownership, version 계산, transaction, provider job 상태를 조율한다.
- provider adapter는 OpenAI Responses API와 strict JSON schema를 사용한다.
- repository는 input snapshot JSON과 output JSON을 그대로 저장하되 response mapper는 snapshot 원문을 반환하지 않는다.
