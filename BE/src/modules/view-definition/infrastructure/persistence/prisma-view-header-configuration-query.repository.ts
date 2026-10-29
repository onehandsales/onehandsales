import type { ViewHeaderConfigurationQuery } from "@/modules/view-definition/application/ports/view-header-configuration-query.port";
import type { ViewHeaderScope } from "@/modules/view-definition/application/view-header-configuration";
import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

const rowScope = { id: true, workspaceId: true, viewDefinitionId: true, createdAt: true } as const;
const ordered = [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }] as const;

// 역할 : View 소유 설정 테이블만 Prisma로 읽습니다.
export class PrismaViewHeaderConfigurationQueryRepository implements ViewHeaderConfigurationQuery {
  // 기능 : 메뉴 조회에 필요한 View 소유 delegate만 주입받습니다.
  constructor(private readonly prisma: Pick<PrismaService, "viewDefinition" | "viewFilterGroupDefinition" | "viewFilterConditionDefinition" | "viewSortDefinition" | "viewAttributeSettingDefinition" | "viewGroupDefinition" | "viewGroupSettingDefinition" | "viewWidgetDefinition">) {}

  // 기능 : 요청 Workspace의 선택 View와 원본 연결을 반환합니다.
  findView(scope: ViewHeaderScope) {
    // 1. 선택 ID와 Workspace를 함께 제한한다.
    return this.prisma.viewDefinition.findFirst({
      where: { id: scope.viewDefinitionId, workspaceId: scope.workspaceId },
      select: { id: true, workspaceId: true, objectDefinitionId: true, listDefinitionId: true, name: true, type: true, configJson: true },
    });
  }

  // 기능 : 필터 그룹과 조건을 각각 안정적인 순서로 조회합니다.
  async findFilters(scope: ViewHeaderScope) {
    // 1. 독립된 두 설정 목록을 같은 소속 조건으로 읽는다.
    const [viewFilterGroupDefinitions, viewFilterConditionDefinitions] = await Promise.all([
      this.readFilterGroup(scope), this.readFilterCondition(scope),
    ]);
    return { viewFilterGroupDefinitions, viewFilterConditionDefinitions };
  }

  // 기능 : 정렬 조건의 우선순위를 보존해 조회합니다.
  findSorts(scope: ViewHeaderScope) { return this.readSort(scope); }

  // 기능 : 표시·그룹·그룹별 상태·위젯 설정을 조회합니다.
  async findSettings(scope: ViewHeaderScope) {
    // 1. 보기 설정에 필요한 네 테이블만 일괄 조회한다.
    const [viewAttributeSettingDefinitions, viewGroupDefinitions, viewGroupSettingDefinitions, viewWidgetDefinitions] = await Promise.all([
      this.readAttributeSetting(scope), this.readGroup(scope), this.readGroupSetting(scope), this.readWidget(scope),
    ]);
    return { viewAttributeSettingDefinitions, viewGroupDefinitions, viewGroupSettingDefinitions, viewWidgetDefinitions };
  }

  // 기능 : 중복 제거한 직접 원본 View의 요약만 조회합니다.
  async findContentViews(workspaceId: string, ids: string[]) {
    // 1. 빈 집합의 전체 조회를 방지하고 같은 Workspace로 제한한다.
    if (!ids.length) return [];
    return this.prisma.viewDefinition.findMany({
      where: { workspaceId, id: { in: ids } }, orderBy: { id: "asc" },
      select: { id: true, workspaceId: true, name: true, type: true, icon: true },
    });
  }

  // 기능 : FilterGroup 설정의 소속·정렬·응답 필드만 조회합니다.
  private readFilterGroup(scope: ViewHeaderScope) {
    // 1. 요청 View의 모든 그룹을 읽고 표시 순서의 동률은 생성 시각과 ID로 결정한다.
    return this.prisma.viewFilterGroupDefinition.findMany({
      where: scope,
      orderBy: [...ordered],
      select: { ...rowScope, parentViewFilterGroupDefinitionId: true, conditionGroupOperator: true, sortOrder: true },
    });
  }

  // 기능 : FilterCondition 설정의 소속·정렬·응답 필드만 조회합니다.
  private readFilterCondition(scope: ViewHeaderScope) {
    // 1. 요청 View의 조건을 그룹 연결과 비교값 원본을 포함해 표시 순서대로 읽는다.
    return this.prisma.viewFilterConditionDefinition.findMany({
      where: scope,
      orderBy: [...ordered],
      select: { ...rowScope, viewFilterGroupDefinitionId: true, sourceScope: true, attributeDefinitionId: true, referenceAttributeIdPathJson: true, comparisonOperator: true, comparisonValueJson: true, multiValueMatchMode: true, sortOrder: true },
    });
  }

  // 기능 : Sort 설정의 소속·정렬·응답 필드만 조회합니다.
  private readSort(scope: ViewHeaderScope) {
    // 1. 저장된 방향과 설정 JSON을 보존하면서 정렬 조건의 표시 우선순위대로 읽는다.
    return this.prisma.viewSortDefinition.findMany({
      where: scope,
      orderBy: [...ordered],
      select: { ...rowScope, sourceScope: true, attributeDefinitionId: true, referenceAttributeIdPathJson: true, sortDirection: true, sortOrder: true, configJson: true },
    });
  }

  // 기능 : AttributeSetting 설정의 소속·정렬·응답 필드만 조회합니다.
  private readAttributeSetting(scope: ViewHeaderScope) {
    // 1. 숨긴 속성도 메뉴에서 다시 표시할 수 있도록 요청 View의 전체 표시 설정을 읽는다.
    return this.prisma.viewAttributeSettingDefinition.findMany({
      where: scope,
      orderBy: [...ordered],
      select: { ...rowScope, sourceScope: true, attributeDefinitionId: true, referenceAttributeIdPathJson: true, attributeDisplayRole: true, sortOrder: true, labelOverride: true, width: true, isHidden: true, formatJson: true },
    });
  }

  // 기능 : Group 설정의 소속·정렬·응답 필드만 조회합니다.
  private readGroup(scope: ViewHeaderScope) {
    // 1. 속성 경로와 그룹 역할을 포함해 요청 View의 그룹 기준을 표시 순서대로 읽는다.
    return this.prisma.viewGroupDefinition.findMany({
      where: scope,
      orderBy: [...ordered],
      select: { ...rowScope, sourceScope: true, attributeDefinitionId: true, referenceAttributeIdPathJson: true, groupRole: true, sortDirection: true, sortOrder: true, configJson: true },
    });
  }

  // 기능 : GroupSetting 설정의 소속·정렬·응답 필드만 조회합니다.
  private readGroupSetting(scope: ViewHeaderScope) {
    // 1. 숨김·접힘 상태를 포함해 요청 View의 설정을 부모 그룹별 표시 순서로 읽는다.
    return this.prisma.viewGroupSettingDefinition.findMany({
      where: scope,
      orderBy: [{ viewGroupDefinitionId: "asc" }, ...ordered],
      select: { ...rowScope, viewGroupDefinitionId: true, attributeDefinitionId: true, statusOptionId: true, selectOptionId: true, groupKeyJson: true, sortOrder: true, labelOverride: true, isHidden: true, isFold: true, configJson: true },
    });
  }

  // 기능 : Widget 설정의 소속·정렬·응답 필드만 조회합니다.
  private readWidget(scope: ViewHeaderScope) {
    // 1. 숨긴 위젯과 반복 원본 참조도 유지하면서 요청 View의 위젯 배치를 읽는다.
    return this.prisma.viewWidgetDefinition.findMany({
      where: scope,
      orderBy: [...ordered],
      select: { ...rowScope, contentViewDefinitionId: true, titleOverride: true, sortOrder: true, isHidden: true, layoutJson: true, configJson: true },
    });
  }

}
