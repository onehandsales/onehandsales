import { Fragment, useState } from "react";
import type { ViewContentProps } from "./view-content-shared";
import { ViewCellDisplay, ViewEmpty } from "./view-content-shared";
// 기능 : 제목과 표시 속성을 목록 행으로 표시하고 그룹의 접힘을 존중합니다.
export function ListView({ response }: ViewContentProps<"LIST">) {
  const { data, bindings } = response;
  const [folded, setFolded] = useState<Record<string, boolean>>({});
  if (!data.items.length) return <ViewEmpty />;
  return (
    <div data-testid="view-list">
      {data.items.map((item, index) => {
        const group = data.groups.find(
          (group) => group.key === item.groupPath.at(-1),
        );
        const closed = group ? (folded[group.key] ?? group.isFold) : false;
        return (
          <Fragment key={item.occurrenceKey}>
            {group && data.items[index - 1]?.groupPath.at(-1) !== group.key && (
              <h3 className="border-b bg-[#F7F7F5] px-4 py-2 text-xs">
                <button
                  type="button"
                  aria-expanded={!closed}
                  onClick={() =>
                    setFolded((previous) => ({
                      ...previous,
                      [group.key]: !closed,
                    }))
                  }
                >
                  {closed ? "▸" : "▾"} {group.label} · {group.count}
                </button>
              </h3>
            )}
            {!closed && (
              <article
                data-item-key={item.itemKey}
                className={`flex flex-wrap items-center gap-4 border-b border-[#F0EFED] px-4 ${data.presentation.rowDensity === "COMPACT" ? "py-2" : "py-3"}`}
              >
                <h3 className="min-w-40 flex-1 text-sm font-medium">
                  {item.title}
                </h3>
                {bindings
                  .filter(
                    (binding) =>
                      !binding.isHidden && binding.role === "DISPLAY",
                  )
                  .map((binding) => (
                    <div
                      key={binding.id}
                      title={binding.label}
                      className="max-w-60 text-xs"
                    >
                      <ViewCellDisplay
                        binding={binding}
                        cell={item.cells.find(
                          (cell) => cell.bindingId === binding.id,
                        )}
                      />
                    </div>
                  ))}
              </article>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
