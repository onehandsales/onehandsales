-- Ensure existing Actor rows can satisfy the new required relations before adding constraints.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "Actor"
    WHERE "workspaceMemberId" IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot require Actor.workspaceMemberId: NULL Actor.workspaceMemberId rows exist.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "Actor" AS actor
    LEFT JOIN "Workspace" AS workspace
      ON workspace."id" = actor."workspaceId"
    WHERE workspace."id" IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot add Actor.workspaceId foreign key: Actor rows reference missing Workspace rows.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "Actor" AS actor
    LEFT JOIN "WorkspaceMember" AS workspace_member
      ON workspace_member."id" = actor."workspaceMemberId"
     AND workspace_member."workspaceId" = actor."workspaceId"
    WHERE workspace_member."id" IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot add Actor.workspaceMember relation: Actor rows reference missing or cross-workspace WorkspaceMember rows.';
  END IF;
END $$;

ALTER TABLE "Actor"
  ALTER COLUMN "workspaceMemberId" SET NOT NULL;

ALTER TABLE "Actor"
  ADD CONSTRAINT "Actor_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Actor"
  ADD CONSTRAINT "Actor_workspaceMemberId_workspaceId_fkey"
  FOREIGN KEY ("workspaceMemberId", "workspaceId") REFERENCES "WorkspaceMember"("id", "workspaceId") ON DELETE CASCADE ON UPDATE CASCADE;
