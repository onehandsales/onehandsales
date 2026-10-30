import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import type {
  ViewDataRequest,
  WorkspaceViewMainContentResponse,
} from "../types/view-data";

const pageInfo = z.object({
  hasNextPage: z.boolean(),
  nextCursor: z.string().nullable(),
});
const cell = z.object({
  bindingId: z.string(),
  state: z.enum(["VALUE", "EMPTY", "INVALID", "UNAVAILABLE"]),
  values: z.array(
    z.object({
      valueDefinitionId: z.string(),
      sourceEntity: z.object({
        kind: z.enum(["RECORD", "LIST_ENTRY"]),
        id: z.string(),
      }),
      value: z.json(),
    }),
  ),
});
const item = z.object({
  itemKey: z.string(),
  occurrenceKey: z.string(),
  recordDefinitionId: z.string(),
  objectDefinitionId: z.string(),
  listEntryDefinitionId: z.string().nullable(),
  title: z.string(),
  cells: z.array(cell),
  groupPath: z.array(z.string()),
});
const itemPage = z.object({ items: z.array(item), pageInfo });
const presentation = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean(), z.null()]),
);
const group = z.object({
  key: z.string(),
  parentKey: z.string().nullable(),
  label: z.string(),
  color: z.string().nullable(),
  count: z.number().int().nonnegative(),
  isHidden: z.boolean(),
  isFold: z.boolean(),
});
const aggregate = z.object({
  value: z.string().nullable(),
  itemCount: z.number(),
  valueCount: z.number(),
});
const dimension = z.object({
  key: z.string(),
  label: z.string(),
  reference: z
    .object({
      kind: z.enum(["SELECT_OPTION", "STATUS_OPTION", "RECORD", "ACTOR"]),
      id: z.string(),
    })
    .nullable(),
});
const metric = z.object({
  aggregation: z.enum([
    "COUNT_ITEMS",
    "COUNT_VALUES",
    "SUM",
    "AVG",
    "MIN",
    "MAX",
  ]),
  bindingId: z.string().nullable(),
  currencyCode: z.string().nullable(),
  missingValueItemCount: z.number(),
});
const range = z.object({
  startDate: z.string(),
  endDateExclusive: z.string(),
  timeZone: z.string(),
});
const event = z.object({
  item,
  dateKind: z.enum(["DATE", "TIMESTAMP"]),
  start: z.string(),
  end: z.string().nullable(),
  endInclusive: z.boolean(),
});
const endpoint = z.object({
  kind: z.enum(["RECORD", "LIST_ENTRY"]),
  id: z.string(),
  itemKeys: z.array(z.string()),
});
const markerPage = z.object({
  items: z.array(
    z.object({
      key: z.string(),
      item,
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    }),
  ),
  pageInfo,
});
const widget = z.object({
  id: z.string(),
  title: z.string(),
  showTitle: z.boolean(),
  layout: z
    .object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    })
    .nullable(),
  content: z
    .object({
      viewDefinitionId: z.string(),
      viewType: z.string(),
      sourceType: z.enum(["OBJECT", "LIST"]).nullable(),
    })
    .nullable(),
  state: z.enum(["READY", "UNAVAILABLE", "CYCLE", "NEEDS_CONFIGURATION"]),
});
const dateBase = {
  presentation,
  range,
  unscheduledCount: z.number(),
  invalidDateCount: z.number(),
  pageInfo,
};
const mainSchemas = {
  TABLE: itemPage.extend({
    presentation,
    columnBindingIds: z.array(z.string()),
    groups: z.array(group),
  }),
  LIST: itemPage.extend({ presentation, groups: z.array(group) }),
  KANBAN: z.object({
    presentation,
    groupDefinitionId: z.string(),
    columns: z.array(
      group.extend({
        groupToken: z.string(),
        items: z.array(item),
        pageInfo,
        calculations: z.array(z.object({ metric, result: aggregate })),
      }),
    ),
    unassignedCount: z.number(),
  }),
  GALLERY: z.object({
    presentation,
    cards: z.array(
      z.object({
        item,
        body: z.string().nullable(),
        image: z.object({ src: z.string(), alt: z.string() }).nullable(),
      }),
    ),
    pageInfo,
  }),
  CALENDAR: z.object({ ...dateBase, events: z.array(event) }),
  TIMELINE: z.object({
    ...dateBase,
    bars: z.array(event),
    groups: z.array(group),
  }),
  GANTT: z.object({
    ...dateBase,
    tasks: z.array(
      event.extend({
        progress: z
          .object({
            rawValue: z.string(),
            valueScale: z.string(),
            ratio: z.string(),
          })
          .nullable(),
      }),
    ),
    groups: z.array(group),
    dependencies: z.array(
      z.object({
        id: z.string(),
        type: z.enum([
          "FINISH_TO_START",
          "START_TO_START",
          "FINISH_TO_FINISH",
          "START_TO_FINISH",
        ]),
        source: endpoint,
        target: endpoint,
        offset: z.object({
          value: z.string(),
          unit: z.enum(["MINUTE", "HOUR", "DAY"]),
        }),
        renderable: z.boolean(),
      }),
    ),
  }),
  CHART: z.object({
    presentation,
    metric,
    categories: z.array(dimension),
    series: z.array(dimension),
    points: z.array(
      z.object({
        categoryKey: z.string().nullable(),
        seriesKey: z.string().nullable(),
        result: aggregate,
      }),
    ),
    total: aggregate,
  }),
  PIVOT: z.object({
    presentation,
    metric,
    rowDimensions: z.array(dimension),
    columnDimensions: z.array(dimension),
    cells: z.array(
      z.object({
        rowKey: z.string(),
        columnKey: z.string(),
        result: aggregate,
      }),
    ),
    rowTotals: z.array(z.object({ key: z.string(), result: aggregate })),
    columnTotals: z.array(z.object({ key: z.string(), result: aggregate })),
    grandTotal: aggregate,
  }),
  MAP: z.object({
    presentation,
    bounds: z
      .object({
        west: z.number(),
        east: z.number(),
        south: z.number(),
        north: z.number(),
      })
      .nullable(),
    markers: markerPage,
    list: itemPage,
    unlocatedCount: z.number(),
  }),
  DASHBOARD: z.object({
    presentation,
    widgets: z.array(widget),
    visibleWidgetCount: z.number(),
  }),
};
const base = z.object({
  viewDefinitionId: z.string(),
  viewName: z.string(),
  viewType: z.enum([
    "TABLE",
    "KANBAN",
    "LIST",
    "GALLERY",
    "CALENDAR",
    "TIMELINE",
    "GANTT",
    "CHART",
    "PIVOT",
    "MAP",
    "DASHBOARD",
  ]),
  source: z.object({
    kind: z.enum(["OBJECT", "LIST", "NONE"]),
    objectDefinitionId: z.string().nullable(),
    listDefinitionId: z.string().nullable(),
    itemKind: z.enum(["RECORD", "LIST_ENTRY"]).nullable(),
  }),
  configurationFingerprint: z.string(),
  state: z.enum(["READY", "NEEDS_CONFIGURATION"]),
  part: z.enum([
    "MAIN",
    "GROUP_ITEMS",
    "UNSCHEDULED_ITEMS",
    "INVALID_DATE_ITEMS",
    "MAP_ITEMS",
    "MAP_MARKERS",
    "UNLOCATED_ITEMS",
  ]),
  bindings: z.array(
    z.object({
      id: z.string(),
      attributeDefinitionId: z.string(),
      sourceScope: z.enum(["RECORD", "LIST_ENTRY"]),
      referenceAttributeIdPath: z.array(z.string()),
      role: z.string(),
      label: z.string(),
      attributeType: z.string(),
      isMultiselect: z.boolean(),
      isHidden: z.boolean(),
      width: z.number().nullable(),
      format: z.json(),
      currencyCode: z.string().nullable(),
    }),
  ),
  issues: z.array(
    z.object({
      code: z.string(),
      field: z.string().nullable(),
      bindingId: z.string().nullable(),
    }),
  ),
  summary: z
    .object({
      sourceItemCount: z.number(),
      matchedItemCount: z.number(),
      eligibleItemCount: z.number(),
    })
    .nullable(),
  data: z.unknown(),
});

// 기능 : 공통 envelope와 타입별 payload를 검증한 응답만 캐시에 넣습니다.
export function parseViewDataResponse(
  raw: unknown,
): WorkspaceViewMainContentResponse {
  const parsed = base.parse(raw);
  if (parsed.state === "NEEDS_CONFIGURATION") z.null().parse(parsed.data);
  else if (parsed.part === "MAIN")
    mainSchemas[parsed.viewType].parse(parsed.data);
  else if (parsed.part === "MAP_MARKERS") markerPage.parse(parsed.data);
  else if (parsed.part === "GROUP_ITEMS")
    itemPage
      .extend({ groupKey: z.string(), groupToken: z.string() })
      .parse(parsed.data);
  else itemPage.parse(parsed.data);
  return parsed as WorkspaceViewMainContentResponse;
}
// 기능 : 선택한 View와 part의 읽기 요청에 취소 신호를 전달합니다.
export async function getWorkspaceViewData(
  workspaceId: string,
  viewId: string,
  request: ViewDataRequest,
  signal?: AbortSignal,
): Promise<WorkspaceViewMainContentResponse> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(request))
    if (value !== undefined)
      query.set(key, key === "bounds" ? JSON.stringify(value) : String(value));
  const raw = await apiClient<unknown>(
    `/api/users/me/workspaces/${encodeURIComponent(workspaceId)}/view-definitions/${encodeURIComponent(viewId)}/data?${query}`,
    signal ? { signal } : {},
  );
  const response = parseViewDataResponse(raw);
  if (
    response.viewDefinitionId !== viewId ||
    response.part !== (request.part ?? "MAIN")
  )
    throw new Error("View data response does not match request");
  return response;
}
