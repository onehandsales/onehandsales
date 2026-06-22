# Meeting Note AI/STT Draft API

## 1. 공통 계약

- 계약 상태: `implemented`
- 서비스: User Web
- 인증: `Authorization: Bearer {accessToken}`
- 권한: 현재 로그인한 사용자의 데이터만 접근
- Admin API: 없음
- DB 저장: 초안 API에서는 없음
- AI/STT 로그 테이블: 없음
- UX 원칙: 회의록은 AI 없이 직접 작성 후 저장할 수 있어야 하며, AI/STT는 작성 화면의 보조 액션이다.

Provider 구조:

- AI 초안 provider port: `MeetingNoteAiDraftProvider`
- AI 초안 provider token: `MEETING_NOTE_AI_DRAFT_PROVIDER`
- 현재 AI 초안 adapter: `OpenAiMeetingNoteAiDraftProvider`
- STT provider port: `MeetingNoteSttProvider`
- STT provider token: `MEETING_NOTE_STT_PROVIDER`
- 현재 STT adapter: `OpenAiMeetingNoteSttProvider`
- AI 초안 생성은 OpenAI 사용을 기본 정책으로 한다.
- STT는 향후 Google, NAVER, AWS 등으로 교체될 수 있으므로 AI 초안 provider와 분리한다.

## 2. 공통 정책

- 사용자가 직접 선택하는 필드: `meetingLocalDateTime`, `companies`, `contacts`, `products`, `deals`
- AI가 생성 가능한 필드: `details`, `nextPlan`, `requiredAction`
- STT가 생성하는 필드: `transcript`
- `companies`, `contacts`는 필수 배열이며 최소 1개 이상이다.
- `products`, `deals`는 선택 배열이며 없으면 빈 배열로 처리한다.
- Backend는 모든 선택 ID를 `currentUser.id` 기준으로 ownership 검증한다.
- Provider prompt에는 사용자가 선택한 엔티티 snapshot 맥락만 전달한다.
- Provider 결과는 저장하지 않고 응답으로만 반환한다.
- 최종 저장은 기존 `POST /api/meeting-notes`를 호출한다.
- 직접 작성 저장은 초안 API를 호출하지 않고 기존 `POST /api/meeting-notes`를 `sourceType: MANUAL`로 호출한다.
- 텍스트 AI 초안 저장은 기존 `POST /api/meeting-notes`를 `sourceType: TEXT_AI`로 호출한다.
- STT+AI 초안 저장은 기존 `POST /api/meeting-notes`를 `sourceType: STT_AI`로 호출한다.

## 3. POST /api/meeting-notes/ai-draft

- API 이름: 회의록 텍스트 AI 초안 생성 API
- API 식별자: `CreateMeetingNoteTextAiDraft`
- Request DTO: `CreateMeetingNoteTextAiDraftDto`
- Response DTO: `MeetingNoteAiDraftResponse`
- Success Status: `200 OK`
- Provider flow: `MeetingNoteAiDraftProvider.createTextDraft`

### Body

| 필드 | 타입 | 필수 | nullable | validation | 설명 |
|---|---|---:|---:|---|---|
| `text` | string | 예 | 불가 | trim 후 1자 이상, 최대 60000자 | 사용자가 입력한 회의 원문 |
| `meetingLocalDateTime` | string | 예 | 불가 | local date-time | 사용자가 선택한 회의 일시 |
| `companies` | string[] | 예 | 불가 | UUID 배열, 최소 1개 | 사용자가 선택한 회사 ID |
| `contacts` | string[] | 예 | 불가 | UUID 배열, 최소 1개 | 사용자가 선택한 담당자 ID |
| `products` | string[] | 아니오 | 불가 | UUID 배열 | 사용자가 선택한 제품 ID |
| `deals` | string[] | 아니오 | 불가 | UUID 배열 | 사용자가 선택한 딜 ID |

### Request 예시

```json
{
  "text": "오늘 가격 조건과 도입 일정을 논의했습니다. 다음 주 화요일에 제안서를 보내고 보안 검토 자료를 함께 전달하기로 했습니다.",
  "meetingLocalDateTime": "2026-06-18T14:00",
  "companies": ["00000000-0000-4000-8000-000000000001"],
  "contacts": ["00000000-0000-4000-8000-000000000002"],
  "products": ["00000000-0000-4000-8000-000000000003"],
  "deals": ["00000000-0000-4000-8000-000000000004"]
}
```

### Response 예시

```json
{
  "sourceType": "TEXT_AI",
  "transcript": null,
  "details": "가격 조건과 도입 일정을 논의했으며, 보안 검토 자료가 추가로 필요하다는 점을 확인했습니다.",
  "nextPlan": "다음 주 화요일에 제안서를 전달하고 후속 미팅 일정을 조율합니다.",
  "requiredAction": "제안서와 보안 검토 자료를 준비해 담당자에게 전달합니다."
}
```

## 4. POST /api/meeting-notes/stt-draft

- API 이름: 회의록 음성 STT+AI 초안 생성 API
- API 식별자: `CreateMeetingNoteSttAiDraft`
- Request DTO: `CreateMeetingNoteSttAiDraftDto`
- Response DTO: `MeetingNoteAiDraftResponse`
- Success Status: `200 OK`
- Content-Type: `multipart/form-data`
- Provider flow: `MeetingNoteSttProvider.transcribe` -> `MeetingNoteAiDraftProvider.createTextDraft`

### Multipart Field

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `audio` | file | 예 | 최대 25MB, audio 계열 mime type | STT 대상 음성 파일 |
| `meetingLocalDateTime` | string | 예 | local date-time | 사용자가 선택한 회의 일시 |
| `companies` | string 또는 string[] | 예 | UUID, 최소 1개 | 반복 field 또는 comma-separated 허용 |
| `contacts` | string 또는 string[] | 예 | UUID, 최소 1개 | 반복 field 또는 comma-separated 허용 |
| `products` | string 또는 string[] | 아니오 | UUID | 반복 field 또는 comma-separated 허용 |
| `deals` | string 또는 string[] | 아니오 | UUID | 반복 field 또는 comma-separated 허용 |

### Request 예시

```text
POST /api/meeting-notes/stt-draft
Content-Type: multipart/form-data

audio=@meeting.webm
meetingLocalDateTime=2026-06-18T14:00
companies=00000000-0000-4000-8000-000000000001
contacts=00000000-0000-4000-8000-000000000002
products=00000000-0000-4000-8000-000000000003
deals=00000000-0000-4000-8000-000000000004
```

### Response 예시

```json
{
  "sourceType": "STT_AI",
  "transcript": "오늘 가격 조건과 도입 일정을 논의했습니다. 다음 주 화요일에 제안서를 보내기로 했습니다.",
  "details": "가격 조건과 도입 일정을 논의했고, 제안서 전달 일정이 확정되었습니다.",
  "nextPlan": "다음 주 화요일에 제안서를 전달합니다.",
  "requiredAction": "제안서와 보안 검토 자료를 준비합니다."
}
```

## 5. 최종 저장 연계

### 직접 작성 저장

AI/STT를 사용하지 않는 직접 작성 경로는 기존 회의록 생성 form을 그대로 사용한다. 이 경로에서는 초안 API를 호출하지 않는다.

```json
{
  "sourceType": "MANUAL",
  "meetingLocalDateTime": "2026-06-18T14:00",
  "details": "가격 조건과 도입 일정을 논의했습니다.",
  "nextPlan": "다음 주 화요일에 제안서를 전달합니다.",
  "requiredAction": "보안 검토 자료를 준비합니다.",
  "companies": ["00000000-0000-4000-8000-000000000001"],
  "contacts": ["00000000-0000-4000-8000-000000000002"],
  "products": ["00000000-0000-4000-8000-000000000003"],
  "deals": ["00000000-0000-4000-8000-000000000004"]
}
```

### AI/STT 초안 저장

초안 생성 후 Frontend는 사용자가 수정할 수 있는 form field에 값을 채운 뒤 기존 회의록 생성 API를 호출한다.

```json
{
  "sourceType": "STT_AI",
  "meetingLocalDateTime": "2026-06-18T14:00",
  "details": "가격 조건과 도입 일정을 논의했고, 제안서 전달 일정이 확정되었습니다.",
  "nextPlan": "다음 주 화요일에 제안서를 전달합니다.",
  "requiredAction": "제안서와 보안 검토 자료를 준비합니다.",
  "companies": ["00000000-0000-4000-8000-000000000001"],
  "contacts": ["00000000-0000-4000-8000-000000000002"],
  "products": ["00000000-0000-4000-8000-000000000003"],
  "deals": ["00000000-0000-4000-8000-000000000004"]
}
```

Backend는 최종 저장 시 `sourceType`은 저장하지만 `transcript`와 provider raw response는 저장하지 않는다.

Backend 생성 DTO는 `MANUAL`, `TEXT_AI`, `STT_AI`를 받을 수 있다. User Web `CreateMeetingNoteInput`과 저장 변환 로직도 초안 결과의 `sourceType`을 최종 저장 요청에 전달한다.

## 6. 저장 후 딜 연동

회의록과 영업 딜 연동은 최종 저장 이후의 별도 흐름이다.

- 회의록 저장 전 AI/STT 초안 API가 딜 활동기록을 만들지 않는다.
- 회의록 저장 후 `영업 딜과 연동` 액션에서 딜을 선택한다.
- 연결 성공 후 딜 상세 활동기록에는 회의록 링크와 요약을 표시한다.
- 현재 구현은 별도 `DealActivity` table을 만들지 않고 기존 딜 상세의 활동 로그 저장소인 `DealFollowingActionLog`를 재사용한다.
- 같은 회의록에 이미 연결된 딜은 중복 생성하지 않고 건너뛴다.
- 연결 row는 `MeetingNoteDeal`에 추가하며, 회의록 작성 시점의 딜 snapshot을 저장한다.

### POST /api/meeting-notes/:meetingNoteId/deals

- API 이름: 저장된 회의록 딜 추가 연동 API
- API 식별자: `LinkMeetingNoteDeals`
- Request DTO: `LinkMeetingNoteDealsDto`
- Success Status: `200 OK`
- Response DTO: `MeetingNoteResponse`
- Backend flow: `MeetingNoteApplicationService.linkMeetingNoteDeals`

### Body

| 필드 | 타입 | 필수 | nullable | validation | 설명 |
|---|---|---:|---:|---|---|
| `deals` | string[] | 예 | 불가 | UUID 배열, 최소 1개 | 회의록에 추가 연결할 딜 ID 목록 |

### Request 예시

```json
{
  "deals": ["00000000-0000-4000-8000-000000000004"]
}
```

### 처리 결과

- Backend는 `currentUser.id` 기준으로 회의록과 딜 ownership을 검증한다.
- 신규 연결 딜마다 `MeetingNoteDeal` row를 생성한다.
- 신규 연결 딜마다 `DealFollowingActionLog` row를 생성한다.
- 활동 로그의 `followingAction`에는 회의록 날짜, 회의록 상세 링크, 회의록 요약 snippet을 저장한다.
- 응답은 갱신된 회의록 상세 payload다.

## 7. Error

| 상황 | error code | HTTP | FE 처리 |
|---|---|---:|---|
| 인증 없음 | `Unauthorized` | 401 | refresh 또는 로그인 이동 |
| DTO validation 실패 | validation error | 400 | form field error 또는 toast |
| 음성 파일 없음 | `ValidationError` | 400 | 파일 선택 안내 |
| 선택 회사 없음 또는 타 사용자 소유 | `CompanyNotFound` | 404 | 선택값 새로고침 안내 |
| 선택 담당자 없음 또는 타 사용자 소유 | `ContactNotFound` | 404 | 선택값 새로고침 안내 |
| 선택 제품 없음 또는 타 사용자 소유 | `ProductNotFound` | 404 | 선택값 새로고침 안내 |
| 선택 딜 없음 또는 타 사용자 소유 | `DealNotFound` | 404 | 선택값 새로고침 안내 |
| 회의록 없음 또는 타 사용자 소유 | `MeetingNoteNotFound` | 404 | 목록 새로고침 또는 접근 불가 안내 |
| Provider 설정 누락 | `MeetingNoteAiDraftProviderUnavailable` | 503 | 관리자 설정 필요 안내 |
| Provider 호출 또는 응답 파싱 실패 | `MeetingNoteAiDraftFailed` | 502 | 잠시 후 재시도 안내 |

## 8. Transaction

- transaction 필요 여부: 없음
- 이유: 초안 생성 API는 DB write가 없고 provider 호출 결과를 저장하지 않는다.
- 변경 model: 없음
- rollback 범위: 없음
- audit log transaction 포함 여부: 없음
- 외부 Provider 호출 위치: application service에서 ownership 검증 후 provider port 호출, DB transaction 밖
- 최종 저장 API `POST /api/meeting-notes`는 기존 회의록 저장 transaction을 그대로 사용한다.
- 딜 추가 연동 API `POST /api/meeting-notes/:meetingNoteId/deals`는 `MeetingNoteDeal` 생성과 `DealFollowingActionLog` 생성을 같은 transaction 안에서 처리한다.

## 9. Observability

- application log event key: 초안 성공 로그 없음
- AI provider 실패 event key: `provider.openai.meetingNoteDraft.failed`
- STT provider 실패 event key: `provider.openai.meetingNoteStt.failed`
- audit log: 없음
- request id: 기존 middleware 기준 사용
- redaction: `text`, `transcript`, `details`, `nextPlan`, `requiredAction`, 음성 파일 내용, provider raw response는 로그에 남기지 않는다.
- provider error context: provider, operation, statusCode, retryable만 허용한다.
- DB 로그 테이블 없음

## 10. DB Schema 연결

- 신규 table: 없음
- 신규 column: 없음
- 신규 migration: 없음
- 조회 model: `Company`, `Contact`, `Product`, `Deal`
- 최종 저장 model: 기존 `MeetingNote`, `MeetingNoteCompany`, `MeetingNoteContact`, `MeetingNoteProduct`, `MeetingNoteDeal`
- 저장 후 딜 추가 연동 model: 기존 `MeetingNoteDeal`, `DealFollowingActionLog`
- `MeetingNote.sourceType`: 최종 저장 시 `MANUAL`, `TEXT_AI`, `STT_AI` 허용
- `MeetingNote.rawText`: 이번 범위에서는 저장하지 않음
