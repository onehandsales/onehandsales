-- 사이드바의 기존 표시 순서를 보존하고 공통 순서 저장 컬럼을 추가합니다.
BEGIN;
SET LOCAL lock_timeout = '10s';
LOCK TABLE "ObjectDefinition", "ListDefinition", "ViewFavoriteDefinition" IN SHARE ROW EXCLUSIVE MODE;

ALTER TABLE "ObjectDefinition" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ListDefinition" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
COMMENT ON COLUMN "ObjectDefinition"."sortOrder" IS '같은 Workspace 사이드바 관리 항목의 공통 표시 순서';
COMMENT ON COLUMN "ListDefinition"."sortOrder" IS '같은 Workspace 사이드바 업무 목록의 공통 표시 순서';

WITH ranked AS (
  SELECT id, (row_number() OVER (PARTITION BY "workspaceId" ORDER BY "createdAt", id) - 1)::integer AS position
  FROM "ObjectDefinition"
)
UPDATE "ObjectDefinition" t SET "sortOrder" = ranked.position FROM ranked WHERE t.id = ranked.id;

WITH ranked AS (
  SELECT id, (row_number() OVER (PARTITION BY "workspaceId" ORDER BY "createdAt", id) - 1)::integer AS position
  FROM "ListDefinition"
)
UPDATE "ListDefinition" t SET "sortOrder" = ranked.position FROM ranked WHERE t.id = ranked.id;

-- 개인 즐겨찾기도 기존 순서를 유지합니다. 감사 시각/수정자와 View의 순서는 변경하지 않습니다.
WITH ranked AS (
  SELECT id, (row_number() OVER (PARTITION BY "workspaceId", "workspaceMemberId" ORDER BY "sortOrder", "createdAt", id) - 1)::integer AS position
  FROM "ViewFavoriteDefinition"
)
UPDATE "ViewFavoriteDefinition" t SET "sortOrder" = ranked.position
FROM ranked WHERE t.id = ranked.id AND t."sortOrder" IS DISTINCT FROM ranked.position;
COMMIT;
