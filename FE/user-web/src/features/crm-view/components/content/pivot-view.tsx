import { useAppI18n } from "@/features/app-i18n";
import type { ViewContentProps } from "./view-content-shared";
import { ViewEmpty } from "./view-content-shared";
import { decimalLabel } from "../../utils/view-data-display";
// 기능 : 없는 조합·값 누락·실제 0을 구분하는 피벗 표를 표시합니다.
export function PivotView({ response }: ViewContentProps<"PIVOT">) {
  const { t } = useAppI18n();
  const { data } = response;
  if (!data.rowDimensions.length) return <ViewEmpty />;
  return (
    <div className="overflow-x-auto p-4" data-testid="view-pivot">
      <table className="w-full border-collapse text-right text-sm">
        <thead>
          <tr>
            <th className="min-w-40 border-b px-3 py-2 text-left font-normal">
              {t("viewContent.group")}
            </th>
            {data.columnDimensions.map((column) => (
              <th
                key={column.key}
                className="min-w-28 border-b px-3 py-2 font-normal"
              >
                {column.label}
              </th>
            ))}
            {data.presentation.showRowTotals && (
              <th className="border-b px-3 py-2 font-medium">
                {t("viewContent.total")}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.rowDimensions.map((row) => (
            <tr key={row.key}>
              <th
                scope="row"
                className="border-b px-3 py-2 text-left font-medium"
              >
                {row.label}
              </th>
              {data.columnDimensions.map((column) => {
                const cell = data.cells.find(
                  (cell) =>
                    cell.rowKey === row.key && cell.columnKey === column.key,
                );
                return (
                  <td
                    key={column.key}
                    className="border-b px-3 py-2"
                    title={
                      cell
                        ? cell.result.value === null
                          ? t("viewContent.noMeasure")
                          : undefined
                        : t("viewContent.noCombination")
                    }
                  >
                    {cell ? decimalLabel(cell.result.value) : "·"}
                  </td>
                );
              })}
              {data.presentation.showRowTotals && (
                <td className="border-b bg-[#FAFAF9] px-3 py-2 font-medium">
                  {decimalLabel(
                    data.rowTotals.find((total) => total.key === row.key)
                      ?.result.value ?? null,
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
        {data.presentation.showColumnTotals && (
          <tfoot>
            <tr>
              <th className="px-3 py-3 text-left">{t("viewContent.total")}</th>
              {data.columnDimensions.map((column) => (
                <td key={column.key} className="px-3 py-3 font-medium">
                  {decimalLabel(
                    data.columnTotals.find((total) => total.key === column.key)
                      ?.result.value ?? null,
                  )}
                </td>
              ))}
              {data.presentation.showRowTotals && (
                <td className="px-3 py-3 font-semibold">
                  {decimalLabel(data.grandTotal.value)}
                </td>
              )}
            </tr>
          </tfoot>
        )}
      </table>
      <p className="mt-3 text-xs text-[#9B9A97]">
        {t("viewContent.total")}:{" "}
        {decimalLabel(data.grandTotal.value, data.metric.currencyCode)}
      </p>
    </div>
  );
}
