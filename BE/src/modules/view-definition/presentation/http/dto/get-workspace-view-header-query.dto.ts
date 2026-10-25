import { IsIn, IsUUID } from "class-validator";
import {
  VIEW_HEADER_TARGET_TYPES,
  type ViewHeaderTargetType,
} from "@/modules/view-definition/application/view-header-target";

// 역할 : View ID 없이 전달되는 사이드바 대상 Query를 검증합니다.
export class GetWorkspaceViewHeaderQueryDto {
  @IsIn(VIEW_HEADER_TARGET_TYPES)
  targetType!: ViewHeaderTargetType;

  @IsUUID()
  targetId!: string;
}
