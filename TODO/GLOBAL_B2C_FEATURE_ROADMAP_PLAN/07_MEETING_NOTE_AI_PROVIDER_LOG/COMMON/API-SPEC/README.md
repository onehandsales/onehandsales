# API Spec

상태: Confirmed
확정일: 2026-07-26

## 1. 목적

07의 API 계약은 두 묶음으로 나눈다.

| 문서 | 범위 | 구현 goal |
|---|---|---|
| `MEETING_NOTE_AI_DRAFT_LOG_API.md` | 기존 AI/STT draft API의 provider log와 safe failure 보강 | G03/G05 |
| `MEETING_NOTE_NEXT_ACTION_FOLLOW_UP_API.md` | next action 후보 생성, follow-up 초안 생성 신규 API | G04/G05 |

## 2. 계약 상태

두 문서는 구현 착수 가능한 `confirmed` 상태다.

구현 후 G06 closeout에서 `implemented`로 갱신한다.

## 3. 공통 규칙

- User API는 `/api/*`만 사용한다.
- Admin API는 만들지 않는다.
- 모든 API는 AuthGuard를 사용한다.
- 다른 사용자 회의록/딜/담당자 접근은 존재 여부를 노출하지 않고 안전한 404로 처리한다.
- provider raw response, prompt 원문, transcript 원문, 회의록 원문은 response/log/metadata에 넣지 않는다.
- mutation과 provider API는 transaction/observability 계약을 문서화한다.
- FE는 API 응답에 없는 summary/count/latest를 임의로 만들지 않는다.
- request/response body가 있는 API는 JSON 예시를 포함한다.
- 비즈니스 로직은 `COMMON/BUSINESS-LOGIC.md`와 충돌하지 않아야 한다.

## 4. Error 공통 body

AI provider 실패는 사용자에게 safe body만 반환한다.

```json
{
  "statusCode": 502,
  "error": "MeetingNoteAiDraftFailed",
  "message": "AI 초안을 만들지 못했어요. 직접 작성으로 이어갈 수 있어요.",
  "retryable": true
}
```

Provider 내부 status, quota detail, raw response는 사용자 응답에 포함하지 않는다.

현재 전역 오류 응답은 `statusCode`, `error`, `message`를 사용한다. `MeetingNoteAiDraftFailed`는 502, `MeetingNoteAiDraftProviderUnavailable`은 503을 사용한다. `retryable`은 07 구현에서 안전하게 추가하거나 `ApiClientError.raw`에서 읽을 수 있는 동등한 구조로 제공한다.

## 5. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
