import type { WorkspaceViewType as ViewDefinitionType } from "./workspace-view";
export type ViewSourceScope = "RECORD" | "LIST_ENTRY";
export type AttributeDefinitionType =
  | "ActorReference"
  | "Checkbox"
  | "Currency"
  | "Date"
  | "Domain"
  | "EmailAddress"
  | "Interaction"
  | "Location"
  | "PersonalName"
  | "Number"
  | "PhoneNumber"
  | "Rating"
  | "RecordReference"
  | "Select"
  | "Status"
  | "Text"
  | "Timestamp";
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type ViewDataPart =
  | "MAIN"
  | "GROUP_ITEMS"
  | "UNSCHEDULED_ITEMS"
  | "INVALID_DATE_ITEMS"
  | "MAP_MARKERS"
  | "MAP_ITEMS"
  | "UNLOCATED_ITEMS";
// 역할 : 검증 후 application에 전달하는 주 화면 조회 매개변수입니다.
export interface ViewDataRequest {
  sourceType?: "OBJECT" | "LIST";
  part?: ViewDataPart;
  q?: string;
  limit?: number;
  cursor?: string;
  groupToken?: string;
  rangeStart?: string;
  rangeEnd?: string;
  timeZone?: string;
  bounds?: [number, number, number, number];
  focusItemKey?: string;
}
export type ViewDataSource = {
  kind: "OBJECT" | "LIST" | "NONE";
  objectDefinitionId: string | null;
  listDefinitionId: string | null;
  itemKind: "RECORD" | "LIST_ENTRY" | null;
};
export type ViewDataIssue = {
  code: string;
  field: string | null;
  bindingId: string | null;
};
export type ViewDataBinding = {
  id: string;
  attributeDefinitionId: string;
  sourceScope: ViewSourceScope;
  referenceAttributeIdPath: string[];
  role: string;
  label: string;
  attributeType: AttributeDefinitionType;
  isMultiselect: boolean;
  isHidden: boolean;
  width: number | null;
  format: JsonValue;
  currencyCode: string | null;
};
export type ViewCellValue = {
  valueDefinitionId: string;
  sourceEntity: { kind: ViewSourceScope; id: string };
  value: JsonValue;
};
export type ViewCell = {
  bindingId: string;
  state: "VALUE" | "EMPTY" | "INVALID" | "UNAVAILABLE";
  values: ViewCellValue[];
};
export type ViewDataItem = {
  itemKey: string;
  occurrenceKey: string;
  recordDefinitionId: string;
  objectDefinitionId: string;
  listEntryDefinitionId: string | null;
  title: string;
  cells: ViewCell[];
  groupPath: string[];
};
export type ViewPageInfo = { hasNextPage: boolean; nextCursor: string | null };
export type ViewItemPage = { items: ViewDataItem[]; pageInfo: ViewPageInfo };
export type ViewDataGroup = {
  key: string;
  parentKey: string | null;
  label: string;
  color: string | null;
  count: number;
  isHidden: boolean;
  isFold: boolean;
};
export type ViewAggregate = {
  value: string | null;
  itemCount: number;
  valueCount: number;
};
export type ViewMetric = {
  aggregation: "COUNT_ITEMS" | "COUNT_VALUES" | "SUM" | "AVG" | "MIN" | "MAX";
  bindingId: string | null;
  currencyCode: string | null;
  missingValueItemCount: number;
};
export type ViewDimension = {
  key: string;
  label: string;
  reference: {
    kind: "STATUS_OPTION" | "SELECT_OPTION" | "RECORD" | "ACTOR";
    id: string;
  } | null;
};
export type ViewRange = {
  startDate: string;
  endDateExclusive: string;
  timeZone: string;
};
export type ViewEvent = {
  item: ViewDataItem;
  dateKind: "DATE" | "TIMESTAMP";
  start: string;
  end: string | null;
  endInclusive: boolean;
};
export type ViewGanttTask = ViewEvent & {
  progress: { rawValue: string; valueScale: string; ratio: string } | null;
};
export type ViewDependencyEndpoint = {
  kind: "RECORD" | "LIST_ENTRY";
  id: string;
  itemKeys: string[];
};
export type ViewDependency = {
  id: string;
  type:
    | "FINISH_TO_START"
    | "START_TO_START"
    | "FINISH_TO_FINISH"
    | "START_TO_FINISH";
  source: ViewDependencyEndpoint;
  target: ViewDependencyEndpoint;
  offset: { value: string; unit: "MINUTE" | "HOUR" | "DAY" };
  renderable: boolean;
};
export type ViewMarker = {
  key: string;
  item: ViewDataItem;
  latitude: number;
  longitude: number;
};
export type ViewMarkerPage = { items: ViewMarker[]; pageInfo: ViewPageInfo };
export type ViewBounds = {
  west: number;
  south: number;
  east: number;
  north: number;
};
export type ViewWidget = {
  id: string;
  title: string;
  showTitle: boolean;
  layout: { x: number; y: number; width: number; height: number } | null;
  content: {
    viewDefinitionId: string;
    viewType: ViewDefinitionType;
    sourceType: "OBJECT" | "LIST" | null;
  } | null;
  state: "READY" | "UNAVAILABLE" | "CYCLE" | "NEEDS_CONFIGURATION";
};
export type ViewPresentation = Record<string, string | number | boolean | null>;
export type ViewMainDataByType = {
  TABLE: ViewItemPage & {
    presentation: ViewPresentation;
    columnBindingIds: string[];
    groups: ViewDataGroup[];
  };
  KANBAN: {
    presentation: ViewPresentation;
    groupDefinitionId: string;
    columns: (ViewDataGroup &
      ViewItemPage & {
        groupToken: string;
        calculations: { metric: ViewMetric; result: ViewAggregate }[];
      })[];
    unassignedCount: number;
  };
  LIST: ViewItemPage & {
    presentation: ViewPresentation;
    groups: ViewDataGroup[];
  };
  GALLERY: {
    presentation: ViewPresentation;
    cards: {
      item: ViewDataItem;
      body: string | null;
      image: { src: string; alt: string } | null;
    }[];
    pageInfo: ViewPageInfo;
  };
  CALENDAR: {
    presentation: ViewPresentation;
    range: ViewRange;
    events: ViewEvent[];
    unscheduledCount: number;
    invalidDateCount: number;
    pageInfo: ViewPageInfo;
  };
  TIMELINE: {
    presentation: ViewPresentation;
    range: ViewRange;
    bars: ViewEvent[];
    groups: ViewDataGroup[];
    unscheduledCount: number;
    invalidDateCount: number;
    pageInfo: ViewPageInfo;
  };
  GANTT: {
    presentation: ViewPresentation;
    range: ViewRange;
    tasks: ViewGanttTask[];
    dependencies: ViewDependency[];
    groups: ViewDataGroup[];
    unscheduledCount: number;
    invalidDateCount: number;
    pageInfo: ViewPageInfo;
  };
  CHART: {
    presentation: ViewPresentation;
    metric: ViewMetric;
    categories: ViewDimension[];
    series: ViewDimension[];
    points: {
      categoryKey: string | null;
      seriesKey: string | null;
      result: ViewAggregate;
    }[];
    total: ViewAggregate;
  };
  PIVOT: {
    presentation: ViewPresentation;
    metric: ViewMetric;
    rowDimensions: ViewDimension[];
    columnDimensions: ViewDimension[];
    cells: { rowKey: string; columnKey: string; result: ViewAggregate }[];
    rowTotals: { key: string; result: ViewAggregate }[];
    columnTotals: { key: string; result: ViewAggregate }[];
    grandTotal: ViewAggregate;
  };
  MAP: {
    presentation: ViewPresentation;
    bounds: ViewBounds | null;
    markers: ViewMarkerPage;
    list: ViewItemPage;
    unlocatedCount: number;
  };
  DASHBOARD: {
    presentation: ViewPresentation;
    widgets: ViewWidget[];
    visibleWidgetCount: number;
  };
};
export type ViewDataBase = {
  viewDefinitionId: string;
  viewName: string;
  source: ViewDataSource;
  configurationFingerprint: string;
  issues: ViewDataIssue[];
  bindings: ViewDataBinding[];
  summary: {
    sourceItemCount: number;
    matchedItemCount: number;
    eligibleItemCount: number;
  } | null;
};
export type ViewMainResponse = {
  [T in ViewDefinitionType]: ViewDataBase & {
    state: "READY";
    part: "MAIN";
    viewType: T;
    data: ViewMainDataByType[T];
  };
}[ViewDefinitionType];
export type ViewPartialResponse = ViewDataBase & {
  state: "READY";
  viewType: ViewDefinitionType;
} & (
    | {
        part: "GROUP_ITEMS";
        data: ViewItemPage & { groupKey: string; groupToken: string };
      }
    | {
        part:
          | "UNSCHEDULED_ITEMS"
          | "INVALID_DATE_ITEMS"
          | "MAP_ITEMS"
          | "UNLOCATED_ITEMS";
        data: ViewItemPage;
      }
    | { part: "MAP_MARKERS"; data: ViewMarkerPage }
  );
export type WorkspaceViewMainContentResponse =
  | ViewMainResponse
  | ViewPartialResponse
  | (ViewDataBase & {
      state: "NEEDS_CONFIGURATION";
      viewType: ViewDefinitionType;
      part: ViewDataPart;
      data: null;
    });
