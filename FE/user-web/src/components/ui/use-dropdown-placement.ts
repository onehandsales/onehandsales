import { useEffect, useState, type RefObject } from "react";

type DropdownPlacement = "down" | "up";

type UseDropdownPlacementOptions = {
  readonly isOpen: boolean;
  readonly triggerRef: RefObject<HTMLElement | null>;
  readonly estimatedHeight?: number;
  readonly gap?: number;
};

// 기능 : 드롭다운이 열릴 때 스크롤 영역 안의 위/아래 여유 공간을 비교해 열릴 방향을 정합니다.
export function useDropdownPlacement({
  isOpen,
  triggerRef,
  estimatedHeight = 220,
  gap = 4,
}: UseDropdownPlacementOptions): DropdownPlacement {
  const [placement, setPlacement] = useState<DropdownPlacement>("down");

  useEffect(() => {
    if (!isOpen) {
      setPlacement("down");
      return;
    }

    const updatePlacement = () => {
      const trigger = triggerRef.current;

      if (!trigger) {
        return;
      }

      const boundary = getScrollBoundary(trigger);
      const triggerRect = trigger.getBoundingClientRect();
      const boundaryRect = boundary
        ? boundary.getBoundingClientRect()
        : { top: 0, bottom: window.innerHeight };
      const availableBelow = boundaryRect.bottom - triggerRect.bottom - gap;
      const availableAbove = triggerRect.top - boundaryRect.top - gap;
      const shouldOpenUp =
        availableBelow < estimatedHeight && availableAbove > availableBelow;

      setPlacement(shouldOpenUp ? "up" : "down");
    };

    updatePlacement();
    window.addEventListener("resize", updatePlacement);
    window.addEventListener("scroll", updatePlacement, true);

    return () => {
      window.removeEventListener("resize", updatePlacement);
      window.removeEventListener("scroll", updatePlacement, true);
    };
  }, [estimatedHeight, gap, isOpen, triggerRef]);

  return placement;
}

// 기능 : 가장 가까운 세로 스크롤 컨테이너를 찾아 드롭다운 배치 기준으로 사용합니다.
function getScrollBoundary(element: HTMLElement) {
  let current = element.parentElement;

  while (current && current !== document.body) {
    const overflowY = window.getComputedStyle(current).overflowY;

    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") {
      return current;
    }

    current = current.parentElement;
  }

  return null;
}
