import { Prisma } from "@prisma/client";
import type { RecordWriteRepository } from "../../application/ports/record-write.repository";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import { resolvePrismaReadContext } from "@/shared/infrastructure/prisma/prisma-transaction-manager";
import { PrismaRecordDefinitionCommandRepository } from "./prisma-record-definition-command.repository";

// 역할 : 기존 Record 저장 adapter를 확장해 관계 갱신용 소유 데이터 접근을 제공합니다.
export class PrismaRecordWriteRepository extends PrismaRecordDefinitionCommandRepository implements RecordWriteRepository {
  // 기능 : 관계값 수정의 read-before-write 경쟁을 잠금 뒤 READ COMMITTED 조회로 방지합니다.
  async lock(workspaceId: string, context: TransactionContext) {
    const key = `onehandsales:record-write:${workspaceId}`;
    const rows = await resolvePrismaReadContext(context).$queryRaw<{ isolation: string }[]>`SELECT current_setting('transaction_isolation') AS isolation FROM pg_advisory_xact_lock(hashtextextended(${key}, 0))`;
    if (rows[0]?.isolation !== "read committed") throw new Error("Record writes require READ COMMITTED");
  }
  // 기능 : ID 존재 여부를 반환하며 접근 허용은 application에서 별도로 검증합니다.
  record(id: string, context: TransactionContext) {
    return resolvePrismaReadContext(context).recordDefinition.findUnique({ where: { id }, select: { id: true, workspaceId: true, objectDefinitionId: true, createdByActorId: true } });
  }
  // 기능 : Decimal/JSON을 공개 port 타입으로 변환합니다.
  async values(workspaceId: string, recordId: string, context: TransactionContext) {
    const rows = await resolvePrismaReadContext(context).recordAttributeValueDefinition.findMany({ where: { workspaceId, recordDefinitionId: recordId }, orderBy: { id: "asc" } });
    return rows.map(row => ({ ...row, numberValue: row.numberValue?.toString() ?? null }));
  }
  // 기능 : 모든 변경은 전달받은 transaction 안에서 수행합니다.
  async put(input: Parameters<RecordWriteRepository["put"]>[0], context: TransactionContext) {
    const tx = resolvePrismaReadContext(context);
    if (input.id) {
      await this.updateRecordAttributeValueDefinition({ workspaceId: input.workspaceId, objectDefinitionId: input.objectDefinitionId,
        recordDefinitionId: input.recordDefinitionId, recordAttributeValueDefinitionId: input.id, updatedByActorId: input.actorId,
        values: input.value, transactionContext: context });
      return input.id;
    }
    const row = await tx.recordAttributeValueDefinition.create({ data: { workspaceId: input.workspaceId,
      objectDefinitionId: input.objectDefinitionId, recordDefinitionId: input.recordDefinitionId, attributeDefinitionId: input.attributeDefinitionId,
      attributeType: input.attributeType, createdByActorId: input.actorId, updatedByActorId: input.actorId,
      ...input.value, jsonValue: input.value.jsonValue === null ? Prisma.DbNull : input.value.jsonValue as Prisma.InputJsonValue }, select: { id: true } });
    await tx.recordDefinition.update({ where: { id: input.recordDefinitionId, workspaceId: input.workspaceId }, data: { updatedByActorId: input.actorId } });
    return row.id;
  }
}
