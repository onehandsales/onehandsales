import { Fragment, useState } from "react";
import type { ViewContentProps } from "./view-content-shared";
import { ViewCellDisplay, ViewEmpty } from "./view-content-shared";

// 기능 : 저장된 열 순서·너비·그룹을 사용하여 선택 View의 표를 표시합니다.
export function TableView({ response, renderCell }: ViewContentProps<"TABLE">) {
  const { data, bindings } = response;
  const [folded, setFolded] = useState<Record<string, boolean>>({});
  const columns = data.columnBindingIds.flatMap((id) => {
    const binding = bindings.find((binding) => binding.id === id);
    return binding ? [binding] : [];
  });
  if (!data.items.length) return <ViewEmpty />;
  return (
    <div className="overflow-x-auto">
      <table
        className="w-full border-collapse text-left text-sm"
        data-testid="view-table"
      >
        <thead>
          <tr>
            {columns.map((binding) => (
              <th
                key={binding.id}
                scope="col"
                style={{
                  minWidth: binding.width ?? 160,
                  width: binding.width ?? 160,
                }}
                className="sticky top-0 border-b border-r border-[#EEEDEA] bg-white px-3 py-2 font-normal text-[#787774]"
              >
                {binding.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => {
            const group = data.groups.find(
              (group) => group.key === item.groupPath.at(-1),
            );
            const previous = data.items[index - 1];
            const firstInGroup =
              group && previous?.groupPath.at(-1) !== group.key;
            const closed = group ? (folded[group.key] ?? group.isFold) : false;
            return (
              <Fragment key={item.occurrenceKey}>
                {firstInGroup && (
                  <tr>
                    <th
                      colSpan={Math.max(columns.length, 1)}
                      className="border-b bg-[#F7F7F5] px-3 py-2 text-xs font-medium"
                    >
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
                        {closed ? "▸" : "▾"} {group.label}{" "}
                        <span className="ml-2 text-[#9B9A97]">
                          {group.count}
                        </span>
                      </button>
                    </th>
                  </tr>
                )}
                {!closed && (
                  <tr
                    data-item-key={item.itemKey}
                    className="hover:bg-[#FAFAF9]"
                  >
                    {columns.map((binding) => {
                      const cell = item.cells.find(
                        (cell) => cell.bindingId === binding.id,
                      );
                      return (
                        <td
                          key={binding.id}
                          className={`border-b border-r border-[#F0EFED] px-3 ${data.presentation.rowDensity === "COMPACT" ? "py-1" : "py-2.5"}`}
                        >
                          {renderCell?.(item, binding, cell) ?? (
                            <ViewCellDisplay binding={binding} cell={cell} />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
