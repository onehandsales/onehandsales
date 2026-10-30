import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { DomainError } from "@/shared/domain/errors/domain-error";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import type { ViewDataTokenCodec } from "../ports/view-data-token-codec.port";
import type { ViewDefinitionType } from "../view-definition-type";
import type { ViewDataSnapshot, ViewSourceItem } from "./view-data-loader";
import type {
  ViewDataPart,
  ViewDataRequest,
  ViewDataBase,
  ViewPageInfo,
  ViewPresentation,
  ViewRange,
} from "./view-data.types";
import { jsonObject } from "./view-data-json";
import { ViewDataNeedsConfiguration } from "./view-data.errors";
import { ViewDataConfigurationError } from "./view-data.errors";
import { ViewDataValues } from "./view-data-values";
import { selectViewItems } from "./view-data-selection";
import { viewDataExecutionPolicy } from "./view-data-execution-policy";

const dated = new Set<ViewDefinitionType>(["CALENDAR", "TIMELINE", "GANTT"]);
const aggregate = new Set<ViewDefinitionType>(["CHART", "PIVOT", "DASHBOARD"]);
// 역할 : 타입별 조회기가 공유하는 입력·페이지·응답 맥락을 보관합니다.
export class ViewDataQueryContext {
  readonly values: ViewDataValues;
  readonly items: ViewSourceItem[];
  readonly fingerprint: string;
  readonly contextKey: string;
  readonly part: ViewDataPart;
  readonly range: ViewRange;
  eligibleCount: number;
  // 기능 : 설정을 검증하고 전체 필터·정렬 결과에서 페이지 맥락을 생성합니다.
  constructor(
    readonly snapshot: ViewDataSnapshot,
    readonly request: ViewDataRequest,
    readonly user: CurrentUserContext,
    readonly codec: ViewDataTokenCodec,
    now: number,
    readonly dateEndInclusive:
      | boolean
      | null = viewDataExecutionPolicy.dateEndInclusive,
  ) {
    this.part = request.part ?? "MAIN";
    validateViewDataRequest(snapshot.configuration.view.type, request);
    this.range = resolveRange(request, user.timeZone ?? "UTC", now);
    this.fingerprint = codec.fingerprint({
      configuration: snapshot.configuration,
      attributes: [...snapshot.attributes.values()],
      options: [...snapshot.options.values()],
      titles: snapshot.titles,
      children: snapshot.children,
    });
    this.contextKey = codec.fingerprint({
      userId: user.id,
      workspaceId: snapshot.configuration.view.workspaceId,
      viewId: snapshot.configuration.view.id,
      source: snapshot.source,
      q: request.q?.trim() ?? "",
      range: dated.has(snapshot.configuration.view.type) ? this.range : null,
      bounds: request.bounds ?? null,
      focusItemKey: request.focusItemKey ?? null,
    });
    const groups = new Map(
      snapshot.configuration.viewGroupDefinitions.map((group) => [
        group.id,
        group,
      ]),
    );
    if (
      snapshot.configuration.viewGroupSettingDefinitions.some(
        (setting) =>
          groups.get(setting.viewGroupDefinitionId)?.attributeDefinitionId !==
          setting.attributeDefinitionId,
      )
    )
      throw new ViewDataConfigurationError();
    this.values = new ViewDataValues(snapshot);
    this.items =
      snapshot.configuration.view.type === "DASHBOARD"
        ? []
        : selectViewItems(this.values, request.q?.trim() ?? "");
    this.eligibleCount = this.items.length;
  }
  // 기능 : 설정과 사용자 맥락에 결합된 cursor로 해당 결과만 페이지 처리합니다.
  page<T>(
    items: T[],
    part: ViewDataPart = this.part,
    groupKey: string | null = null,
  ): { items: T[]; pageInfo: ViewPageInfo } {
    let offset = 0;
    if (this.request.cursor) {
      const cursor = this.codec.decode(this.request.cursor);
      if (
        cursor.context !== this.contextKey ||
        cursor.part !== part ||
        cursor.groupKey !== groupKey
      )
        throw new ValidationDomainError("Cursor does not match this query");
      if (cursor.configuration !== this.fingerprint)
        throw new DomainError(
          "ViewDataCursorStale",
          "View configuration changed; restart the query",
        );
      offset = cursor.offset;
      if (offset > items.length)
        throw new DomainError(
          "ViewDataCursorStale",
          "View data changed; restart the query",
        );
    }
    const limit = this.request.limit ?? 25;
    const selected = items.slice(offset, offset + limit);
    const hasNextPage = offset + limit < items.length;
    return {
      items: selected,
      pageInfo: {
        hasNextPage,
        nextCursor: hasNextPage
          ? this.codec.encode({
              context: this.contextKey,
              configuration: this.fingerprint,
              part,
              offset: offset + limit,
              groupKey,
            })
          : null,
      },
    };
  }
  // 기능 : 그룹 이어 읽기를 다른 사용자·View에서 재사용할 수 없도록 제한합니다.
  groupToken(key: string): string {
    return this.codec.encode({
      context: this.contextKey,
      configuration: this.fingerprint,
      part: "GROUP_ITEMS",
      offset: 0,
      groupKey: key,
    });
  }
  // 기능 : 그룹 token을 검증하여 공개된 그룹 key를 복원합니다.
  selectedGroup(): string {
    if (!this.request.groupToken)
      throw new ValidationDomainError("groupToken is required");
    const token = this.codec.decode(this.request.groupToken);
    if (
      token.context !== this.contextKey ||
      token.part !== "GROUP_ITEMS" ||
      !token.groupKey ||
      token.offset !== 0
    )
      throw new ValidationDomainError("Invalid group token");
    if (token.configuration !== this.fingerprint)
      throw new DomainError(
        "ViewDataCursorStale",
        "View configuration changed; restart the query",
      );
    return token.groupKey;
  }
  // 기능 : 공통 응답 메타데이터를 타입별 결과와 같은 snapshot에서 생성합니다.
  base(): ViewDataBase {
    const view = this.snapshot.configuration.view;
    return {
      viewDefinitionId: view.id,
      viewName: view.name,
      source: this.snapshot.source,
      configurationFingerprint: this.fingerprint,
      issues: [],
      bindings: this.values.bindings,
      summary:
        view.type === "DASHBOARD"
          ? null
          : {
              sourceItemCount: this.snapshot.items.length,
              matchedItemCount: this.items.length,
              eligibleItemCount: this.eligibleCount,
            },
    };
  }
  // 기능 : 지원 표시 옵션만 검증하고 명시 기본값과 함께 반환합니다.
  presentation(
    defaults: ViewPresentation,
    choices: Record<string, readonly (string | number | boolean)[]> = {},
  ): ViewPresentation {
    const saved = this.snapshot.configuration.view.configJson;
    if (saved !== null && (typeof saved !== "object" || Array.isArray(saved)))
      throw new ViewDataNeedsConfiguration(
        "VIEW_CONFIG_UNSUPPORTED",
        "configJson",
      );
    const raw = jsonObject(saved);
    const result = { ...defaults };
    for (const [key, value] of Object.entries(raw)) {
      if (
        !(key in defaults) ||
        (typeof value !== "string" &&
          typeof value !== "number" &&
          typeof value !== "boolean")
      )
        throw new ViewDataNeedsConfiguration("VIEW_CONFIG_UNSUPPORTED", key);
      if (
        choices[key]
          ? !choices[key]!.includes(value)
          : typeof value !== typeof defaults[key]
      )
        throw new ViewDataNeedsConfiguration("VIEW_CONFIG_UNSUPPORTED", key);
      result[key] = value;
    }
    return result;
  }
  // 기능 : 역할의 단일성과 허용 속성 타입을 검사합니다.
  binding(role: string, types: string[], required = true, multiple = false) {
    const rows = this.values.bindings.filter(
      (binding) => binding.role === role,
    );
    if (rows.length > 1)
      throw new ViewDataNeedsConfiguration("ROLE_AMBIGUOUS", role);
    const binding = rows[0];
    if (!binding) {
      if (required) throw new ViewDataNeedsConfiguration("ROLE_REQUIRED", role);
      return null;
    }
    if (
      !types.includes(binding.attributeType) ||
      (!multiple && binding.isMultiselect)
    )
      throw new ViewDataNeedsConfiguration(
        "ROLE_TYPE_UNSUPPORTED",
        role,
        binding.id,
      );
    return binding;
  }
}

// 기능 : View Type과 part별 허용 인자를 명시하여 의미 없는 입력을 거부합니다.
export function validateViewDataRequest(
  type: ViewDefinitionType,
  request: ViewDataRequest,
): void {
  const part = request.part ?? "MAIN";
  const allowed: ViewDataPart[] =
    type === "KANBAN"
      ? ["MAIN", "GROUP_ITEMS"]
      : type === "MAP"
        ? ["MAIN", "MAP_ITEMS", "MAP_MARKERS", "UNLOCATED_ITEMS"]
        : dated.has(type)
          ? ["MAIN", "UNSCHEDULED_ITEMS", "INVALID_DATE_ITEMS"]
          : ["MAIN"];
  if (!allowed.includes(part))
    throw new ValidationDomainError("part is not supported by this View type");
  if (
    request.limit !== undefined &&
    (!Number.isInteger(request.limit) ||
      request.limit < 1 ||
      request.limit > 100)
  )
    throw new ValidationDomainError("limit must be between 1 and 100");
  if (
    request.q !== undefined &&
    (request.q.length > 200 || aggregate.has(type))
  )
    throw new ValidationDomainError("q is not supported");
  if (
    aggregate.has(type) &&
    (request.limit !== undefined || request.cursor !== undefined)
  )
    throw new ValidationDomainError("Aggregate results cannot be paged");
  if (
    (type === "KANBAN" || type === "MAP") &&
    part === "MAIN" &&
    request.cursor !== undefined
  )
    throw new ValidationDomainError(
      "Use the corresponding part for pagination",
    );
  if (
    !dated.has(type) &&
    (request.rangeStart !== undefined ||
      request.rangeEnd !== undefined ||
      request.timeZone !== undefined)
  )
    throw new ValidationDomainError("Date range is not supported");
  if (
    type !== "MAP" &&
    (request.bounds !== undefined || request.focusItemKey !== undefined)
  )
    throw new ValidationDomainError("Map parameters are not supported");
  if (
    request.focusItemKey &&
    (!["MAP_ITEMS", "MAP_MARKERS"].includes(part) ||
      request.cursor ||
      !/^(RECORD|LIST_ENTRY):[0-9a-f-]{36}$/i.test(request.focusItemKey))
  )
    throw new ValidationDomainError("Invalid focusItemKey query");
  if ((part === "GROUP_ITEMS") !== (request.groupToken !== undefined))
    throw new ValidationDomainError("groupToken belongs to GROUP_ITEMS");
  if (request.bounds) {
    const [west, south, east, north] = request.bounds;
    if (
      ![west, south, east, north].every(Number.isFinite) ||
      Math.abs(west) > 180 ||
      Math.abs(east) > 180 ||
      south < -90 ||
      north > 90 ||
      south > north
    )
      throw new ValidationDomainError("Invalid map bounds");
  }
}
// 기능 : 기본 현재 월과 명시 기간을 사용자 시간대의 날짜 구간으로 정규화합니다.
function resolveRange(
  request: ViewDataRequest,
  defaultZone: string,
  now: number,
): ViewRange {
  const timeZone = request.timeZone ?? defaultZone;
  let today: string;
  try {
    today = localDate(new Date(now), timeZone);
  } catch {
    throw new ValidationDomainError("Invalid IANA timeZone");
  }
  if (!!request.rangeStart !== !!request.rangeEnd)
    throw new ValidationDomainError(
      "Both rangeStart and rangeEnd are required",
    );
  const startDate = request.rangeStart ?? `${today.slice(0, 7)}-01`;
  const nextMonth = new Date(`${startDate}T00:00:00Z`);
  nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1, 1);
  const endDateExclusive =
    request.rangeEnd ??
    (Number.isNaN(nextMonth.getTime())
      ? ""
      : nextMonth.toISOString().slice(0, 10));
  if (![startDate, endDateExclusive].every(isDate))
    throw new ValidationDomainError("Invalid date range");
  const days =
    (Date.parse(endDateExclusive) - Date.parse(startDate)) / 86400000;
  if (days <= 0 || days > 366)
    throw new ValidationDomainError("Date range must contain 1 to 366 days");
  return { startDate, endDateExclusive, timeZone };
}
// 기능 : 시간대 변환을 거친 달력 날짜를 고정 ISO 형식으로 반환합니다.
export function localDate(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  return ["year", "month", "day"]
    .map((type) => parts.find((part) => part.type === type)!.value)
    .join("-");
}
// 기능 : 존재하지 않는 날짜가 Date의 자동 보정으로 통과하지 못하게 합니다.
function isDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
