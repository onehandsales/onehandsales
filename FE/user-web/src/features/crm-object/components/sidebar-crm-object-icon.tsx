import { Box, type LucideIcon } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { useEffect, useState } from "react";

type DynamicLucideIconName = keyof typeof dynamicIconImports;

type LoadedLucideIcon = {
  readonly Icon: LucideIcon;
  readonly name: DynamicLucideIconName;
};

type SidebarCrmObjectIconProps = {
  readonly className?: string;
  readonly name?: string | null;
  readonly strokeWidth?: number;
};

// 기능 : CRM Object에 저장된 lucide icon 이름을 사이드바 아이콘으로 렌더링합니다.
export function SidebarCrmObjectIcon({
  className,
  name,
  strokeWidth = 2,
}: SidebarCrmObjectIconProps) {
  // 1. 이후 단계에서 사용할 loadedIcon 상태를 준비한다.
  const [loadedIcon, setLoadedIcon] = useState<LoadedLucideIcon | null>(null);

  // 2. icon 이름이 바뀌면 해당 lucide icon만 동적으로 불러온다.
  useEffect(() => {
    const iconName = getDynamicLucideIconName(name);

    if (!iconName) {
      setLoadedIcon(null);
      return;
    }

    let isActive = true;
    setLoadedIcon((current) => (current?.name === iconName ? current : null));

    void dynamicIconImports[iconName]()
      .then((iconModule) => {
        if (isActive) {
          setLoadedIcon({
            Icon: iconModule.default as LucideIcon,
            name: iconName,
          });
        }
      })
      .catch(() => {
        if (isActive) {
          setLoadedIcon(null);
        }
      });

    return () => {
      isActive = false;
    };
  }, [name]);

  // 3. 아직 로딩되지 않았거나 유효하지 않은 icon이면 기본 아이콘을 사용한다.
  const Icon =
    loadedIcon !== null && loadedIcon.name === name ? loadedIcon.Icon : Box;

  // 4. 계산된 결과를 호출자에게 반환한다.
  return (
    <Icon
      aria-hidden="true"
      className={className}
      strokeWidth={strokeWidth}
    />
  );
}

// 기능 : Backend에서 내려온 icon 문자열이 lucide 동적 아이콘 이름인지 확인합니다.
function getDynamicLucideIconName(
  name: string | null | undefined
): DynamicLucideIconName | null {
  if (
    typeof name === "string" &&
    Object.prototype.hasOwnProperty.call(dynamicIconImports, name)
  ) {
    return name as DynamicLucideIconName;
  }

  return null;
}
