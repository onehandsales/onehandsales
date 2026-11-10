import { Type } from "lucide-react";
import type { AttributeDefinitionValueType } from "@/features/crm-object";
import { cn } from "@/utils/cn";
import { ATTRIBUTE_TYPE_ICONS } from "./attribute-type-icons";

// 기능 : 저장된 정보 유형에 맞는 고정 아이콘을 표와 생성 입력에서 동일하게 표시합니다.
export function AttributeTypeIcon({ type, className }: { readonly type: string; readonly className?: string }) {
  const Icon = ATTRIBUTE_TYPE_ICONS[type as AttributeDefinitionValueType] ?? Type;
  return <Icon aria-hidden="true" className={cn("h-4 w-4 shrink-0 text-[#9CA3AF]", className)} strokeWidth={2} />;
}
