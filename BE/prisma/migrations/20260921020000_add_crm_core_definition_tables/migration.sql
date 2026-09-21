-- 기능 : AttributeDefinition이 받을 값 형태를 구분한다.
CREATE TYPE "AttributeType" AS ENUM (
  'ActorReference',
  'Checkbox',
  'Currency',
  'Date',
  'Domain',
  'EmailAddress',
  'Interaction',
  'Location',
  'PersonalName',
  'Number',
  'PhoneNumber',
  'Rating',
  'RecordReference',
  'Select',
  'Status',
  'Text',
  'Timestamp'
);

-- 기능 : Workspace 안에서 회사, 고객, 매물 같은 관리 대상 타입을 저장한다.
CREATE TABLE "ObjectDefinition" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "workspaceId" UUID NOT NULL,
  "createdByActorId" UUID NOT NULL,
  "updatedByActorId" UUID,
  "apiSlug" TEXT NOT NULL,
  "singularName" TEXT NOT NULL,
  "pluralName" TEXT NOT NULL,
  "icon" TEXT,
  "description" TEXT,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "ObjectDefinition_pkey" PRIMARY KEY ("id")
);

-- 기능 : ObjectDefinition에 붙는 필드 정의를 저장한다.
CREATE TABLE "AttributeDefinition" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "workspaceId" UUID NOT NULL,
  "objectDefinitionId" UUID NOT NULL,
  "createdByActorId" UUID NOT NULL,
  "updatedByActorId" UUID,
  "apiSlug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "type" "AttributeType" NOT NULL,
  "isMultiselect" BOOLEAN NOT NULL DEFAULT false,
  "description" TEXT,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "AttributeDefinition_pkey" PRIMARY KEY ("id")
);

-- 기능 : ObjectDefinition의 실제 레코드 인스턴스를 저장한다.
CREATE TABLE "RecordDefinition" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "workspaceId" UUID NOT NULL,
  "objectDefinitionId" UUID NOT NULL,
  "createdByActorId" UUID NOT NULL,
  "updatedByActorId" UUID,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "RecordDefinition_pkey" PRIMARY KEY ("id")
);

-- 기능 : SELECT Attribute에서 선택 가능한 옵션 정의를 저장한다.
CREATE TABLE "SelectOptionDefinition" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "workspaceId" UUID NOT NULL,
  "attributeDefinitionId" UUID NOT NULL,
  "createdByActorId" UUID NOT NULL,
  "updatedByActorId" UUID,
  "title" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "SelectOptionDefinition_pkey" PRIMARY KEY ("id")
);

-- 기능 : STATUS Attribute에서 선택 가능한 상태 옵션 정의를 저장한다.
CREATE TABLE "StatusOptionDefinition" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "workspaceId" UUID NOT NULL,
  "attributeDefinitionId" UUID NOT NULL,
  "createdByActorId" UUID NOT NULL,
  "updatedByActorId" UUID,
  "title" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "StatusOptionDefinition_pkey" PRIMARY KEY ("id")
);

-- 기능 : ObjectDefinition 사이의 관계 정의를 저장한다.
CREATE TABLE "RelationshipDefinition" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "workspaceId" UUID NOT NULL,
  "sourceObjectDefinitionId" UUID NOT NULL,
  "sourceAttributeDefinitionId" UUID NOT NULL,
  "targetObjectDefinitionId" UUID NOT NULL,
  "targetAttributeDefinitionId" UUID NOT NULL,
  "createdByActorId" UUID NOT NULL,
  "updatedByActorId" UUID,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "RelationshipDefinition_pkey" PRIMARY KEY ("id")
);

-- 기능 : RecordDefinition의 Attribute별 값을 저장한다.
CREATE TABLE "RecordAttributeValueDefinition" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "workspaceId" UUID NOT NULL,
  "recordDefinitionId" UUID NOT NULL,
  "objectDefinitionId" UUID NOT NULL,
  "attributeDefinitionId" UUID NOT NULL,
  "createdByActorId" UUID NOT NULL,
  "updatedByActorId" UUID,
  "selectOptionDefinitionId" UUID,
  "statusOptionDefinitionId" UUID,
  "targetRecordDefinitionId" UUID,
  "targetObjectDefinitionId" UUID,
  "targetActorId" UUID,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "RecordAttributeValueDefinition_pkey" PRIMARY KEY ("id")
);

-- 기능 : ObjectDefinition은 Workspace 안에서 Actor가 생성/수정한다.
ALTER TABLE "ObjectDefinition"
  ADD CONSTRAINT "ObjectDefinition_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ObjectDefinition"
  ADD CONSTRAINT "ObjectDefinition_createdByActorId_fkey"
  FOREIGN KEY ("createdByActorId") REFERENCES "Actor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ObjectDefinition"
  ADD CONSTRAINT "ObjectDefinition_updatedByActorId_fkey"
  FOREIGN KEY ("updatedByActorId") REFERENCES "Actor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 기능 : AttributeDefinition은 Workspace와 ObjectDefinition 안에서 Actor가 생성/수정한다.
ALTER TABLE "AttributeDefinition"
  ADD CONSTRAINT "AttributeDefinition_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AttributeDefinition"
  ADD CONSTRAINT "AttributeDefinition_objectDefinitionId_fkey"
  FOREIGN KEY ("objectDefinitionId") REFERENCES "ObjectDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AttributeDefinition"
  ADD CONSTRAINT "AttributeDefinition_createdByActorId_fkey"
  FOREIGN KEY ("createdByActorId") REFERENCES "Actor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AttributeDefinition"
  ADD CONSTRAINT "AttributeDefinition_updatedByActorId_fkey"
  FOREIGN KEY ("updatedByActorId") REFERENCES "Actor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 기능 : RecordDefinition은 Workspace와 ObjectDefinition 안에서 Actor가 생성/수정한다.
ALTER TABLE "RecordDefinition"
  ADD CONSTRAINT "RecordDefinition_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RecordDefinition"
  ADD CONSTRAINT "RecordDefinition_objectDefinitionId_fkey"
  FOREIGN KEY ("objectDefinitionId") REFERENCES "ObjectDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RecordDefinition"
  ADD CONSTRAINT "RecordDefinition_createdByActorId_fkey"
  FOREIGN KEY ("createdByActorId") REFERENCES "Actor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RecordDefinition"
  ADD CONSTRAINT "RecordDefinition_updatedByActorId_fkey"
  FOREIGN KEY ("updatedByActorId") REFERENCES "Actor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 기능 : SelectOptionDefinition은 Workspace와 AttributeDefinition 안에서 Actor가 생성/수정한다.
ALTER TABLE "SelectOptionDefinition"
  ADD CONSTRAINT "SelectOptionDefinition_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SelectOptionDefinition"
  ADD CONSTRAINT "SelectOptionDefinition_attributeDefinitionId_fkey"
  FOREIGN KEY ("attributeDefinitionId") REFERENCES "AttributeDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SelectOptionDefinition"
  ADD CONSTRAINT "SelectOptionDefinition_createdByActorId_fkey"
  FOREIGN KEY ("createdByActorId") REFERENCES "Actor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SelectOptionDefinition"
  ADD CONSTRAINT "SelectOptionDefinition_updatedByActorId_fkey"
  FOREIGN KEY ("updatedByActorId") REFERENCES "Actor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 기능 : StatusOptionDefinition은 Workspace와 AttributeDefinition 안에서 Actor가 생성/수정한다.
ALTER TABLE "StatusOptionDefinition"
  ADD CONSTRAINT "StatusOptionDefinition_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StatusOptionDefinition"
  ADD CONSTRAINT "StatusOptionDefinition_attributeDefinitionId_fkey"
  FOREIGN KEY ("attributeDefinitionId") REFERENCES "AttributeDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StatusOptionDefinition"
  ADD CONSTRAINT "StatusOptionDefinition_createdByActorId_fkey"
  FOREIGN KEY ("createdByActorId") REFERENCES "Actor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "StatusOptionDefinition"
  ADD CONSTRAINT "StatusOptionDefinition_updatedByActorId_fkey"
  FOREIGN KEY ("updatedByActorId") REFERENCES "Actor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 기능 : RelationshipDefinition은 source/target ObjectDefinition과 AttributeDefinition을 연결한다.
ALTER TABLE "RelationshipDefinition"
  ADD CONSTRAINT "RelationshipDefinition_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RelationshipDefinition"
  ADD CONSTRAINT "RelationshipDefinition_sourceObjectDefinitionId_fkey"
  FOREIGN KEY ("sourceObjectDefinitionId") REFERENCES "ObjectDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RelationshipDefinition"
  ADD CONSTRAINT "RelationshipDefinition_sourceAttributeDefinitionId_fkey"
  FOREIGN KEY ("sourceAttributeDefinitionId") REFERENCES "AttributeDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RelationshipDefinition"
  ADD CONSTRAINT "RelationshipDefinition_targetObjectDefinitionId_fkey"
  FOREIGN KEY ("targetObjectDefinitionId") REFERENCES "ObjectDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RelationshipDefinition"
  ADD CONSTRAINT "RelationshipDefinition_targetAttributeDefinitionId_fkey"
  FOREIGN KEY ("targetAttributeDefinitionId") REFERENCES "AttributeDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RelationshipDefinition"
  ADD CONSTRAINT "RelationshipDefinition_createdByActorId_fkey"
  FOREIGN KEY ("createdByActorId") REFERENCES "Actor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RelationshipDefinition"
  ADD CONSTRAINT "RelationshipDefinition_updatedByActorId_fkey"
  FOREIGN KEY ("updatedByActorId") REFERENCES "Actor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 기능 : RecordAttributeValueDefinition은 RecordDefinition의 Attribute 값을 참조형 컬럼으로 저장한다.
ALTER TABLE "RecordAttributeValueDefinition"
  ADD CONSTRAINT "RecordAttributeValueDefinition_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RecordAttributeValueDefinition"
  ADD CONSTRAINT "RecordAttributeValueDefinition_recordDefinitionId_fkey"
  FOREIGN KEY ("recordDefinitionId") REFERENCES "RecordDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RecordAttributeValueDefinition"
  ADD CONSTRAINT "RecordAttributeValueDefinition_objectDefinitionId_fkey"
  FOREIGN KEY ("objectDefinitionId") REFERENCES "ObjectDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RecordAttributeValueDefinition"
  ADD CONSTRAINT "RecordAttributeValueDefinition_attributeDefinitionId_fkey"
  FOREIGN KEY ("attributeDefinitionId") REFERENCES "AttributeDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RecordAttributeValueDefinition"
  ADD CONSTRAINT "RecordAttributeValueDefinition_createdByActorId_fkey"
  FOREIGN KEY ("createdByActorId") REFERENCES "Actor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RecordAttributeValueDefinition"
  ADD CONSTRAINT "RecordAttributeValueDefinition_updatedByActorId_fkey"
  FOREIGN KEY ("updatedByActorId") REFERENCES "Actor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "RecordAttributeValueDefinition"
  ADD CONSTRAINT "RecordAttributeValueDefinition_selectOptionDefinitionId_fkey"
  FOREIGN KEY ("selectOptionDefinitionId") REFERENCES "SelectOptionDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "RecordAttributeValueDefinition"
  ADD CONSTRAINT "RecordAttributeValueDefinition_statusOptionDefinitionId_fkey"
  FOREIGN KEY ("statusOptionDefinitionId") REFERENCES "StatusOptionDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "RecordAttributeValueDefinition"
  ADD CONSTRAINT "RecordAttributeValueDefinition_targetRecordDefinitionId_fkey"
  FOREIGN KEY ("targetRecordDefinitionId") REFERENCES "RecordDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "RecordAttributeValueDefinition"
  ADD CONSTRAINT "RecordAttributeValueDefinition_targetObjectDefinitionId_fkey"
  FOREIGN KEY ("targetObjectDefinitionId") REFERENCES "ObjectDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "RecordAttributeValueDefinition"
  ADD CONSTRAINT "RecordAttributeValueDefinition_targetActorId_fkey"
  FOREIGN KEY ("targetActorId") REFERENCES "Actor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

COMMENT ON TYPE "AttributeType" IS 'AttributeDefinition 값 타입.';

COMMENT ON TABLE "ObjectDefinition" IS 'Workspace 안에서 회사, 고객, 매물 같은 관리 대상 타입.';
COMMENT ON COLUMN "ObjectDefinition"."id" IS 'ObjectDefinition row의 고유 식별자.';
COMMENT ON COLUMN "ObjectDefinition"."workspaceId" IS 'ObjectDefinition이 속한 Workspace ID.';
COMMENT ON COLUMN "ObjectDefinition"."createdByActorId" IS 'ObjectDefinition을 생성한 Actor ID.';
COMMENT ON COLUMN "ObjectDefinition"."updatedByActorId" IS 'ObjectDefinition을 마지막으로 수정한 Actor ID.';
COMMENT ON COLUMN "ObjectDefinition"."apiSlug" IS '코드에서 사용하는 Object 고유 이름.';
COMMENT ON COLUMN "ObjectDefinition"."singularName" IS '사용자에게 보여줄 단수 표시 이름.';
COMMENT ON COLUMN "ObjectDefinition"."pluralName" IS '목록 또는 복수 문맥에서 보여줄 표시 이름.';
COMMENT ON COLUMN "ObjectDefinition"."icon" IS '화면 표시용 아이콘.';
COMMENT ON COLUMN "ObjectDefinition"."description" IS 'ObjectDefinition 설명.';
COMMENT ON COLUMN "ObjectDefinition"."createdAt" IS 'ObjectDefinition 생성 시각.';
COMMENT ON COLUMN "ObjectDefinition"."updatedAt" IS 'ObjectDefinition row 수정 시각.';

COMMENT ON TABLE "AttributeDefinition" IS 'ObjectDefinition에 붙는 필드 정의.';
COMMENT ON COLUMN "AttributeDefinition"."id" IS 'AttributeDefinition row의 고유 식별자.';
COMMENT ON COLUMN "AttributeDefinition"."workspaceId" IS 'AttributeDefinition이 속한 Workspace ID.';
COMMENT ON COLUMN "AttributeDefinition"."objectDefinitionId" IS 'AttributeDefinition이 속한 ObjectDefinition ID.';
COMMENT ON COLUMN "AttributeDefinition"."createdByActorId" IS 'AttributeDefinition을 생성한 Actor ID.';
COMMENT ON COLUMN "AttributeDefinition"."updatedByActorId" IS 'AttributeDefinition을 마지막으로 수정한 Actor ID.';
COMMENT ON COLUMN "AttributeDefinition"."apiSlug" IS '코드에서 사용하는 Attribute 고유 이름.';
COMMENT ON COLUMN "AttributeDefinition"."title" IS '사용자에게 보여줄 Attribute 이름.';
COMMENT ON COLUMN "AttributeDefinition"."type" IS '값 타입. Text, Number, Select, Status, RecordReference 등.';
COMMENT ON COLUMN "AttributeDefinition"."isMultiselect" IS 'SELECT 계열 Attribute에서 여러 값을 허용하는지 여부.';
COMMENT ON COLUMN "AttributeDefinition"."description" IS 'AttributeDefinition 설명.';
COMMENT ON COLUMN "AttributeDefinition"."createdAt" IS 'AttributeDefinition 생성 시각.';
COMMENT ON COLUMN "AttributeDefinition"."updatedAt" IS 'AttributeDefinition row 수정 시각.';

COMMENT ON TABLE "RecordDefinition" IS 'ObjectDefinition의 실제 레코드 인스턴스.';
COMMENT ON COLUMN "RecordDefinition"."id" IS 'RecordDefinition row의 고유 식별자.';
COMMENT ON COLUMN "RecordDefinition"."workspaceId" IS 'RecordDefinition이 속한 Workspace ID.';
COMMENT ON COLUMN "RecordDefinition"."objectDefinitionId" IS 'RecordDefinition이 속한 ObjectDefinition ID.';
COMMENT ON COLUMN "RecordDefinition"."createdByActorId" IS 'RecordDefinition을 생성한 Actor ID.';
COMMENT ON COLUMN "RecordDefinition"."updatedByActorId" IS 'RecordDefinition을 마지막으로 수정한 Actor ID.';
COMMENT ON COLUMN "RecordDefinition"."createdAt" IS 'RecordDefinition 생성 시각.';
COMMENT ON COLUMN "RecordDefinition"."updatedAt" IS 'RecordDefinition row 수정 시각.';

COMMENT ON TABLE "SelectOptionDefinition" IS 'SELECT Attribute에서 선택 가능한 옵션 정의.';
COMMENT ON COLUMN "SelectOptionDefinition"."id" IS 'SelectOptionDefinition row의 고유 식별자.';
COMMENT ON COLUMN "SelectOptionDefinition"."workspaceId" IS 'SelectOptionDefinition이 속한 Workspace ID.';
COMMENT ON COLUMN "SelectOptionDefinition"."attributeDefinitionId" IS 'SelectOptionDefinition이 속한 AttributeDefinition ID.';
COMMENT ON COLUMN "SelectOptionDefinition"."createdByActorId" IS 'SelectOptionDefinition을 생성한 Actor ID.';
COMMENT ON COLUMN "SelectOptionDefinition"."updatedByActorId" IS 'SelectOptionDefinition을 마지막으로 수정한 Actor ID.';
COMMENT ON COLUMN "SelectOptionDefinition"."title" IS '사용자에게 보여줄 옵션 이름.';
COMMENT ON COLUMN "SelectOptionDefinition"."sortOrder" IS '옵션 표시 순서.';
COMMENT ON COLUMN "SelectOptionDefinition"."createdAt" IS 'SelectOptionDefinition 생성 시각.';
COMMENT ON COLUMN "SelectOptionDefinition"."updatedAt" IS 'SelectOptionDefinition row 수정 시각.';

COMMENT ON TABLE "StatusOptionDefinition" IS 'STATUS Attribute에서 선택 가능한 상태 옵션 정의.';
COMMENT ON COLUMN "StatusOptionDefinition"."id" IS 'StatusOptionDefinition row의 고유 식별자.';
COMMENT ON COLUMN "StatusOptionDefinition"."workspaceId" IS 'StatusOptionDefinition이 속한 Workspace ID.';
COMMENT ON COLUMN "StatusOptionDefinition"."attributeDefinitionId" IS 'StatusOptionDefinition이 속한 AttributeDefinition ID.';
COMMENT ON COLUMN "StatusOptionDefinition"."createdByActorId" IS 'StatusOptionDefinition을 생성한 Actor ID.';
COMMENT ON COLUMN "StatusOptionDefinition"."updatedByActorId" IS 'StatusOptionDefinition을 마지막으로 수정한 Actor ID.';
COMMENT ON COLUMN "StatusOptionDefinition"."title" IS '사용자에게 보여줄 상태 이름.';
COMMENT ON COLUMN "StatusOptionDefinition"."sortOrder" IS '상태 표시 순서.';
COMMENT ON COLUMN "StatusOptionDefinition"."createdAt" IS 'StatusOptionDefinition 생성 시각.';
COMMENT ON COLUMN "StatusOptionDefinition"."updatedAt" IS 'StatusOptionDefinition row 수정 시각.';

COMMENT ON TABLE "RelationshipDefinition" IS 'ObjectDefinition 사이의 관계 정의.';
COMMENT ON COLUMN "RelationshipDefinition"."id" IS 'RelationshipDefinition row의 고유 식별자.';
COMMENT ON COLUMN "RelationshipDefinition"."workspaceId" IS 'RelationshipDefinition이 속한 Workspace ID.';
COMMENT ON COLUMN "RelationshipDefinition"."sourceObjectDefinitionId" IS '관계 source ObjectDefinition ID.';
COMMENT ON COLUMN "RelationshipDefinition"."sourceAttributeDefinitionId" IS '관계 source AttributeDefinition ID.';
COMMENT ON COLUMN "RelationshipDefinition"."targetObjectDefinitionId" IS '관계 target ObjectDefinition ID.';
COMMENT ON COLUMN "RelationshipDefinition"."targetAttributeDefinitionId" IS '관계 target AttributeDefinition ID.';
COMMENT ON COLUMN "RelationshipDefinition"."createdByActorId" IS 'RelationshipDefinition을 생성한 Actor ID.';
COMMENT ON COLUMN "RelationshipDefinition"."updatedByActorId" IS 'RelationshipDefinition을 마지막으로 수정한 Actor ID.';
COMMENT ON COLUMN "RelationshipDefinition"."createdAt" IS 'RelationshipDefinition 생성 시각.';
COMMENT ON COLUMN "RelationshipDefinition"."updatedAt" IS 'RelationshipDefinition row 수정 시각.';

COMMENT ON TABLE "RecordAttributeValueDefinition" IS 'RecordDefinition의 Attribute별 값.';
COMMENT ON COLUMN "RecordAttributeValueDefinition"."id" IS 'RecordAttributeValueDefinition row의 고유 식별자.';
COMMENT ON COLUMN "RecordAttributeValueDefinition"."workspaceId" IS 'RecordAttributeValueDefinition이 속한 Workspace ID.';
COMMENT ON COLUMN "RecordAttributeValueDefinition"."recordDefinitionId" IS '값이 속한 RecordDefinition ID.';
COMMENT ON COLUMN "RecordAttributeValueDefinition"."objectDefinitionId" IS '값이 속한 ObjectDefinition ID.';
COMMENT ON COLUMN "RecordAttributeValueDefinition"."attributeDefinitionId" IS '값이 저장되는 AttributeDefinition ID.';
COMMENT ON COLUMN "RecordAttributeValueDefinition"."createdByActorId" IS 'RecordAttributeValueDefinition을 생성한 Actor ID.';
COMMENT ON COLUMN "RecordAttributeValueDefinition"."updatedByActorId" IS 'RecordAttributeValueDefinition을 마지막으로 수정한 Actor ID.';
COMMENT ON COLUMN "RecordAttributeValueDefinition"."selectOptionDefinitionId" IS 'SELECT 값일 때 선택된 SelectOptionDefinition ID.';
COMMENT ON COLUMN "RecordAttributeValueDefinition"."statusOptionDefinitionId" IS 'STATUS 값일 때 선택된 StatusOptionDefinition ID.';
COMMENT ON COLUMN "RecordAttributeValueDefinition"."targetRecordDefinitionId" IS 'RECORD_REFERENCE 값일 때 참조 대상 RecordDefinition ID.';
COMMENT ON COLUMN "RecordAttributeValueDefinition"."targetObjectDefinitionId" IS 'RECORD_REFERENCE 값일 때 참조 대상 ObjectDefinition ID.';
COMMENT ON COLUMN "RecordAttributeValueDefinition"."targetActorId" IS 'ACTOR 값일 때 참조 대상 Actor ID.';
COMMENT ON COLUMN "RecordAttributeValueDefinition"."createdAt" IS 'RecordAttributeValueDefinition 생성 시각.';
COMMENT ON COLUMN "RecordAttributeValueDefinition"."updatedAt" IS 'RecordAttributeValueDefinition row 수정 시각.';
