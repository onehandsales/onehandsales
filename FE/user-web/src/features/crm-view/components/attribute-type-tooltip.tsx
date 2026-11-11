import { useLayoutEffect, useRef, useState } from "react";

type AttributeTypeTooltipProps = {
  readonly id: string;
  readonly anchor: HTMLElement;
  readonly description: string;
  readonly onEnter: () => void;
  readonly onLeave: () => void;
};

// 기능 : 유형 도움말을 스크롤 영역 밖에 표시하고 화면 가장자리에서 방향을 바꿉니다.
export function AttributeTypeTooltip({ id, anchor, description, onEnter, onLeave }: AttributeTypeTooltipProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<{ left: number; top: number; width: number; maxHeight: number } | null>(null);

  useLayoutEffect(() => {
    const tooltip = ref.current;
    if (!tooltip) return;
    // 기능 : 키보드 이동으로 스크롤된 뒤에도 도움말을 현재 아이콘 위치에 맞춥니다.
    function updatePlacement() {
      if (!tooltip) return;
      const viewport = window.visualViewport;
      const leftEdge = (viewport?.offsetLeft ?? 0) + 8;
      const topEdge = (viewport?.offsetTop ?? 0) + 8;
      const rightEdge = leftEdge + (viewport?.width ?? window.innerWidth) - 16;
      const bottomEdge = topEdge + (viewport?.height ?? window.innerHeight) - 16;
      const width = Math.min(240, rightEdge - leftEdge);
      const maxHeight = bottomEdge - topEdge;
      // 1. 실제 줄바꿈 높이를 읽은 뒤 위치를 정해 처음 표시될 때 잘리지 않게 한다.
      tooltip.style.width = `${width}px`;
      tooltip.style.maxHeight = `${maxHeight}px`;
      const height = tooltip.getBoundingClientRect().height;
      const rect = anchor.getBoundingClientRect();
      const fitsRight = rect.right + 8 + width <= rightEdge;
      const fitsLeft = rect.left - 8 - width >= leftEdge;
      const left = fitsRight ? rect.right + 8 : fitsLeft ? rect.left - 8 - width : rect.left + rect.width / 2 - width / 2;
      const top = fitsRight || fitsLeft ? rect.top + rect.height / 2 - height / 2
        : rect.bottom + 8 + height <= bottomEdge ? rect.bottom + 8 : rect.top - height - 8;
      setPlacement({
        left: Math.max(leftEdge, Math.min(left, rightEdge - width)),
        top: Math.max(topEdge, Math.min(top, bottomEdge - height)),
        width, maxHeight,
      });
    }
    updatePlacement();
    window.addEventListener("scroll", updatePlacement, true);
    return () => window.removeEventListener("scroll", updatePlacement, true);
  }, [anchor, description]);

  return <div ref={ref} id={id} role="tooltip"
    className="fixed z-[110] overflow-y-auto rounded-md bg-[#111827] px-3 py-2 text-left font-sans text-[12px] font-normal leading-5 text-white shadow-lg"
    style={placement ?? { left: 0, top: 0, width: 240, visibility: "hidden" }}
    onPointerEnter={onEnter} onPointerLeave={onLeave}
    onPointerDown={event => { event.preventDefault(); event.stopPropagation(); }}
    onClick={event => { event.preventDefault(); event.stopPropagation(); }}>
    {description}
  </div>;
}
