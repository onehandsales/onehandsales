import type { ObjectDefinitionSummaryQuery } from "@/modules/object-definition/application/ports/object-definition-summary-query.port";
import type { ListDefinitionSummaryQuery } from "@/modules/list-definition/application/ports/list-definition-summary-query.port";
import { ViewHeaderObjectDefinitionNotFoundError, ViewHeaderListDefinitionNotFoundError } from "../domain/view-definition.errors";
import type { ViewHeaderTargetInput } from "./view-header-target";
import type { ViewHeaderTargetSummary } from "./view-header-response";

// 기능 : 두 헤더 진입점에서 같은 소유 Port로 대상 소속과 표시 정보를 확인합니다.
export async function readViewHeaderTarget(workspaceId: string, target: ViewHeaderTargetInput, objects: ObjectDefinitionSummaryQuery, lists: ListDefinitionSummaryQuery): Promise<ViewHeaderTargetSummary> {
  // 1. 관리항목은 요청 Workspace로 제한한 소유 모듈의 단건 요약을 사용한다.
  if (target.targetType === "OBJECT") {
    const object = await objects.findObjectDefinitionSummary({ workspaceId, objectDefinitionId: target.targetId });
    if (!object) throw new ViewHeaderObjectDefinitionNotFoundError();
    return { id: object.id, name: object.singularName, icon: object.icon };
  }
  // 2. 업무목록도 같은 Workspace의 요약만 허용하며 임의 원본으로 대체하지 않는다.
  const list = await lists.findListDefinitionSummary({ workspaceId, listDefinitionId: target.targetId });
  if (!list) throw new ViewHeaderListDefinitionNotFoundError();
  return list;
}
