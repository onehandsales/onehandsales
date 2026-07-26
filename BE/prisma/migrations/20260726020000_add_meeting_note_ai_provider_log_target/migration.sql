-- 기능 : MeetingNote AI/STT/다음 행동/follow-up draft provider 호출을 공통 AI 호출 operation으로 분류합니다.
ALTER TYPE "AiProviderOperation" ADD VALUE 'MEETING_NOTE_TEXT_DRAFT';
ALTER TYPE "AiProviderOperation" ADD VALUE 'MEETING_NOTE_STT_TRANSCRIPTION';
ALTER TYPE "AiProviderOperation" ADD VALUE 'MEETING_NOTE_STT_DRAFT';
ALTER TYPE "AiProviderOperation" ADD VALUE 'MEETING_NOTE_NEXT_ACTION_DRAFT';
ALTER TYPE "AiProviderOperation" ADD VALUE 'MEETING_NOTE_FOLLOW_UP_DRAFT';

-- 기능 : provider 호출이 어떤 업무 record 또는 저장 전 초안에서 발생했는지 추적합니다.
ALTER TABLE "AiProviderCallLog"
  ADD COLUMN "targetType" TEXT,
  ADD COLUMN "targetId" UUID;

COMMENT ON COLUMN "AiProviderCallLog"."targetType" IS 'provider 호출 대상 종류. 저장 전 회의록 초안은 MEETING_NOTE_DRAFT, 저장된 회의록 기반 기능은 MEETING_NOTE를 사용한다.';
COMMENT ON COLUMN "AiProviderCallLog"."targetId" IS 'provider 호출 대상 record ID. 저장 전 초안처럼 대상 record가 아직 없으면 null로 둔다.';

-- 기능 : 사용자별 회의록 provider 호출 이력을 대상 record 기준으로 조회합니다.
CREATE INDEX "AiProviderCallLog_userId_targetType_targetId_createdAt_idx"
  ON "AiProviderCallLog"("userId", "targetType", "targetId", "createdAt");

COMMENT ON INDEX "AiProviderCallLog_userId_targetType_targetId_createdAt_idx" IS '사용자별 MeetingNote AI/STT/next action/follow-up provider 호출을 대상 record 기준으로 추적하는 색인.';
