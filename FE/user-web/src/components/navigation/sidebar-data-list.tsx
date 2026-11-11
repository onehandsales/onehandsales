import { NavLink } from "react-router-dom";
import { GripVertical } from "lucide-react";
import { useId, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { useAppI18n } from "@/features/app-i18n";
import { moveSidebarItem, orderItems, type SidebarOrderControl } from "@/features/sidebar-order";
import { IconValueGlyph } from "@/components/ui/icon-value-glyph";
import { cn } from "@/utils/cn";

// 역할 : 사이드바 데이터 영역이 같은 목록·행 UI에 전달할 데이터를 정의합니다.
export type SidebarDataItem = {
  readonly id: string;
  readonly label: string;
  readonly icon: string | null;
  readonly to?: string;
};

type SidebarDataListProps = {
  readonly order?: SidebarOrderControl;
  readonly items: readonly SidebarDataItem[];
  readonly isLoading: boolean;
  readonly label: string;
};

// 기능 : 사이드바 데이터 영역의 로딩·빈 목록·행을 같은 코드로 표시합니다.
export function SidebarDataList({ items, isLoading, label, order }: SidebarDataListProps) {
  const { t } = useAppI18n();
  const helpId = useId();
  const [drag, setDrag] = useState<{ source: string; ids: string[]; mode: "mouse" | "keyboard"; target?: { id: string; side: "before" | "after" } } | null>(null);
  const mouseDrag = useRef<typeof drag>(null);
  const blockClickUntil = useRef(0);
  const [announcement, setAnnouncement] = useState("");
  const enabled = Boolean(order) && !order?.isSaving && items.length > 1;
  const visibleItems = drag?.mode === "keyboard" ? orderItems(items, drag.ids) : items;

  // 기능 : 같은 섹션에서 시작한 이동만 종료하고 최종 전체 순서를 저장합니다.
  function finish(ids?: readonly string[]) {
    mouseDrag.current = null;
    setDrag(null);
    if (ids) void order?.onReorder(ids);
    else setAnnouncement(t("sidebarOrder.canceled"));
  }
  // 1. 모든 데이터 영역에 동일한 로딩 Skeleton을 표시한다.
  if (isLoading) {
    return <SidebarDataSkeletonList />;
  }

  // 2. 관리 항목 기준으로 빈 목록에는 별도 안내 행을 추가하지 않는다.
  if (items.length === 0) {
    return null;
  }

  // 3. 전달받은 순서와 공통 행 컴포넌트를 사용한다.
  return (
    <>
      <div aria-label={label} aria-busy={order?.isSaving || undefined} className="flex flex-col gap-px" role="list"
        onKeyDown={event => { if (event.key === "Escape" && drag) { event.preventDefault(); finish(); } }}
        onClickCapture={event => { if (Date.now() < blockClickUntil.current) { event.preventDefault(); event.stopPropagation(); } }}>
        {visibleItems.map(item => (
          <SidebarDataRow item={item} key={item.id}
            rowProps={{
              draggable: enabled,
              "data-sidebar-item-id": item.id,
              onDragStart: event => {
                if (!enabled) { event.preventDefault(); return; }
                const next = { source: item.id, ids: items.map(row => row.id), mode: "mouse" as const };
                mouseDrag.current = next;
                setDrag(next);
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("application/x-onehand-sidebar-item", item.id);
              },
              onDragOver: event => {
                const current = mouseDrag.current;
                if (!current || !enabled) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                const rect = event.currentTarget.getBoundingClientRect();
                const target = { id: item.id, side: event.clientY < rect.top + rect.height / 2 ? "before" as const : "after" as const };
                const next = { ...current, target };
                mouseDrag.current = next;
                setDrag(next);
              },
              onDrop: event => {
                const current = mouseDrag.current;
                if (!current || !enabled) return;
                event.preventDefault();
                event.stopPropagation();
                blockClickUntil.current = Date.now() + 250;
                finish(moveSidebarItem(current.ids, current.source, item.id, current.target?.side ?? "before"));
              },
              onDragEnd: () => { mouseDrag.current = null; setDrag(null); },
              className: cn("group/sidebar-sortable relative", drag?.source === item.id && "opacity-50"),
            }}
            indicator={drag?.mode === "mouse" && drag.source !== item.id && drag.target?.id === item.id ? (
              <span aria-hidden="true" className={cn("pointer-events-none absolute inset-x-0 z-10 h-[4px] bg-[#4880EE]", drag.target.side === "before" ? "-top-px" : "-bottom-px")} />
            ) : null}
            handle={order && items.length > 1 ? (
              <button type="button" draggable={false} disabled={!enabled} aria-describedby={helpId}
                aria-label={t("sidebarOrder.handle", { values: { name: item.label } })}
                aria-pressed={drag?.mode === "keyboard" && drag.source === item.id}
                title={t("sidebarOrder.handle", { values: { name: item.label } })}
                className="absolute right-1 top-1/2 flex h-6 w-5 -translate-y-1/2 cursor-grab items-center justify-center rounded text-[#9CA3AF] opacity-0 focus:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9CA3AF] active:cursor-grabbing disabled:cursor-wait group-hover/sidebar-sortable:opacity-100"
                onClick={event => { event.preventDefault(); event.stopPropagation(); }}
                onKeyDown={event => {
                  if (!enabled) return;
                  if (event.key === " " || event.key === "Enter") {
                    event.preventDefault();
                    if (drag?.mode === "keyboard" && drag.source === item.id) finish(drag.ids);
                    else {
                      setDrag({ source: item.id, ids: items.map(row => row.id), mode: "keyboard" });
                      setAnnouncement(t("sidebarOrder.picked", { values: { name: item.label } }));
                    }
                  } else if (drag?.mode === "keyboard" && drag.source === item.id && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
                    event.preventDefault();
                    const from = drag.ids.indexOf(item.id), to = from + (event.key === "ArrowUp" ? -1 : 1);
                    if (to < 0 || to >= drag.ids.length) return;
                    const ids = [...drag.ids];
                    [ids[from], ids[to]] = [ids[to]!, ids[from]!];
                    setDrag({ ...drag, ids });
                    setAnnouncement(t("sidebarOrder.moved", { values: { position: to + 1 } }));
                  } else if (event.key === "Tab" && drag?.mode === "keyboard") finish();
                }}>
                <GripVertical aria-hidden="true" className="h-4 w-4" />
              </button>
            ) : null} />
        ))}
      </div>
      {order ? <>
        <span id={helpId} className="sr-only">{t("sidebarOrder.help")}</span>
        <span role="status" className="sr-only">{order.isSaving ? t("sidebarOrder.saving") : announcement}</span>
        {order.error ? <p role="alert" className="px-2 py-1 text-[12px] text-[#6B7280]">{t(`sidebarOrder.${order.error}`)}</p> : null}
      </> : null}
    </>
  );
}

// 기능 : 관리 항목을 기준으로 모든 행의 기본·hover·선택 스타일을 결정합니다.
function getSidebarDataRowClassName(isActive: boolean) {
  return cn(
    "group/sidebar-data-row relative flex h-[30px] w-full items-center gap-2 rounded-md px-2 text-left text-[14px] font-medium transition-colors",
    isActive
      ? "bg-[#E4E2DC] text-[#111827] active:bg-[#D3D1CB]"
      : "text-[#4B5563] group-hover/sidebar-sortable:bg-[#E4E2DC] group-hover/sidebar-sortable:text-[#111827] active:bg-[#D3D1CB] group-hover/sidebar-sortable:active:bg-[#D3D1CB]"
  );
}

// 기능 : 이동 경로 유무와 관계없이 같은 행 스타일과 내용을 사용합니다.
function SidebarDataRow({ item, rowProps, handle, indicator }: { readonly item: SidebarDataItem; readonly rowProps?: HTMLAttributes<HTMLDivElement> & { "data-sidebar-item-id"?: string }; readonly handle?: ReactNode; readonly indicator?: ReactNode }) {
  // 1. 경로가 있는 항목만 기존 NavLink의 이동·선택 표시를 사용한다.
  return (
    <div role="listitem" {...rowProps}>
      {item.to ? (
        <NavLink
          draggable={false}
          className={({ isActive }) => getSidebarDataRowClassName(isActive)}
          to={item.to}
        >
          {({ isActive }) => (
            <SidebarDataRowContent item={item} isActive={isActive} />
          )}
        </NavLink>
      ) : (
        <div className={getSidebarDataRowClassName(false)}>
          <SidebarDataRowContent item={item} isActive={false} />
        </div>
      )}
      {handle}
      {indicator}
    </div>
  );
}

// 기능 : 모든 데이터 영역의 아이콘과 이름을 하나의 JSX로 렌더링합니다.
function SidebarDataRowContent({
  item,
  isActive,
}: {
  readonly item: SidebarDataItem;
  readonly isActive: boolean;
}) {
  return (
    <>
      <IconValueGlyph
        className={cn(
          "h-5 w-5 shrink-0",
          isActive
            ? "text-[#6B7280]"
            : "text-[#9CA3AF] group-hover/sidebar-sortable:text-[#6B7280]"
        )}
        name={item.icon}
        strokeWidth={2}
      />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
    </>
  );
}

const SIDEBAR_SKELETON_WIDTHS = ["w-20", "w-28", "w-24"] as const;

// 기능 : 업무 목록과 관리 항목에 같은 크기의 로딩 행을 표시합니다.
function SidebarDataSkeletonList() {
  return (
    <div aria-hidden="true" className="contents">
      {SIDEBAR_SKELETON_WIDTHS.map((widthClassName) => (
        <SidebarDataSkeleton
          key={widthClassName}
          textWidthClassName={widthClassName}
        />
      ))}
    </div>
  );
}

// 기능 : 관리 항목 행 크기를 기준으로 공통 Skeleton 한 줄을 표시합니다.
function SidebarDataSkeleton({
  textWidthClassName,
}: {
  readonly textWidthClassName: string;
}) {
  return (
    <div className="flex h-[30px] w-full items-center gap-2 rounded-md px-2">
      <span className="h-5 w-5 shrink-0 rounded-md bg-[#E4E2DC] opacity-80 animate-pulse" />
      <span
        className={cn(
          "h-2.5 rounded-full bg-[#E4E2DC] opacity-80 animate-pulse",
          textWidthClassName
        )}
      />
    </div>
  );
}
