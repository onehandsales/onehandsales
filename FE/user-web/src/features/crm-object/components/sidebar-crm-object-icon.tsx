import { Box, type LucideIcon } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { useEffect, useState } from "react";
import {
  getEmojiObjectIconValue,
  getLucideObjectIconName,
  type DynamicLucideIconName,
} from "@/features/crm-object/utils/object-definition-icon-value";
import { cn } from "@/utils/cn";

type LoadedLucideIcon = {
  readonly Icon: LucideIcon;
  readonly name: DynamicLucideIconName;
};

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
  // 1. 이후 단계에서 사용할 loadedIcon 상태를 준비한다.
  const [loadedIcon, setLoadedIcon] = useState<LoadedLucideIcon | null>(null);
  const emojiIcon = getEmojiObjectIconValue(name);
  const iconName = getLucideObjectIconName(name);

  // 2. icon 이름이 바뀌면 해당 lucide icon만 동적으로 불러온다.
  useEffect(() => {
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
  }, [iconName]);

  if (emojiIcon) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex items-center justify-center text-center text-base leading-none",
          className,
        )}
      >
        {emojiIcon}
      </span>
    );
  }

  // 3. 아직 로딩되지 않았거나 유효하지 않은 icon이면 기본 아이콘을 사용한다.
  const Icon =
    loadedIcon !== null && loadedIcon.name === iconName ? loadedIcon.Icon : Box;

  // 4. 계산된 결과를 호출자에게 반환한다.
  return (
    <Icon
      aria-hidden="true"
      className={className}
      strokeWidth={strokeWidth}
    />
  );
}
