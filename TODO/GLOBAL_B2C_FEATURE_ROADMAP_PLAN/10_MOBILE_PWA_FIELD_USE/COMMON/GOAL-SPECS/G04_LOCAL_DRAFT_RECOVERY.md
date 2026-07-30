# G04 Local Draft Recovery

상태: Ready

## 1. 목적

모바일 명함 확인 form과 회의록 작성 form에서 작성 중 이탈이 발생해도 24시간 안에 내용을 복구할 수 있게 한다.

## 2. 포함 범위

- client local draft utility/hook
- IndexedDB primary, localStorage fallback
- BusinessCard confirm form 연동
- MeetingNote create form 연동
- restore prompt
- save/discard/expiry tests

## 3. 제외 범위

- `UserDraft` DB model
- `/api/drafts/*`
- cross-device sync
- offline mutation queue
- image/audio blob local draft 저장

## 4. Request 계약

서버 request 없음.

FE local request:

```ts
type SaveMobileLocalDraftRequest<TPayload> = {
  draftType: "BUSINESS_CARD_CONFIRM" | "MEETING_NOTE_CREATE";
  draftKey: string;
  payload: TPayload;
};
```

## 5. Response 계약

서버 response 없음.

FE local response:

```ts
type LocalDraftLoadResult<TPayload> =
  | { found: true; draft: MobileLocalDraftEnvelope<TPayload> }
  | { found: false; reason: "NOT_FOUND" | "EXPIRED" | "VERSION_MISMATCH" };
```

Restore prompt 결과:

```ts
type RestorePromptResponse = "RESTORE" | "DISCARD";
```

## 6. Backend Business Logic

Backend runtime logic 없음.

명시적 backend 금지:

- local draft 저장 API 생성 금지
- draft audit table 생성 금지
- image/audio 임시 저장 금지

## 7. User Flow

BusinessCard:

1. OCR 성공 후 confirm form에 진입한다.
2. 사용자가 field를 수정하면 debounce 저장한다.
3. 같은 scanLogId로 24시간 안에 재진입하면 restore prompt를 띄운다.
4. 사용자가 `불러오기`를 누르면 form에 복구한다.
5. 사용자가 `버리기` 또는 저장 성공을 선택하면 draft를 삭제한다.

MeetingNote:

1. STT draft 성공 또는 직접 작성으로 form에 진입한다.
2. 사용자가 field를 수정하면 debounce 저장한다.
3. 24시간 안에 재진입하면 restore prompt를 띄운다.
4. 저장 성공 또는 버리기 선택 시 draft를 삭제한다.

## 8. DB/Prisma 영향

신규 DB migration 없음.

DB 저장 금지:

- local draft payload
- audio/image file
- transcript raw text
- provider raw response

## 9. 코드 주석 기준

Frontend:

- local draft storage utility, hook, restore prompt component에 `// 기능 : ...`
- 복구/삭제 판단이 복잡한 helper에는 짧은 한국어 설명 주석 추가

Backend:

- 코드 변경 없음

## 10. 검증

권장 command:

```powershell
pnpm --dir FE/user-web test -- local-draft
pnpm --dir FE/user-web test -- business-card
pnpm --dir FE/user-web test -- meeting-note
pnpm --dir FE/user-web test:e2e -- mobile-local-draft
```

## 11. Goal 검토 체크리스트

- [ ] IndexedDB primary 구현이다.
- [ ] IndexedDB unavailable fallback이 있다.
- [ ] TTL은 저장 시점 기준 24시간이다.
- [ ] restore prompt copy가 `작성 중이던 내용을 불러올까요?`다.
- [ ] 버튼은 `불러오기`, `버리기`다.
- [ ] 저장 성공/버리기/만료/schema mismatch 시 draft를 삭제한다.
- [ ] image/audio blob/base64를 저장하지 않는다.
- [ ] transcript 전문/provider raw response를 저장하지 않는다.
- [ ] server draft API/DB를 만들지 않았다.
- [ ] local draft analytics payload에 form text가 없다.
- [ ] DB 추가/생성 없이 client local draft만 구현했다.
- [ ] 새로 만들거나 의미 있게 수정한 공개 함수/핵심 함수에 한국어 주석을 적용했다.
- [ ] Global B2C 개인 영업자 모바일 현장 업무 target을 벗어나지 않았다.
- [ ] UX/UI 변경 전 `AGENT/UXUI_AGENT` 기준을 확인했다.
- [ ] Software/architecture 변경 전 `AGENT/SOFTWARE_AGENT` 기준을 확인했다.
- [ ] FE/E2E targeted 검증 결과를 기록했다.
- [ ] `COMMON/GOAL-REVIEW-CHECKLIST.md`를 확인했다.

## 12. 실행 결과

구현 후 기록한다.
