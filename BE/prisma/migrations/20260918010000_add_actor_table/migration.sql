-- 기능 : Workspace 안 데이터 생성/수정 주체 종류 enum을 추가한다.
CREATE TYPE "ActorType" AS ENUM (
  'WORKSPACE_MEMBER',
  'SYSTEM',
  'API_TOKEN',
  'AUTOMATION'
);

-- 기능 : Workspace 안 데이터 생성/수정 주체를 저장한다.
CREATE TABLE "Actor" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "workspaceId" UUID NOT NULL,
  "type" "ActorType" NOT NULL,
  "workspaceMemberId" UUID,
  "systemKey" TEXT,
  "displayNameSnapshot" TEXT,
  "emailSnapshot" TEXT,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "Actor_pkey" PRIMARY KEY ("id")
);
