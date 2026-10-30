import type { ReactNode } from "react";
import { useAppI18n } from "@/features/app-i18n";
import type { ViewWidget } from "../../types/view-data";
import type { ViewContentProps } from "./view-content-shared";
// 기능 : 위젯 ID별 배치를 보존하고 원본 조회 실패를 위젯 안에 격리합니다.
export function DashboardView({
  response,
  renderWidget,
}: ViewContentProps<"DASHBOARD"> & {
  renderWidget: (widget: ViewWidget) => ReactNode;
}) {
  const { t } = useAppI18n();
  const columns = Number(response.data.presentation.gridColumns) || 12;
  return (
    <div
      className="view-dashboard-grid grid gap-4 p-4"
      style={{
        gridTemplateColumns: `repeat(${columns},minmax(0,1fr))`,
        gridAutoRows: "72px",
      }}
      data-testid="view-dashboard"
    >
      {response.data.widgets.map((widget) => (
        <section
          key={widget.id}
          className="view-dashboard-widget flex min-h-48 min-w-0 flex-col overflow-hidden rounded-md border border-[#E8E7E4] bg-white"
          style={
            widget.layout
              ? {
                  gridColumn: `${widget.layout.x + 1} / span ${widget.layout.width}`,
                  gridRow: `${widget.layout.y + 1} / span ${widget.layout.height}`,
                }
              : { gridColumn: `span ${columns}` }
          }
        >
          {widget.showTitle && (
            <h3 className="shrink-0 border-b border-[#F0EFED] px-4 py-3 text-sm font-medium">
              {widget.title}
            </h3>
          )}
          <div className="min-h-0 flex-1 overflow-auto">
            {widget.state === "READY" && widget.content ? (
              renderWidget(widget)
            ) : (
              <p className="p-4 text-sm text-[#9B9A97]">
                {t(
                  `viewContent.${widget.state === "CYCLE" ? "cycle" : widget.state === "UNAVAILABLE" ? "unavailable" : "needsConfiguration"}`,
                )}
              </p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
