import { Prisma } from "@prisma/client";
import type { RecordAttributeSchemaQuery } from "../../application/ports/record-attribute-schema-query.port";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import { resolvePrismaReadContext } from "@/shared/infrastructure/prisma/prisma-transaction-manager";

// 역할 : Attribute 모듈 소유 정의를 Record 쓰기와 입력 폼에 제공합니다.
export class PrismaRecordAttributeSchemaQueryRepository implements RecordAttributeSchemaQuery {
  // 기능 : 연결된 양쪽 정의와 옵션을 같은 Workspace/transaction에서 읽습니다.
  async load(workspaceId: string, objectId: string, context: TransactionContext, lock = true) {
    const tx = resolvePrismaReadContext(context);
    if (lock) await tx.$queryRaw(Prisma.sql`SELECT id FROM "RelationshipDefinition" WHERE "workspaceId" = ${workspaceId}::uuid
      AND ("sourceObjectDefinitionId" = ${objectId}::uuid OR "targetObjectDefinitionId" = ${objectId}::uuid) ORDER BY id FOR SHARE`);
    const relationships = await tx.relationshipDefinition.findMany({ where: { workspaceId,
      OR: [{ sourceObjectDefinitionId: objectId }, { targetObjectDefinitionId: objectId }] },
      select: { id: true, workspaceId: true, sourceObjectDefinitionId: true, sourceAttributeDefinitionId: true,
        targetObjectDefinitionId: true, targetAttributeDefinitionId: true } });
    const linked = relationships.flatMap(row => [row.sourceAttributeDefinitionId, row.targetAttributeDefinitionId]);
    if (lock) {
      // 1. 형식/다중값 정의가 검증과 저장 사이에 바뀌지 않도록 소유 행을 공유 잠금한다.
      await tx.$queryRaw(Prisma.sql`SELECT id FROM "AttributeDefinition" WHERE "workspaceId" = ${workspaceId}::uuid
        AND ("objectDefinitionId" = ${objectId}::uuid ${linked.length ? Prisma.sql`OR id IN (${Prisma.join(linked.map(id => Prisma.sql`${id}::uuid`))})` : Prisma.empty}) ORDER BY id FOR SHARE`);
    }
    const attributes = await tx.attributeDefinition.findMany({ where: { workspaceId,
      OR: [{ objectDefinitionId: objectId }, { id: { in: linked } }] }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: { id: true, workspaceId: true, objectDefinitionId: true, listDefinitionId: true, title: true,
        type: true, isMultiselect: true, configJson: true, icon: true, sortOrder: true } });
    const ids = attributes.map(row => row.id);
    const optionSelect = { id: true, workspaceId: true, attributeDefinitionId: true, title: true, color: true, sortOrder: true, createdAt: true } as const;
    const selectOptions = await tx.selectOption.findMany({ where: { workspaceId, attributeDefinitionId: { in: ids } }, select: optionSelect, orderBy: { sortOrder: "asc" } });
    const statusOptions = await tx.statusOption.findMany({ where: { workspaceId, attributeDefinitionId: { in: ids } }, select: optionSelect, orderBy: { sortOrder: "asc" } });
    return { attributes, relationships, selectOptions, statusOptions };
  }
}
