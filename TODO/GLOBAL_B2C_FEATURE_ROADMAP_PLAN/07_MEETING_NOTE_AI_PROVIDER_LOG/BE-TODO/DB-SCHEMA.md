# DB Schema TODO

상태: Confirmed
확정일: 2026-07-26

## 1. 목적

07은 새 전용 transcript/follow-up draft table을 만들지 않는다. 기존 `AiProviderCallLog`를 Global B2C 운영 기준에 맞게 확장한다.

실제 source of truth는 `BE/prisma/schema.prisma`와 신규 migration 파일이다.

## 2. Prisma 변경 범위

### 2.1 `AiProviderOperation` enum 추가

추가 후보:

```prisma
enum AiProviderOperation {
  WEEKLY_SALES_REPORT
  FOLLOW_UP_EMAIL_DRAFT
  FOLLOW_UP_SMS_DRAFT
  MEETING_NOTE_TEXT_DRAFT
  MEETING_NOTE_STT_TRANSCRIPTION
  MEETING_NOTE_STT_DRAFT
  MEETING_NOTE_NEXT_ACTION_DRAFT
  MEETING_NOTE_FOLLOW_UP_DRAFT
}
```

### 2.2 `AiProviderCallLog` target 연결 필드 추가

추가 후보:

```prisma
model AiProviderCallLog {
  // 기존 필드 유지

  /// 기능 : provider 호출 대상 종류입니다. 예: MEETING_NOTE, MEETING_NOTE_DRAFT.
  targetType String?

  /// 기능 : provider 호출 대상 ID입니다. 저장 전 초안처럼 대상 ID가 없으면 null입니다.
  targetId String? @db.Uuid

  @@index([userId, targetType, targetId, createdAt])
}
```

사용 기준:

| 흐름 | targetType | targetId |
|---|---|---|
| `/api/meeting-notes/ai-draft` | `MEETING_NOTE_DRAFT` | `null` |
| `/api/meeting-notes/stt-draft` | `MEETING_NOTE_DRAFT` | `null` |
| `/api/meeting-notes/:meetingNoteId/next-actions/draft` | `MEETING_NOTE` | `meetingNoteId` |
| `/api/meeting-notes/:meetingNoteId/follow-up-draft` | `MEETING_NOTE` | `meetingNoteId` |

## 3. 만들지 않는 모델

아래 모델은 07 1차에서 만들지 않는다.

- `MeetingNoteProviderCallLog`
- `MeetingNoteTranscript`
- `MeetingNoteActionSuggestion`
- `MeetingNoteFollowUpDraft`
- `AiDataCleanupSuggestion`

이유:

- 공통 `AiProviderCallLog`와 중복된다.
- transcript/follow-up body 원문 저장은 Global B2C 개인정보/삭제권 리스크가 크다.
- next action/follow-up은 후보/초안으로만 반환하고 사용자 확인 뒤 기존 업무 API로 저장한다.
- AI data cleanup은 1차 scope가 아니다.

## 4. Migration 기준

신규 migration에는 다음을 포함한다.

- `AiProviderOperation` enum value 추가
- `AiProviderCallLog.targetType`
- `AiProviderCallLog.targetId`
- `[userId, targetType, targetId, createdAt]` index
- table/column/index 의도를 설명하는 한글 SQL 주석 또는 `COMMENT ON`

예시:

```sql
-- 기능 : MeetingNote AI/STT provider 호출을 공통 AI 호출 로그 operation으로 분류합니다.
ALTER TYPE "AiProviderOperation" ADD VALUE 'MEETING_NOTE_TEXT_DRAFT';

-- 기능 : provider 호출이 어떤 업무 record와 연결됐는지 추적합니다.
ALTER TABLE "AiProviderCallLog" ADD COLUMN "targetType" TEXT;
ALTER TABLE "AiProviderCallLog" ADD COLUMN "targetId" UUID;
```

## 5. 저장 금지 데이터

`AiProviderCallLog.metadataJson`에도 아래 값은 저장하지 않는다.

- 회의록 원문
- STT transcript 원문
- 음성 파일
- provider raw response
- prompt 원문
- API key/token
- quota detail
- contact email/phone 원문

허용 metadata 예:

```json
{
  "source": "meeting_note_stt",
  "transcriptLength": 1240,
  "retryable": true,
  "selectedCompanyCount": 1,
  "selectedDealCount": 1
}
```

## 6. DB 운영 gate

신규 migration이 있으므로 goal 착수 전 `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/FIRST-SALE-GATE-MAP.md`의 DB/Prisma 운영 gate를 따른다.

금지:

- 적용된 migration 파일 수정
- 공유/운영성 DB에 무단 `prisma migrate dev`, `prisma migrate deploy`, seed 실행
- 실제 DB URL/secret 문서 기록
- API 계약 없이 table/column 추가
