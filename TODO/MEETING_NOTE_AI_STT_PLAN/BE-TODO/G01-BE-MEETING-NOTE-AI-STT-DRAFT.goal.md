# /goal G01-BE-MEETING-NOTE-AI-STT-DRAFT

## 1. Goal

?뚯쓽濡?AI/STT 珥덉븞 ?앹꽦 Backend API瑜?援ы쁽?쒕떎.

## 2. 癒쇱? ?쎌쓣 臾몄꽌

- `TODO/MEETING_NOTE_AI_STT_PLAN/README.md`
- `TODO/MEETING_NOTE_AI_STT_PLAN/COMMON/API-SPEC/MEETING_NOTE_AI_STT_API.md`
- `TODO/MEETING_NOTE_AI_STT_PLAN/BE-TODO/DB-SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`

## 3. ?묒뾽 泥댄겕由ъ뒪??
- [x] `MeetingNoteAiDraftProvider` application port ?뺤쓽
- [x] `MeetingNoteAiDraftApplicationService` 援ы쁽
- [x] OpenAI provider adapter 援ы쁽
- [x] `POST /api/meeting-notes/ai-draft` controller route 異붽?
- [x] `POST /api/meeting-notes/stt-draft` controller route 異붽?
- [x] AI/STT 珥덉븞 DTO 異붽?
- [x] `MeetingNoteModule` DI ?깅줉
- [x] `.env.example` provider ?ㅼ젙 異붽?
- [x] 理쒖쥌 ???API?먯꽌 `TEXT_AI`, `STT_AI` sourceType ?덉슜
- [x] 愿??application/controller ?뚯뒪??異붽?
- [x] typecheck? 愿???뚯뒪???ㅽ뻾

## 4. 援ы쁽 API

- `POST /api/meeting-notes/ai-draft`
- `POST /api/meeting-notes/stt-draft`
- 湲곗〈 `POST /api/meeting-notes` sourceType ???踰붿쐞 ?뺤옣

## 5. Acceptance Criteria

- ?뚯궗, ?대떦?? ?쒗뭹, ?? ?뚯쓽 ?쇱떆???ъ슜?먭? ?좏깮??媛믩쭔 ?ъ슜?쒕떎.
- AI/STT??`details`, `nextPlan`, `requiredAction`留??앹꽦?쒕떎.
- 珥덉븞 API??DB write瑜??섏? ?딅뒗??
- ?뚯꽦 ?뚯씪???녾굅??吏?먰븯吏 ?딅뒗 ??낆씠硫?400??諛섑솚?쒕떎.
- provider env媛 ?놁쑝硫?503??諛섑솚?쒕떎.
- provider ?ㅽ뙣??502瑜?諛섑솚?쒕떎.
- provider ?ㅽ뙣 濡쒓렇?먮뒗 ?뚯쓽 蹂몃Ц, transcript, ?뚯꽦 ?댁슜???ы븿?섏? ?딅뒗??

## 6. 寃利?
- `pnpm.cmd run typecheck`
- `pnpm.cmd test -- meeting-note-ai-draft-application.service.spec.ts meeting-note.controller.spec.ts`
