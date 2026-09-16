-- 기능 : Workspace/Member/Team 기반 계정 구조 enum을 추가한다.
CREATE TYPE "WorkspaceKind" AS ENUM (
  'PERSONAL',
  'ORGANIZATION'
);

CREATE TYPE "WorkspaceMemberRole" AS ENUM (
  'OWNER',
  'ADMIN',
  'MEMBER'
);

CREATE TYPE "TeamType" AS ENUM (
  'DEFAULT',
  'DEPARTMENT',
  'PROJECT'
);

CREATE TYPE "TeamMemberRole" AS ENUM (
  'MANAGER',
  'MEMBER'
);

-- 기능 : B2C 개인/개인사업자 또는 B2B 조직이 사용하는 최상위 작업 공간을 저장한다.
CREATE TABLE "Workspace" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "kind" "WorkspaceKind" NOT NULL,
  "organizationName" TEXT,
  "organizationDomain" TEXT,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- 기능 : User가 특정 Workspace에 참여한 멤버십과 워크스페이스 단위 역할을 저장한다.
CREATE TABLE "WorkspaceMember" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "workspaceId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "role" "WorkspaceMemberRole" NOT NULL DEFAULT 'MEMBER',
  "joinedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("id")
);

-- 기능 : Workspace 안에서 멤버를 부서, 프로젝트, 기본 업무공간 단위로 묶는 그룹을 저장한다.
CREATE TABLE "Team" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "workspaceId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "teamType" "TeamType" NOT NULL DEFAULT 'DEPARTMENT',
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- 기능 : WorkspaceMember와 Team의 다대다 연결과 팀 안에서의 역할을 저장한다.
CREATE TABLE "TeamMember" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "workspaceId" UUID NOT NULL,
  "teamId" UUID NOT NULL,
  "workspaceMemberId" UUID NOT NULL,
  "role" "TeamMemberRole" NOT NULL DEFAULT 'MEMBER',
  "joinedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- 기능 : Workspace 조회와 personal/organization 분류 조회를 빠르게 만든다.
CREATE INDEX "Workspace_kind_idx"
  ON "Workspace"("kind");

-- 기능 : 한 User는 같은 Workspace에 한 번만 멤버로 참여할 수 있다.
CREATE UNIQUE INDEX "WorkspaceMember_workspaceId_userId_key"
  ON "WorkspaceMember"("workspaceId", "userId");

-- 기능 : TeamMember 복합 FK가 같은 Workspace 안의 WorkspaceMember만 참조하게 한다.
CREATE UNIQUE INDEX "WorkspaceMember_id_workspaceId_key"
  ON "WorkspaceMember"("id", "workspaceId");

CREATE INDEX "WorkspaceMember_workspaceId_idx"
  ON "WorkspaceMember"("workspaceId");

CREATE INDEX "WorkspaceMember_userId_idx"
  ON "WorkspaceMember"("userId");

-- 기능 : 같은 Workspace 안에서 Team 이름은 중복되지 않는다.
CREATE UNIQUE INDEX "Team_workspaceId_name_key"
  ON "Team"("workspaceId", "name");

-- 기능 : TeamMember 복합 FK가 같은 Workspace 안의 Team만 참조하게 한다.
CREATE UNIQUE INDEX "Team_id_workspaceId_key"
  ON "Team"("id", "workspaceId");

-- 기능 : 한 Workspace에는 기본 Team을 최대 하나만 둘 수 있다.
CREATE UNIQUE INDEX "Team_oneDefaultPerWorkspace_key"
  ON "Team"("workspaceId")
  WHERE "isDefault" = true;

CREATE INDEX "Team_workspaceId_idx"
  ON "Team"("workspaceId");

-- 기능 : 한 Team에 같은 WorkspaceMember가 중복으로 들어갈 수 없다.
CREATE UNIQUE INDEX "TeamMember_teamId_workspaceMemberId_key"
  ON "TeamMember"("teamId", "workspaceMemberId");

CREATE INDEX "TeamMember_workspaceId_idx"
  ON "TeamMember"("workspaceId");

CREATE INDEX "TeamMember_teamId_idx"
  ON "TeamMember"("teamId");

CREATE INDEX "TeamMember_workspaceMemberId_idx"
  ON "TeamMember"("workspaceMemberId");

-- 기능 : WorkspaceMember는 Workspace와 User를 연결한다.
ALTER TABLE "WorkspaceMember"
  ADD CONSTRAINT "WorkspaceMember_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkspaceMember"
  ADD CONSTRAINT "WorkspaceMember_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 기능 : Team은 하나의 Workspace 안에 속한다.
ALTER TABLE "Team"
  ADD CONSTRAINT "Team_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 기능 : TeamMember는 Workspace, Team, WorkspaceMember를 같은 Workspace 안에서 연결한다.
ALTER TABLE "TeamMember"
  ADD CONSTRAINT "TeamMember_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TeamMember"
  ADD CONSTRAINT "TeamMember_teamId_workspaceId_fkey"
  FOREIGN KEY ("teamId", "workspaceId") REFERENCES "Team"("id", "workspaceId") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TeamMember"
  ADD CONSTRAINT "TeamMember_workspaceMemberId_workspaceId_fkey"
  FOREIGN KEY ("workspaceMemberId", "workspaceId") REFERENCES "WorkspaceMember"("id", "workspaceId") ON DELETE CASCADE ON UPDATE CASCADE;

COMMENT ON TYPE "WorkspaceKind" IS 'Workspace 소유/운영 주체 구분.';
COMMENT ON TYPE "WorkspaceMemberRole" IS 'Workspace 전체 단위 멤버 역할.';
COMMENT ON TYPE "TeamType" IS 'Workspace 안 Team의 사용 목적.';
COMMENT ON TYPE "TeamMemberRole" IS 'Team 안에서의 멤버 역할.';

COMMENT ON TABLE "Workspace" IS 'B2C 개인/개인사업자 또는 B2B 조직이 사용하는 최상위 작업 공간.';
COMMENT ON COLUMN "Workspace"."id" IS 'Workspace row의 고유 식별자.';
COMMENT ON COLUMN "Workspace"."name" IS '사용자에게 보이는 Workspace 이름.';
COMMENT ON COLUMN "Workspace"."kind" IS 'PERSONAL 또는 ORGANIZATION.';
COMMENT ON COLUMN "Workspace"."organizationName" IS 'B2B 조직 Workspace일 때 회사/조직 이름.';
COMMENT ON COLUMN "Workspace"."organizationDomain" IS 'B2B 조직 Workspace일 때 회사 도메인.';
COMMENT ON COLUMN "Workspace"."createdAt" IS 'Workspace 생성 시각.';
COMMENT ON COLUMN "Workspace"."updatedAt" IS 'Workspace row 수정 시각.';

COMMENT ON TABLE "WorkspaceMember" IS 'User가 특정 Workspace에 참여한 멤버십과 Workspace 단위 역할.';
COMMENT ON COLUMN "WorkspaceMember"."id" IS 'WorkspaceMember row의 고유 식별자.';
COMMENT ON COLUMN "WorkspaceMember"."workspaceId" IS '참여한 Workspace ID.';
COMMENT ON COLUMN "WorkspaceMember"."userId" IS '참여한 User ID.';
COMMENT ON COLUMN "WorkspaceMember"."role" IS 'Workspace 전체 역할. OWNER, ADMIN, MEMBER.';
COMMENT ON COLUMN "WorkspaceMember"."joinedAt" IS 'Workspace 참여 시각.';
COMMENT ON COLUMN "WorkspaceMember"."createdAt" IS 'WorkspaceMember 생성 시각.';
COMMENT ON COLUMN "WorkspaceMember"."updatedAt" IS 'WorkspaceMember row 수정 시각.';

COMMENT ON TABLE "Team" IS 'Workspace 안에서 멤버를 부서, 프로젝트, 기본 업무공간 단위로 묶는 그룹.';
COMMENT ON COLUMN "Team"."id" IS 'Team row의 고유 식별자.';
COMMENT ON COLUMN "Team"."workspaceId" IS 'Team이 속한 Workspace ID.';
COMMENT ON COLUMN "Team"."name" IS '사용자에게 보이는 Team 이름.';
COMMENT ON COLUMN "Team"."description" IS 'Team 설명.';
COMMENT ON COLUMN "Team"."teamType" IS 'DEFAULT, DEPARTMENT, PROJECT.';
COMMENT ON COLUMN "Team"."isDefault" IS 'Workspace 기본 Team 여부.';
COMMENT ON COLUMN "Team"."createdAt" IS 'Team 생성 시각.';
COMMENT ON COLUMN "Team"."updatedAt" IS 'Team row 수정 시각.';

COMMENT ON TABLE "TeamMember" IS 'WorkspaceMember와 Team의 다대다 연결과 Team 안에서의 역할.';
COMMENT ON COLUMN "TeamMember"."id" IS 'TeamMember row의 고유 식별자.';
COMMENT ON COLUMN "TeamMember"."workspaceId" IS '연결이 속한 Workspace ID.';
COMMENT ON COLUMN "TeamMember"."teamId" IS '참여한 Team ID.';
COMMENT ON COLUMN "TeamMember"."workspaceMemberId" IS 'Team에 참여한 WorkspaceMember ID.';
COMMENT ON COLUMN "TeamMember"."role" IS 'Team 안에서의 역할. MANAGER, MEMBER.';
COMMENT ON COLUMN "TeamMember"."joinedAt" IS 'Team 참여 시각.';
COMMENT ON COLUMN "TeamMember"."createdAt" IS 'TeamMember 생성 시각.';
COMMENT ON COLUMN "TeamMember"."updatedAt" IS 'TeamMember row 수정 시각.';

COMMENT ON INDEX "Workspace_kind_idx" IS 'Workspace kind별 조회에 사용한다.';
COMMENT ON INDEX "WorkspaceMember_workspaceId_userId_key" IS '한 User가 같은 Workspace에 중복 참여하지 않게 한다.';
COMMENT ON INDEX "WorkspaceMember_id_workspaceId_key" IS 'TeamMember가 같은 Workspace 안의 WorkspaceMember만 참조하게 하는 복합 FK 대상.';
COMMENT ON INDEX "WorkspaceMember_workspaceId_idx" IS 'Workspace별 멤버 조회에 사용한다.';
COMMENT ON INDEX "WorkspaceMember_userId_idx" IS 'User별 Workspace 멤버십 조회에 사용한다.';
COMMENT ON INDEX "Team_workspaceId_name_key" IS '같은 Workspace 안 Team 이름 중복을 막는다.';
COMMENT ON INDEX "Team_id_workspaceId_key" IS 'TeamMember가 같은 Workspace 안의 Team만 참조하게 하는 복합 FK 대상.';
COMMENT ON INDEX "Team_oneDefaultPerWorkspace_key" IS '한 Workspace에는 기본 Team을 최대 하나만 둘 수 있게 한다.';
COMMENT ON INDEX "Team_workspaceId_idx" IS 'Workspace별 Team 조회에 사용한다.';
COMMENT ON INDEX "TeamMember_teamId_workspaceMemberId_key" IS '한 Team에 같은 WorkspaceMember가 중복 참여하지 않게 한다.';
COMMENT ON INDEX "TeamMember_workspaceId_idx" IS 'Workspace별 TeamMember 조회에 사용한다.';
COMMENT ON INDEX "TeamMember_teamId_idx" IS 'Team별 멤버 조회에 사용한다.';
COMMENT ON INDEX "TeamMember_workspaceMemberId_idx" IS 'WorkspaceMember별 Team 참여 조회에 사용한다.';
