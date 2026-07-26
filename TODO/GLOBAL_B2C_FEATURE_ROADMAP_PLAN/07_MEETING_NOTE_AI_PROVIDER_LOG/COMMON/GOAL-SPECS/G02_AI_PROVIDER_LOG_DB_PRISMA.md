# G02 AI Provider Log DB Prisma

상태: Ready
목표: Meeting Note AI provider log를 위한 Prisma schema와 migration 구현

## 1. 목적

공통 `AiProviderCallLog`를 확장해 Meeting Note AI/STT/next action/follow-up draft 호출을 추적할 수 있게 한다.

## 2. 선행 조건

- G01 완료
- DB 운영 gate 확인

## 3. 포함 범위

- `AiProviderOperation` enum 값 추가
- `AiProviderCallLog.targetType` 추가
- `AiProviderCallLog.targetId` 추가
- `[userId, targetType, targetId, createdAt]` index 추가
- Prisma migration 생성
- schema/migration 한글 주석 또는 COMMENT

## 4. 제외 범위

- `MeetingNoteProviderCallLog` 별도 table
- `MeetingNoteTranscript` table
- `MeetingNoteFollowUpDraft` table
- AI data cleanup table
- Admin 조회 API
- Backend provider 호출 구현

## 5. Schema 계약

추가 enum:

```prisma
MEETING_NOTE_TEXT_DRAFT
MEETING_NOTE_STT_TRANSCRIPTION
MEETING_NOTE_STT_DRAFT
MEETING_NOTE_NEXT_ACTION_DRAFT
MEETING_NOTE_FOLLOW_UP_DRAFT
```

추가 field/index:

```prisma
/// 기능 : provider 호출이 특정 기능 record에서 발생했을 때 대상 타입을 기록합니다.
targetType String?

/// 기능 : provider 호출이 특정 기능 record에서 발생했을 때 대상 record ID를 기록합니다.
targetId String? @db.Uuid

@@index([userId, targetType, targetId, createdAt])
```

## 6. Migration 기준

- 기존 migration 파일을 수정하지 않는다.
- 새 migration 파일명은 의미가 드러나게 작성한다.
- SQL에 table/column/index 의도 주석 또는 `COMMENT ON`을 남긴다.
- 공유/운영성 DB에 무단 `migrate dev`, `migrate deploy`, `seed`를 실행하지 않는다.

## 7. 검증

```powershell
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
pnpm run typecheck
```

## 8. 완료 기준

- Prisma schema가 `BE-TODO/DB-SCHEMA.md`와 일치한다.
- Migration SQL이 schema 변경과 일치한다.
- raw text/transcript/follow-up draft 저장 table이 없다.
- `pnpm run prisma:validate`가 통과한다.
- `COMMON/GOAL-COMPLETION-CHECKLIST.md`의 G02 항목이 갱신됐다.
