import { lazy, Suspense, useEffect, useState } from "react";
import { useAppI18n } from "@/features/app-i18n";
import { ApiClientError } from "@/lib/api-client";
import type { WorkspaceViewHeaderModel } from "../hooks/use-workspace-view-header";
import { useViewData, type ViewDataScope } from "../hooks/use-view-data";
import type {
  ViewDataRequest,
  ViewMainResponse,
  ViewRange,
} from "../types/view-data";
import type { ViewCellRenderer } from "./content/view-content-shared";
import { ViewPagination, viewButton } from "./content/view-content-shared";
import { TableView } from "./content/table-view";
import { ListView } from "./content/list-view";
import { KanbanView } from "./content/kanban-view";
import { GalleryView } from "./content/gallery-view";
import { CalendarView } from "./content/calendar-view";
import { TimelineView } from "./content/timeline-view";
import { GanttView } from "./content/gantt-view";
import { ChartView } from "./content/chart-view";
import { PivotView } from "./content/pivot-view";
import { DashboardView } from "./content/dashboard-view";

const MapView = lazy(() =>
  import("./content/map-view").then((module) => ({ default: module.MapView })),
);
type BodyProps = {
  scope: ViewDataScope;
  initialRequest: ViewDataRequest;
  ancestors: string[];
  renderCell?: ViewCellRenderer | undefined;
  embedded?: boolean;
};

// 기능 : 기존 헤더의 선택 View ID로 본문을 연결하고 검색 입력을 지연 조회합니다.
export function WorkspaceViewContent({
  header,
  search = "",
  renderCell,
}: {
  header: WorkspaceViewHeaderModel;
  search?: string;
  renderCell?: ViewCellRenderer;
}) {
  const { t } = useAppI18n();
  const [query, setQuery] = useState(search);
  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(search), 250);
    return () => window.clearTimeout(timer);
  }, [search]);
  if (header.isLoading)
    return <ViewContentStatus message={t("viewContent.loading")} />;
  if (header.isError)
    return (
      <ViewContentStatus
        error
        message={t("viewContent.loadError")}
        onRetry={header.onRetry}
      />
    );
  if (!header.currentView || !header.userId || !header.workspaceId)
    return <ViewContentStatus message={t("viewContent.noView")} />;
  const scope = {
    userId: header.userId,
    workspaceId: header.workspaceId,
    viewId: header.currentView.viewDefinitionId,
  };
  const searchable = !["CHART", "PIVOT", "DASHBOARD"].includes(
    header.currentView.viewType,
  );
  const request: ViewDataRequest = {
    ...(header.targetType ? { sourceType: header.targetType } : {}),
    ...(searchable && query.trim() ? { q: query.trim() } : {}),
  };
  return (
    <ViewDataBody
      key={`${scope.userId}:${scope.workspaceId}:${scope.viewId}:${JSON.stringify(request)}`}
      scope={scope}
      initialRequest={request}
      ancestors={[]}
      renderCell={renderCell}
    />
  );
}

// 기능 : 주 화면·위젯 각각의 로딩·오류·설정 안내와 페이지를 독립 관리합니다.
export function ViewDataBody({
  scope,
  initialRequest,
  ancestors,
  renderCell,
  embedded = false,
}: BodyProps) {
  const { t } = useAppI18n();
  const [request, setRequest] = useState(initialRequest);
  const cycle = ancestors.includes(scope.viewId),
    depthExceeded = ancestors.length >= 3;
  const query = useViewData(scope, request, !cycle && !depthExceeded);
  if (cycle || depthExceeded)
    return (
      <ViewContentStatus
        message={t(cycle ? "viewContent.cycle" : "viewContent.nestingLimit")}
      />
    );
  if (query.isPending)
    return <ViewContentStatus message={t("viewContent.loading")} />;
  if (query.isError) {
    const code = query.error instanceof ApiClientError ? query.error.code : "";
    const message =
      code === "ViewDataQueryLimitExceeded"
        ? "limitExceeded"
        : code === "ViewDataQueryTimedOut"
          ? "timedOut"
          : code === "ViewDataCursorStale"
            ? "staleCursor"
            : query.error instanceof ApiClientError &&
                query.error.statusCode === 404
              ? "unavailable"
              : "loadError";
    return (
      <ViewContentStatus
        error
        message={t(`viewContent.${message}`)}
        onRetry={() => {
          if (request.cursor) setRequest({ ...request, cursor: undefined });
          else void query.refetch();
        }}
      />
    );
  }
  const response = query.data;
  if (response.state === "NEEDS_CONFIGURATION")
    return (
      <ViewContentStatus
        message={t(
          response.issues.some(
            (issue) => issue.code === "DATE_END_POLICY_REQUIRED",
          )
            ? "viewContent.datePolicyRequired"
            : "viewContent.needsConfiguration",
        )}
        onRetry={() => void query.refetch()}
      />
    );
  if (response.part !== "MAIN")
    return <ViewContentStatus error message={t("viewContent.loadError")} />;
  const props = { scope, request, onRequest: setRequest, renderCell };
  // 기능 : 서버의 discriminant와 일치하는 타입별 renderer만 호출합니다.
  function content(data: ViewMainResponse) {
    switch (data.viewType) {
      case "TABLE":
        return <TableView response={data} {...props} />;
      case "LIST":
        return <ListView response={data} {...props} />;
      case "KANBAN":
        return <KanbanView response={data} {...props} />;
      case "GALLERY":
        return <GalleryView response={data} {...props} />;
      case "CALENDAR":
        return <CalendarView response={data} {...props} />;
      case "TIMELINE":
        return <TimelineView response={data} {...props} />;
      case "GANTT":
        return <GanttView response={data} {...props} />;
      case "CHART":
        return <ChartView response={data} {...props} />;
      case "PIVOT":
        return <PivotView response={data} {...props} />;
      case "MAP":
        return (
          <Suspense
            fallback={<ViewContentStatus message={t("viewContent.loading")} />}
          >
            <MapView
              key={data.configurationFingerprint}
              response={data}
              {...props}
            />
          </Suspense>
        );
      case "DASHBOARD":
        return (
          <DashboardView
            response={data}
            {...props}
            renderWidget={(widget) => (
              <ViewDataBody
                key={widget.id}
                scope={{ ...scope, viewId: widget.content!.viewDefinitionId }}
                initialRequest={
                  widget.content!.sourceType
                    ? { sourceType: widget.content!.sourceType }
                    : {}
                }
                ancestors={[...ancestors, scope.viewId]}
                embedded
              />
            )}
          />
        );
    }
  }
  const pageInfo = "pageInfo" in response.data ? response.data.pageInfo : null;
  return (
    <section
      className={`${embedded ? "" : "h-full overflow-auto"} bg-white text-[#37352F]`}
      aria-label={response.viewName}
      aria-busy={query.isFetching}
      data-testid="workspace-view-content"
      data-view-type={response.viewType}
    >
      {response.summary && !embedded && (
        <div className="flex items-center justify-between border-b border-[#F0EFED] px-4 py-2 text-xs text-[#9B9A97]">
          <span>
            {t("viewContent.matched", {
              values: {
                count: response.summary.matchedItemCount,
                total: response.summary.sourceItemCount,
              },
            })}
          </span>
          <button
            type="button"
            className="hover:text-[#37352F]"
            onClick={() => {
              if (request.cursor) setRequest({ ...request, cursor: undefined });
              else void query.refetch();
            }}
          >
            {t("viewContent.refresh")}
          </button>
        </div>
      )}
      {"range" in response.data && (
        <ViewDateNavigation
          range={response.data.range}
          onChange={(rangeStart, rangeEnd) =>
            setRequest({ ...request, rangeStart, rangeEnd, cursor: undefined })
          }
        />
      )}
      {content(response)}
      {pageInfo && (
        <ViewPagination
          pageInfo={pageInfo}
          onNext={(cursor) => setRequest({ ...request, cursor })}
          {...(request.cursor
            ? { onFirst: () => setRequest({ ...request, cursor: undefined }) }
            : {})}
          busy={query.isFetching}
        />
      )}
    </section>
  );
}
// 기능 : 달 이동은 조회 범위만 변경하고 저장 설정을 수정하지 않습니다.
function ViewDateNavigation({
  range,
  onChange,
}: {
  range: ViewRange;
  onChange: (start: string, end: string) => void;
}) {
  const { t } = useAppI18n();
  const move = (delta: number) => {
    const start = new Date(range.startDate);
    start.setUTCMonth(start.getUTCMonth() + delta, 1);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);
    onChange(start.toISOString().slice(0, 10), end.toISOString().slice(0, 10));
  };
  return (
    <div className="flex flex-wrap items-center gap-3 border-b px-4 py-3">
      <button
        type="button"
        className={viewButton}
        aria-label={t("viewContent.previousMonth")}
        onClick={() => move(-1)}
      >
        ‹
      </button>
      <label className="text-sm">
        <span className="sr-only">{t("viewContent.month")}</span>
        <input
          type="month"
          value={range.startDate.slice(0, 7)}
          onChange={(event) => {
            if (!/^\d{4}-\d{2}$/.test(event.target.value)) return;
            const start = `${event.target.value}-01`,
              end = new Date(start);
            end.setUTCMonth(end.getUTCMonth() + 1);
            onChange(start, end.toISOString().slice(0, 10));
          }}
        />
      </label>
      <button
        type="button"
        className={viewButton}
        aria-label={t("viewContent.nextMonth")}
        onClick={() => move(1)}
      >
        ›
      </button>
      <span className="text-xs text-[#9B9A97]">{range.timeZone}</span>
    </div>
  );
}
// 기능 : 비동기 상태를 빈 정상 결과와 구분하여 접근 가능한 안내로 표시합니다.
function ViewContentStatus({
  message,
  error = false,
  onRetry,
}: {
  message: string;
  error?: boolean;
  onRetry?: () => void;
}) {
  const { t } = useAppI18n();
  return (
    <div
      className="flex min-h-40 flex-col items-center justify-center gap-3 p-6 text-center text-sm text-[#787774]"
      role={error ? "alert" : "status"}
    >
      <p>{message}</p>
      {onRetry && (
        <button type="button" className={viewButton} onClick={onRetry}>
          {t("viewContent.retry")}
        </button>
      )}
    </div>
  );
}
