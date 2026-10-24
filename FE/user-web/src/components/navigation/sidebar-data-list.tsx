import { NavLink } from "react-router-dom";
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
  readonly items: readonly SidebarDataItem[];
  readonly isLoading: boolean;
  readonly label: string;
};

// 기능 : 사이드바 데이터 영역의 로딩·빈 목록·행을 같은 코드로 표시합니다.
export function SidebarDataList({ items, isLoading, label }: SidebarDataListProps) {
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
    <div aria-label={label} className="flex flex-col gap-px" role="list">
      {items.map((item) => (
        <SidebarDataRow item={item} key={item.id} />
      ))}
    </div>
  );
}

// 기능 : 관리 항목을 기준으로 모든 행의 기본·hover·선택 스타일을 결정합니다.
function getSidebarDataRowClassName(isActive: boolean) {
  return cn(
    "group/sidebar-data-row relative flex h-[30px] w-full items-center gap-2 rounded-md px-2 text-left text-[14px] font-medium transition-colors",
    isActive
      ? "bg-[#E4E2DC] text-[#111827] active:bg-[#D3D1CB]"
      : "text-[#4B5563] hover:bg-[#E4E2DC] hover:text-[#111827] active:bg-[#D3D1CB]"
  );
}

// 기능 : 이동 경로 유무와 관계없이 같은 행 스타일과 내용을 사용합니다.
function SidebarDataRow({ item }: { readonly item: SidebarDataItem }) {
  // 1. 경로가 있는 항목만 기존 NavLink의 이동·선택 표시를 사용한다.
  return (
    <div role="listitem">
      {item.to ? (
        <NavLink
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
            : "text-[#9CA3AF] group-hover/sidebar-data-row:text-[#6B7280]"
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
