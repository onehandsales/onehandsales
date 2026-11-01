import type { ViewDataConfigurationQuery } from "../../application/ports/view-data-configuration-query.port";
import type { ViewHeaderScope } from "../../application/view-header-configuration";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import { resolvePrismaReadContext } from "@/shared/infrastructure/prisma/prisma-transaction-manager";
import { PrismaViewHeaderConfigurationQueryRepository } from "./prisma-view-header-configuration-query.repository";
import { assertViewDataLimit } from "../../application/view-data/view-data.errors";
import { assertSupportedViewType } from "../../application/view-data/view-data-query-context";

const rowScope = { id: true, workspaceId: true, viewDefinitionId: true, createdAt: true } as const;
const ordered = [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }] as const;
// 역할 : 이번 세 타입의 View 소유 설정만 동일 snapshot에서 제한해 읽습니다.
export class PrismaViewDataConfigurationQueryRepository implements ViewDataConfigurationQuery {
  // 기능 : 기존 설정 mapper와 같은 필드를 사용하며 위젯·업무 관계는 읽지 않습니다.
  async read(scope: ViewHeaderScope, context: TransactionContext) {
    const prisma = resolvePrismaReadContext(context);
    const reader = new PrismaViewHeaderConfigurationQueryRepository(prisma);
    const view = await reader.findView(scope);
    if (!view) return null;
    assertSupportedViewType(view.type);
    // 1. 같은 snapshot의 COUNT로 기존 메뉴 읽기의 크기를 먼저 제한한다.
    const sizes = await Promise.all([
      prisma.viewFilterGroupDefinition.count({ where: scope }),
      prisma.viewFilterConditionDefinition.count({ where: scope }),
      prisma.viewSortDefinition.count({ where: scope }),
    ]);
    sizes.forEach(size => assertViewDataLimit(size, 500));
    // 2. 표시와 그룹도 최대501행까지만 읽어 한도 초과를 판별한다.
    const [filters, sorts, attributes, groups, settings] = await Promise.all([
      reader.findFilters(scope), reader.findSorts(scope),
      prisma.viewAttributeSettingDefinition.findMany({ where: scope, take: 501, orderBy: [...ordered], select: {
        ...rowScope, sourceScope: true, attributeDefinitionId: true, referenceAttributeIdPathJson: true,
        attributeDisplayRole: true, sortOrder: true, labelOverride: true, width: true, isHidden: true, formatJson: true,
      } }),
      prisma.viewGroupDefinition.findMany({ where: scope, take: 501, orderBy: [...ordered], select: {
        ...rowScope, sourceScope: true, attributeDefinitionId: true, referenceAttributeIdPathJson: true,
        groupRole: true, sortDirection: true, sortOrder: true, configJson: true,
      } }),
      prisma.viewGroupSettingDefinition.findMany({ where: scope, take: 501, orderBy: [{ viewGroupDefinitionId: "asc" }, ...ordered], select: {
        ...rowScope, viewGroupDefinitionId: true, attributeDefinitionId: true, statusOptionId: true,
        selectOptionId: true, groupKeyJson: true, sortOrder: true, labelOverride: true, isHidden: true, isFold: true, configJson: true,
      } }),
    ]);
    [attributes, groups, settings].forEach(rows => assertViewDataLimit(rows.length, 500));
    return { view, ...filters, viewSortDefinitions: sorts,
      viewAttributeSettingDefinitions: attributes, viewGroupDefinitions: groups, viewGroupSettingDefinitions: settings };
  }
  // 기능 : 같은 Workspace의 보이는 직접 RECORD TITLE만 참조 이름 후보로 읽습니다.
  async titles(workspaceId: string, context: TransactionContext) {
    // 1. 같은 Workspace의 보이는 RECORD 제목 후보를 상한 판별용 한 행까지 읽는다.
    const rows = await resolvePrismaReadContext(context).viewAttributeSettingDefinition.findMany({
      where: { workspaceId, viewDefinition: { workspaceId }, attributeDisplayRole: "TITLE", sourceScope: "RECORD", isHidden: false },
      orderBy: { id: "asc" }, take: 501,
    });
    // 2. 초과 시 부분 결과를 버리고 직접 속성인 제목만 라벨 후보로 전달한다.
    assertViewDataLimit(rows.length, 500);
    return rows.filter(row => Array.isArray(row.referenceAttributeIdPathJson) && row.referenceAttributeIdPathJson.length === 0);
  }
}
