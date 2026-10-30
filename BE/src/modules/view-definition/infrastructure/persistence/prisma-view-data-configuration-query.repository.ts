import type { ViewDataConfigurationQuery } from "../../application/ports/view-data-configuration-query.port";
import type { ViewHeaderScope } from "../../application/view-header-configuration";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import { resolvePrismaReadContext } from "@/shared/infrastructure/prisma/prisma-transaction-manager";
import { PrismaViewHeaderConfigurationQueryRepository } from "./prisma-view-header-configuration-query.repository";
import { assertViewDataLimit } from "../../application/view-data/view-data.errors";

// 역할 : View 소유 테이블을 같은 snapshot에서 읽고 설정 규모를 제한합니다.
export class PrismaViewDataConfigurationQueryRepository
  implements ViewDataConfigurationQuery
{
  // 기능 : View의 전체 설정을 읽기 전에 각 테이블 크기를 검사합니다.
  async read(scope: ViewHeaderScope, context: TransactionContext) {
    const prisma = resolvePrismaReadContext(context);
    const reader = new PrismaViewHeaderConfigurationQueryRepository(prisma);
    const view = await reader.findView(scope);
    if (!view) return null;
    // 1. COUNT와 본 조회가 동일 snapshot에 참여하므로 중간 증가를 허용하지 않는다.
    const sizes = await Promise.all([
      prisma.viewFilterGroupDefinition.count({ where: scope }),
      prisma.viewFilterConditionDefinition.count({ where: scope }),
      prisma.viewSortDefinition.count({ where: scope }),
      prisma.viewAttributeSettingDefinition.count({ where: scope }),
      prisma.viewGroupDefinition.count({ where: scope }),
      prisma.viewGroupSettingDefinition.count({ where: scope }),
      prisma.viewWidgetDefinition.count({ where: scope }),
    ]);
    sizes.forEach((size) => assertViewDataLimit(size, 500));
    // 2. 기존 View 소유 query의 선택 필드와 안정 순서를 재사용한다.
    const [filters, settings, sorts] = await Promise.all([
      reader.findFilters(scope),
      reader.findSettings(scope),
      reader.findSorts(scope),
    ]);
    return { view, ...filters, ...settings, viewSortDefinitions: sorts };
  }
  // 기능 : 명시적 직접 제목만 참조 라벨 후보로 제공합니다.
  async titles(workspaceId: string, context: TransactionContext) {
    const rows = await resolvePrismaReadContext(
      context,
    ).viewAttributeSettingDefinition.findMany({
      where: {
        workspaceId,
        attributeDisplayRole: "TITLE",
        sourceScope: "RECORD",
      },
      orderBy: { id: "asc" },
      take: 501,
    });
    assertViewDataLimit(rows.length, 500);
    return rows.filter(
      (row) =>
        Array.isArray(row.referenceAttributeIdPathJson) &&
        row.referenceAttributeIdPathJson.length === 0,
    );
  }
  // 기능 : Workspace 밖의 위젯 원본은 결과에서 제외합니다.
  children(workspaceId: string, ids: string[], context: TransactionContext) {
    if (!ids.length) return Promise.resolve([]);
    return resolvePrismaReadContext(context).viewDefinition.findMany({
      where: { workspaceId, id: { in: ids } },
      select: {
        id: true,
        workspaceId: true,
        name: true,
        type: true,
        objectDefinitionId: true,
        listDefinitionId: true,
        configJson: true,
      },
    });
  }
  // 기능 : 해당 원본에 닿는 관계만 제한된 크기로 읽습니다.
  async dependencies(
    workspaceId: string,
    recordIds: string[],
    entryIds: string[],
    context: TransactionContext,
  ) {
    if (!recordIds.length && !entryIds.length) return [];
    const rows = await resolvePrismaReadContext(
      context,
    ).viewWorkDependencyDefinition.findMany({
      where: {
        workspaceId,
        OR: [
          { sourceRecordDefinitionId: { in: recordIds } },
          { targetRecordDefinitionId: { in: recordIds } },
          { sourceListEntryDefinitionId: { in: entryIds } },
          { targetListEntryDefinitionId: { in: entryIds } },
        ],
      },
      select: {
        id: true,
        sourceRecordDefinitionId: true,
        targetRecordDefinitionId: true,
        sourceListEntryDefinitionId: true,
        targetListEntryDefinitionId: true,
        type: true,
        dependencyTimeOffsetValue: true,
        dependencyTimeOffsetUnit: true,
      },
      orderBy: { id: "asc" },
      take: 10001,
    });
    assertViewDataLimit(rows.length, 10000);
    return rows.map((row) => ({
      ...row,
      dependencyTimeOffsetValue: row.dependencyTimeOffsetValue.toFixed(),
    }));
  }
}
