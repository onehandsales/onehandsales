-- 기능 : ListDefinition 기반과 Object/List 공용 AttributeDefinition 소속 제약을 하나의 transaction으로 반영한다.
BEGIN;

-- 1. List Attribute의 FK 대상이 될 업무 List 기본 정의를 생성한다.
CREATE TABLE "ListDefinition" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" UUID NOT NULL,
    "createdByActorId" UUID NOT NULL,
    "updatedByActorId" UUID,
    "apiSlug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ListDefinition_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ListDefinition_id_workspaceId_key"
    ON "ListDefinition"("id", "workspaceId");
CREATE UNIQUE INDEX "ListDefinition_workspaceId_apiSlug_key"
    ON "ListDefinition"("workspaceId", "apiSlug");

ALTER TABLE "ListDefinition"
    ADD CONSTRAINT "ListDefinition_workspaceId_fkey"
    FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ListDefinition"
    ADD CONSTRAINT "ListDefinition_createdByActorId_fkey"
    FOREIGN KEY ("createdByActorId") REFERENCES "Actor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ListDefinition"
    ADD CONSTRAINT "ListDefinition_updatedByActorId_fkey"
    FOREIGN KEY ("updatedByActorId") REFERENCES "Actor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 2. 기존 Object Attribute는 그대로 두고 List 소속을 선택할 수 있도록 확장한다.
ALTER TABLE "AttributeDefinition"
    ADD COLUMN "listDefinitionId" UUID,
    ALTER COLUMN "objectDefinitionId" DROP NOT NULL;

-- 3. Object/List 중 정확히 한 소속만 허용한다. Prisma schema에서 표현할 수 없는 CHECK는 SQL로 관리한다.
ALTER TABLE "AttributeDefinition"
    ADD CONSTRAINT "AttributeDefinition_exactly_one_owner_check"
    CHECK (("objectDefinitionId" IS NOT NULL) <> ("listDefinitionId" IS NOT NULL));

ALTER TABLE "AttributeDefinition"
    ADD CONSTRAINT "AttributeDefinition_listDefinitionId_workspaceId_fkey"
    FOREIGN KEY ("listDefinitionId", "workspaceId")
    REFERENCES "ListDefinition"("id", "workspaceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. 기존 Object별 중복 제약과 인덱스를 유지하고 List별 중복 제약과 조회 인덱스를 추가한다.
CREATE UNIQUE INDEX "AttributeDefinition_listDefinitionId_apiSlug_key"
    ON "AttributeDefinition"("listDefinitionId", "apiSlug");
CREATE INDEX "AttributeDefinition_listDefinitionId_sortOrder_id_idx"
    ON "AttributeDefinition"("listDefinitionId", "sortOrder", "id");
CREATE INDEX "AttributeDefinition_workspaceId_listDefinitionId_id_idx"
    ON "AttributeDefinition"("workspaceId", "listDefinitionId", "id");

-- 5. 테이블, 컬럼, 제약과 인덱스의 역할을 DB 주석에 기록한다.
COMMENT ON TABLE "ListDefinition" IS 'Workspace 안에서 Record를 업무 맥락으로 묶을 List의 기본 정의. Entry와 값 저장 모델은 후속 설계 대상.';
COMMENT ON COLUMN "ListDefinition"."id" IS 'ListDefinition row의 고유 식별자.';
COMMENT ON COLUMN "ListDefinition"."workspaceId" IS 'ListDefinition이 속한 Workspace ID.';
COMMENT ON COLUMN "ListDefinition"."createdByActorId" IS 'ListDefinition을 생성한 Actor ID.';
COMMENT ON COLUMN "ListDefinition"."updatedByActorId" IS 'ListDefinition을 마지막으로 수정한 Actor ID.';
COMMENT ON COLUMN "ListDefinition"."apiSlug" IS 'Workspace 안에서 중복되지 않는 List 고유 이름.';
COMMENT ON COLUMN "ListDefinition"."name" IS '사용자에게 보여줄 List 이름.';
COMMENT ON COLUMN "ListDefinition"."description" IS 'List의 업무 목적을 설명하는 선택 입력값.';
COMMENT ON COLUMN "ListDefinition"."createdAt" IS 'ListDefinition 생성 시각. UTC instant로 저장.';
COMMENT ON COLUMN "ListDefinition"."updatedAt" IS 'ListDefinition row 수정 시각. Prisma에서 갱신하는 UTC instant.';
COMMENT ON TABLE "AttributeDefinition" IS 'ObjectDefinition 또는 ListDefinition 중 하나에 속하는 공용 필드 정의.';
COMMENT ON COLUMN "AttributeDefinition"."objectDefinitionId" IS 'Object 소속 Attribute의 ObjectDefinition ID. List 소속이면 null.';
COMMENT ON COLUMN "AttributeDefinition"."listDefinitionId" IS 'List 소속 Attribute의 ListDefinition ID. Object 소속이면 null.';
COMMENT ON CONSTRAINT "AttributeDefinition_exactly_one_owner_check" ON "AttributeDefinition"
    IS 'objectDefinitionId와 listDefinitionId 중 정확히 하나만 값이 있도록 보장한다.';
COMMENT ON CONSTRAINT "AttributeDefinition_listDefinitionId_workspaceId_fkey" ON "AttributeDefinition"
    IS 'List 소속 AttributeDefinition이 같은 Workspace의 ListDefinition만 참조하도록 보장한다.';
COMMENT ON INDEX "ListDefinition_id_workspaceId_key" IS '동일 Workspace List 참조를 위한 복합 FK 기준.';
COMMENT ON INDEX "ListDefinition_workspaceId_apiSlug_key" IS 'Workspace별 List apiSlug 중복 방지 및 조회.';
COMMENT ON INDEX "AttributeDefinition_listDefinitionId_apiSlug_key" IS 'List별 Attribute apiSlug 중복 방지.';
COMMENT ON INDEX "AttributeDefinition_listDefinitionId_sortOrder_id_idx" IS 'List 소속 Attribute의 정렬 조회 지원.';
COMMENT ON INDEX "AttributeDefinition_workspaceId_listDefinitionId_id_idx" IS 'Workspace/List 경계 안의 Attribute 조회 지원.';

COMMIT;
