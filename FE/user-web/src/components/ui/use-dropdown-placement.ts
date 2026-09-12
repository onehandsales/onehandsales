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
    // 1. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (!isOpen) {
      setPlacement("down");
      return;
    }

    // 기능 : update Placement 정보를 수정합니다.
    // 2. 이후 처리에 사용할 updatePlacement을 계산한다.
    const updatePlacement = () => {
      // 1. 이후 처리에 사용할 trigger을 계산한다.
      const trigger = triggerRef.current;

      // 2. 조건을 확인해 필요한 분기 처리를 수행한다.
      if (!trigger) {
        return;
      }

      // 3. 이후 처리에 사용할 boundary을 계산한다.
      const boundary = getScrollBoundary(trigger);
      // 4. 이후 처리에 사용할 triggerRect을 계산한다.
      const triggerRect = trigger.getBoundingClientRect();
      // 5. 이후 처리에 사용할 boundaryRect을 계산한다.
      const boundaryRect = boundary
        ? boundary.getBoundingClientRect()
        : { top: 0, bottom: window.innerHeight };
      // 6. 이후 처리에 사용할 availableBelow을 계산한다.
      const availableBelow = boundaryRect.bottom - triggerRect.bottom - gap;
      // 7. 이후 처리에 사용할 availableAbove을 계산한다.
      const availableAbove = triggerRect.top - boundaryRect.top - gap;
      // 8. 이후 처리에 사용할 shouldOpenUp을 계산한다.
      const shouldOpenUp =
        availableBelow < estimatedHeight && availableAbove > availableBelow;

      // 9. 화면 상태를 현재 흐름에 맞게 갱신한다.
      setPlacement(shouldOpenUp ? "up" : "down");
    };

    // 3. 현재 단계에서 필요한 side effect를 실행한다.
    updatePlacement();
    // 4. 브라우저 이벤트 listener를 등록하거나 정리한다.
    window.addEventListener("resize", updatePlacement);
    // 5. 브라우저 이벤트 listener를 등록하거나 정리한다.
    window.addEventListener("scroll", updatePlacement, true);

    // 6. 계산된 결과를 호출자에게 반환한다.
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
