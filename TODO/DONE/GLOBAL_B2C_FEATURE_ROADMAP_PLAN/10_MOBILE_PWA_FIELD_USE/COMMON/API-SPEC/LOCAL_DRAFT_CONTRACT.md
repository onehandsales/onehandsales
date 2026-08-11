# Local Draft Contract

상태: Confirmed

## 1. 목적

모바일 현장 입력 중 화면 이탈, 브라우저 종료, 네트워크 불안정이 발생해도 사용자가 작성 중인 명함 확인 form과 회의록 작성 form을 24시간 복구할 수 있게 한다.

## 2. API 계약

서버 API 없음.

10번에서는 `UserDraft`, `/api/drafts/*`, server draft sync를 만들지 않는다.

## 3. Storage

Primary: IndexedDB

Fallback: IndexedDB를 사용할 수 없는 브라우저에서만 `localStorage`

Storage key:

```ts
type LocalDraftKey =
  | `mobile-business-card-confirm:${userScopedHash}:${scanLogId}`
  | `mobile-meeting-note-create:${userScopedHash}:${clientDraftId}`;
```

`userScopedHash`는 client가 실제 `userId`를 그대로 노출하지 않도록 session-local salt로 만든 hash다. server request에 전송하지 않는다.

## 4. Draft Envelope

```ts
type MobileLocalDraftEnvelope<TPayload> = {
  schemaVersion: 1;
  draftType: "BUSINESS_CARD_CONFIRM" | "MEETING_NOTE_CREATE";
  draftKey: string;
  savedAt: string;
  expiresAt: string;
  payload: TPayload;
};
```

TTL:

- 저장 시점 기준 24시간
- 저장, 버리기, 만료 시 즉시 삭제
- schemaVersion mismatch 시 restore하지 않고 삭제

## 5. Payload

### 5.1 BusinessCard Confirm Payload

```ts
type BusinessCardConfirmLocalDraftPayload = {
  scanLogId: string;
  companyName?: string;
  contactName?: string;
  department?: string;
  position?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  address?: string;
  homepage?: string;
  memo?: string;
};
```

저장 금지:

- image file/blob/base64
- provider raw response
- OCR raw text
- access token

### 5.2 MeetingNote Create Payload

```ts
type MeetingNoteCreateLocalDraftPayload = {
  clientDraftId: string;
  meetingLocalDateTime?: string;
  companyIds?: string[];
  contactIds?: string[];
  dealIds?: string[];
  productIds?: string[];
  title?: string;
  summary?: string;
  details?: string;
  nextPlan?: string;
  requiredAction?: string;
};
```

저장 금지:

- audio file/blob/base64
- transcript 전문
- provider raw response
- prompt
- access token

## 6. Request/Response

서버 request/response 없음.

FE local API:

```ts
type RestorePromptResponse = "RESTORE" | "DISCARD";

type LocalDraftSaveResult = {
  saved: true;
  expiresAt: string;
};

type LocalDraftLoadResult<TPayload> =
  | { found: true; draft: MobileLocalDraftEnvelope<TPayload> }
  | { found: false; reason: "NOT_FOUND" | "EXPIRED" | "VERSION_MISMATCH" };
```

## 7. Backend Business Logic

Backend runtime logic 없음.

명시적 금지:

- local draft 저장 API 생성 금지
- local draft DB model/table 생성 금지
- draft payload audit log 생성 금지
- audio/image 임시 저장 API 생성 금지

## 8. Frontend Business Logic

1. form 값이 변경되면 debounce 후 local draft를 저장한다.
2. 화면 진입 시 유효한 draft가 있으면 복구 prompt를 띄운다.
3. prompt copy:
   - 제목: `작성 중이던 내용을 불러올까요?`
   - 버튼: `불러오기`, `버리기`
4. `불러오기` 선택 시 form에 payload를 복구하고 `local_draft_restored` event를 남긴다.
5. `버리기` 선택 시 draft를 삭제하고 `local_draft_discarded` event를 남긴다.
6. 저장 성공 시 draft를 삭제한다.
7. 만료된 draft는 사용자에게 복구 prompt를 띄우지 않고 삭제한다.

## 9. DB/Prisma

신규 DB model 없음.

명시적으로 만들지 않는 것:

- `UserDraft`
- draft version table
- local draft audit table
- audio/image temporary storage table

## 10. User Flow

BusinessCard:

1. OCR 성공 후 confirm form에 진입한다.
2. 사용자가 값을 수정하면 local draft가 자동 저장된다.
3. 24시간 안에 재진입하면 복구 prompt가 뜬다.
4. 저장 또는 버리기 이후 draft는 삭제된다.

MeetingNote:

1. STT draft 또는 직접 작성 화면에 진입한다.
2. 사용자가 초안을 수정하면 local draft가 자동 저장된다.
3. 24시간 안에 재진입하면 복구 prompt가 뜬다.
4. 저장 또는 버리기 이후 draft는 삭제된다.

## 11. Observability

Client analytics event만 남긴다.

- `local_draft_saved`
- `local_draft_restored`
- `local_draft_discarded`

Payload에는 form text 값을 넣지 않는다.

## 12. Tests

Frontend unit/integration:

- save/load/discard/expiry
- schemaVersion mismatch delete
- IndexedDB unavailable fallback
- BusinessCard save success 후 delete
- MeetingNote save success 후 delete
- payload 금지 필드 미포함

E2E:

- mobile viewport에서 작성 중 이탈 후 restore prompt
- `불러오기`/`버리기` 동작 확인
