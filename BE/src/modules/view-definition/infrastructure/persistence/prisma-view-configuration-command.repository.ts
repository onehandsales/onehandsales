import { Prisma } from "@prisma/client";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import { resolvePrismaReadContext } from "@/shared/infrastructure/prisma/prisma-transaction-manager";
import { DomainError } from "@/shared/domain/errors/domain-error";
import type { ViewHeaderScope } from "../../application/view-header-configuration";
import type { ViewConfigurationCommandRepository } from "../../application/ports/view-configuration-command.repository";
import { canonicalConfiguration, viewConfigurationSections } from "../../application/view-configuration";

// 역할 : 같은 필드 구조를 가진 View 소유 delegate의 내부 adapter 계약입니다.
interface ConfigurationDelegate {
  findMany(args: { where: { id: { in: string[] } }; select: { id: true; workspaceId: true; viewDefinitionId: true } }): Promise<{ id: string; workspaceId: string; viewDefinitionId: string }[]>;
  create(args: { data: Record<string, unknown> }): Promise<unknown>;
  deleteMany(args: { where: ViewHeaderScope & { id: { notIn: string[] } } }): Promise<unknown>;
  updateMany(args: { where: ViewHeaderScope & { id: string }; data: Record<string, unknown> }): Promise<{ count: number }>;
}
// 기능 : Json nullable 컬럼을 Prisma의 명시 JSON null로 변환합니다.
function databaseRow(row: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, key.endsWith("Json") && value === null ? Prisma.DbNull : value]));
}
// 역할 : View 소유 여섯 자식 테이블과 부모 표현 설정의 쓰기를 구현합니다.
export class PrismaViewConfigurationCommandRepository implements ViewConfigurationCommandRepository {
  // 기능 : READ COMMITTED에서 잠금 대기 뒤 최신 설정을 읽도록 합니다.
  async lock(scope: ViewHeaderScope, context: TransactionContext) {
    const client = resolvePrismaReadContext(context);
    const isolation = await client.$queryRaw<{ level: string }[]>`SELECT current_setting('transaction_isolation') AS level`;
    if (isolation[0]?.level !== "read committed") throw new Error("View configuration requires READ COMMITTED");
    const rows = await client.$queryRaw<{ id: string }[]>`SELECT id FROM "ViewDefinition" WHERE id = ${scope.viewDefinitionId}::uuid AND "workspaceId" = ${scope.workspaceId}::uuid FOR UPDATE`;
    return rows.length === 1;
  }
  // 기능 : 참조 순서를 지키며 변경한 행만 저장하고 실패를 전체 transaction으로 전파합니다.
  async save(...[before, after, changes, actorId, context]: Parameters<ViewConfigurationCommandRepository["save"]>) {
    const client = resolvePrismaReadContext(context);
    const scope = { workspaceId: before.view.workspaceId, viewDefinitionId: before.view.id };
    const previous = viewConfigurationSections(before), next = viewConfigurationSections(after);
    // 기능 : 다른 View의 기존 ID를 새 행처럼 가져오지 못하게 검증합니다.
    async function ensureScope(delegate: ConfigurationDelegate, rows: { id: string }[]) {
      if (!rows.length) return;
      const found = await delegate.findMany({ where: { id: { in: rows.map(row => row.id) } }, select: { id: true, workspaceId: true, viewDefinitionId: true } });
      if (found.some(row => row.workspaceId !== scope.workspaceId || row.viewDefinitionId !== scope.viewDefinitionId)) throw new DomainError("ViewConfigurationConflict", "보기 설정을 다시 확인해 주세요.");
    }
    // 기능 : 동일 행은 감사 시각을 유지하고 새 ID의 경합은 다른 보기 갱신 대신 충돌로 반환합니다.
    async function write(delegate: ConfigurationDelegate, oldRows: { id: string }[], newRows: { id: string }[], parentField?: string) {
      await ensureScope(delegate, newRows);
      const modified = newRows.filter(row => JSON.stringify(canonicalConfiguration(row)) !== JSON.stringify(canonicalConfiguration(oldRows.find(old => old.id === row.id) ?? null)));
      for (const row of modified) {
        const data = databaseRow({ ...row, ...(parentField ? { [parentField]: null } : {}) });
        if (oldRows.some(old => old.id === row.id)) {
          const result = await delegate.updateMany({ where: { ...scope, id: row.id }, data: { ...data, updatedByActorId: actorId } });
          if (result.count !== 1) throw new DomainError("ViewConfigurationConflict", "보기 설정을 다시 확인해 주세요.");
        } else {
          try { await delegate.create({ data: { ...data, ...scope, createdByActorId: actorId, updatedByActorId: actorId } }); }
          catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new DomainError("ViewConfigurationConflict", "보기 설정을 다시 확인해 주세요.");
            throw error;
          }
        }
      }
      if (parentField) for (const row of modified) {
        const parent = (row as unknown as Record<string, unknown>)[parentField];
        if (parent !== null) await delegate.updateMany({ where: { ...scope, id: row.id }, data: { [parentField]: parent } });
      }
    }
    // 기능 : 교체 section에서 빠진 소유 행만 제거합니다.
    async function remove(delegate: ConfigurationDelegate, rows: { id: string }[]) {
      await delegate.deleteMany({ where: { ...scope, id: { notIn: rows.map(row => row.id) } } });
    }
    const groups = client.viewFilterGroupDefinition as unknown as ConfigurationDelegate;
    const conditions = client.viewFilterConditionDefinition as unknown as ConfigurationDelegate;
    const sorts = client.viewSortDefinition as unknown as ConfigurationDelegate;
    const attributes = client.viewAttributeSettingDefinition as unknown as ConfigurationDelegate;
    const grouping = client.viewGroupDefinition as unknown as ConfigurationDelegate;
    const settings = client.viewGroupSettingDefinition as unknown as ConfigurationDelegate;
    // 1. 부모가 먼저 존재하게 만들고 제거는 자식부터 진행한다.
    if (changes.filters) {
      await write(groups, previous.filters.viewFilterGroupDefinitions, next.filters.viewFilterGroupDefinitions, "parentViewFilterGroupDefinitionId");
      await write(conditions, previous.filters.viewFilterConditionDefinitions, next.filters.viewFilterConditionDefinitions);
      await remove(conditions, next.filters.viewFilterConditionDefinitions);
      await remove(groups, next.filters.viewFilterGroupDefinitions);
    }
    if (changes.sorts) {
      await write(sorts, previous.sorts.viewSortDefinitions, next.sorts.viewSortDefinitions);
      await remove(sorts, next.sorts.viewSortDefinitions);
    }
    if (changes.settings) {
      await write(attributes, previous.settings.viewAttributeSettingDefinitions, next.settings.viewAttributeSettingDefinitions);
      await write(grouping, previous.settings.viewGroupDefinitions, next.settings.viewGroupDefinitions);
      await write(settings, previous.settings.viewGroupSettingDefinitions, next.settings.viewGroupSettingDefinitions);
      await remove(settings, next.settings.viewGroupSettingDefinitions);
      await remove(grouping, next.settings.viewGroupDefinitions);
      await remove(attributes, next.settings.viewAttributeSettingDefinitions);
    }
    // 2. 부모 감사 정보는 실제 저장 성공과 함께 변경한다.
    await client.viewDefinition.update({ where: { id: scope.viewDefinitionId, workspaceId: scope.workspaceId }, data: {
      updatedByActorId: actorId, ...(changes.settings ? { configJson: after.view.configJson === null ? Prisma.DbNull : after.view.configJson as Prisma.InputJsonValue } : {}),
    } });
  }
}
