import { IconValueGlyph } from "@/components/ui/icon-value-glyph";

type SidebarCrmObjectIconProps = {
  readonly className?: string;
  readonly name?: string | null;
  readonly strokeWidth?: number;
};

// 기능 : CRM Object에 저장된 이모지 또는 lucide icon 이름을 사이드바 아이콘으로 렌더링합니다.
export function SidebarCrmObjectIcon({
  className,
  name,
  strokeWidth = 2,
}: SidebarCrmObjectIconProps) {
  return (
    <IconValueGlyph
      className={className}
      name={name}
      strokeWidth={strokeWidth}
    />
  );
}
