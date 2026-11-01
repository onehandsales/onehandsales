import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { DomainError } from "@/shared/domain/errors/domain-error";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import type { ViewDataTokenCodec } from "../ports/view-data-token-codec.port";
import type { ViewDefinitionType } from "../view-definition-type";
import type { ViewDataSnapshot } from "./view-data-loader";
import type { ViewDataPart, ViewDataRequest, ViewDataBase, ViewPageInfo, ViewPresentation, SupportedViewDataType } from "./view-data.types";
import { jsonObject } from "./view-data-json";
import { ViewDataNeedsConfiguration, ViewDataConfigurationError } from "./view-data.errors";
import { ViewDataValues } from "./view-data-values";
import { selectViewItems } from "./view-data-selection";

// 기능 : 기존 enum을 바꾸지 않고 이번 조회의 지원 범위를 검사합니다.
export function assertSupportedViewType(type: ViewDefinitionType): asserts type is SupportedViewDataType {
  if (!["TABLE", "KANBAN", "LIST"].includes(type))
    throw new DomainError("ViewDataTypeUnsupported", "This View type is not supported by this query");
}
// 역할 : 공통 설정·필터·정렬·페이지와 세 타입의 응답 맥락을 관리합니다.
export class ViewDataQueryContext {
  readonly values: ViewDataValues;
  readonly items: ViewDataSnapshot["items"];
  readonly fingerprint: string;
  readonly contextKey: string;
  readonly part: ViewDataPart;
  readonly viewType: SupportedViewDataType;
  eligibleCount: number;
  // 기능 : snapshot의 설정과 사용자 맥락으로 전체 조회 결과를 준비합니다.
  constructor(
    readonly snapshot: ViewDataSnapshot,
    readonly request: ViewDataRequest,
    readonly user: CurrentUserContext,
    readonly codec: ViewDataTokenCodec,
  ) {
    // 1. 실행 범위와 설정 무결성을 확인하고 페이지 맥락을 생성한다.
    assertSupportedViewType(snapshot.configuration.view.type);
    this.viewType = snapshot.configuration.view.type;
    this.part = request.part ?? "MAIN";
    validateViewDataRequest(this.viewType, request);
    this.fingerprint = codec.fingerprint({
      configuration: snapshot.configuration, source: snapshot.source,
      attributes: [...snapshot.attributes.values()], options: [...snapshot.options.values()],
      titles: snapshot.titles,
    });
    this.contextKey = codec.fingerprint({
      userId: user.id, workspaceId: snapshot.configuration.view.workspaceId,
      viewId: snapshot.configuration.view.id, source: snapshot.source,
      q: (request.q?.trim() ?? "").normalize("NFC").toLocaleLowerCase("ko"),
      timeZone: user.timeZone,
    });
    const groups = new Map(snapshot.configuration.viewGroupDefinitions.map(group => [group.id, group]));
    if (snapshot.configuration.viewGroupSettingDefinitions.some(setting =>
      groups.get(setting.viewGroupDefinitionId)?.attributeDefinitionId !== setting.attributeDefinitionId))
      throw new ViewDataConfigurationError();
    if (snapshot.configuration.viewGroupDefinitions.some(group => group.groupRole !== "GROUP"))
      throw new ViewDataNeedsConfiguration("GROUP_ROLE_UNSUPPORTED", "groups");
    for (const group of groups.values()) {
      const type = snapshot.attributes.get(group.attributeDefinitionId)?.type;
      const options = jsonObject(group.configJson);
      if ((group.configJson !== null && (typeof group.configJson !== "object" || Array.isArray(group.configJson))) ||
          Object.keys(options).some(key => key !== "dateUnit") ||
          (type !== "Date" && type !== "Timestamp" && options.dateUnit !== undefined))
        throw new ViewDataNeedsConfiguration("GROUP_CONFIG_UNSUPPORTED", "groups");
      if (type === "Location" || type === "Interaction")
        throw new ViewDataNeedsConfiguration("GROUP_TYPE_UNSUPPORTED", "groups");
      if ((type === "Date" || type === "Timestamp") && !["DAY", "MONTH", "YEAR"].includes(String(jsonObject(group.configJson).dateUnit)))
        throw new ViewDataNeedsConfiguration("DATE_GROUP_UNIT_REQUIRED", "groups");
    }
    for (const setting of snapshot.configuration.viewGroupSettingDefinitions)
      if ((setting.configJson !== null && (typeof setting.configJson !== "object" || Array.isArray(setting.configJson))) || Object.keys(jsonObject(setting.configJson)).length)
        throw new ViewDataNeedsConfiguration("GROUP_SETTING_CONFIG_UNSUPPORTED", "groupSettings");
    // 2. 원본 전체에서 조건을 평가하고 정렬한다.
    this.values = new ViewDataValues(snapshot);
    this.items = selectViewItems(this.values, request.q?.trim() ?? "");
    this.eligibleCount = this.items.length;
  }
  // 기능 : 맥락·설정·마지막 anchor를 검증하고 전역 정렬 결과를 이어 읽습니다.
  page<T>(items: T[], part: ViewDataPart = this.part, groupKey: string | null = null): { items: T[]; pageInfo: ViewPageInfo } {
    let offset = 0;
    // 1. 앞 페이지의 마지막 항목이 현재 집합에 남아 있는지 확인한다.
    if (this.request.cursor) {
      const cursor = this.codec.decode(this.request.cursor);
      if (cursor.context !== this.contextKey || cursor.part !== part || cursor.groupKey !== groupKey || !cursor.anchor)
        throw new ValidationDomainError("Cursor does not match this query");
      if (cursor.configuration !== this.fingerprint)
        throw new DomainError("ViewDataCursorStale", "View configuration changed; restart the query");
      const index = items.findIndex(item => this.codec.fingerprint(item) === cursor.anchor);
      if (index < 0) throw new DomainError("ViewDataCursorStale", "Page anchor changed; restart the query");
      offset = index + 1;
    }
    // 2. 선택한 페이지의 마지막 위치를 암호화한 다음 token으로 반환한다.
    const limit = this.request.limit ?? 25;
    const selected = items.slice(offset, offset + limit);
    const hasNextPage = offset + selected.length < items.length;
    return { items: selected, pageInfo: { hasNextPage, nextCursor: hasNextPage ? this.codec.encode({
      context: this.contextKey, configuration: this.fingerprint, part,
      anchor: this.codec.fingerprint(selected.at(-1)), groupKey,
    }) : null } };
  }
  // 기능 : 독립된 칸반 열의 이어 읽기 토큰을 발급합니다.
  groupToken(key: string): string {
    return this.codec.encode({ context: this.contextKey, configuration: this.fingerprint, part: "GROUP_ITEMS", anchor: null, groupKey: key });
  }
  // 기능 : 현재 사용자·보기·설정에 속한 그룹 토큰만 복원합니다.
  selectedGroup(): string {
    if (!this.request.groupToken) throw new ValidationDomainError("groupToken is required");
    const token = this.codec.decode(this.request.groupToken);
    if (token.context !== this.contextKey || token.part !== "GROUP_ITEMS" || !token.groupKey || token.anchor !== null)
      throw new ValidationDomainError("Invalid group token");
    if (token.configuration !== this.fingerprint)
      throw new DomainError("ViewDataCursorStale", "View configuration changed; restart the query");
    return token.groupKey;
  }
  // 기능 : 설정과 같은 snapshot의 원본·일치·표시 대상 건수를 반환합니다.
  base(): ViewDataBase {
    const view = this.snapshot.configuration.view;
    return { viewDefinitionId: view.id, viewName: view.name, source: this.snapshot.source,
      configurationFingerprint: this.fingerprint, issues: [], bindings: this.values.bindings,
      summary: { sourceItemCount: this.snapshot.items.length, matchedItemCount: this.items.length, eligibleItemCount: this.eligibleCount } };
  }
  // 기능 : 저장하지 않은 표현값은 null로 두고 지원하는 옵션만 반환합니다.
  presentation(shape: ViewPresentation, choices: Record<string, readonly (string | number | boolean)[]>): ViewPresentation {
    const saved = this.snapshot.configuration.view.configJson;
    if (saved !== null && (typeof saved !== "object" || Array.isArray(saved)))
      throw new ViewDataNeedsConfiguration("VIEW_CONFIG_UNSUPPORTED", "configJson");
    const result = { ...shape };
    for (const [key, value] of Object.entries(jsonObject(saved))) {
      if (!Object.hasOwn(shape, key) || (value !== null && !choices[key]?.includes(value as string | number | boolean)))
        throw new ViewDataNeedsConfiguration("VIEW_CONFIG_UNSUPPORTED", "configJson");
      result[key] = value as string | number | boolean | null;
    }
    return result;
  }
}
// 기능 : 타입·part별 입력 조합을 검증해 모호한 페이지 요청을 거부합니다.
export function validateViewDataRequest(type: ViewDefinitionType, request: ViewDataRequest): void {
  assertSupportedViewType(type);
  const part = request.part ?? "MAIN";
  if (!["MAIN", "GROUP_ITEMS"].includes(part) || (part === "GROUP_ITEMS" && type !== "KANBAN"))
    throw new ValidationDomainError("part is not supported by this View type");
  if (request.limit !== undefined && (!Number.isInteger(request.limit) || request.limit < 1 || request.limit > 100))
    throw new ValidationDomainError("limit must be between 1 and 100");
  if (request.q !== undefined && (typeof request.q !== "string" || request.q.length > 200))
    throw new ValidationDomainError("q is invalid");
  if (type === "KANBAN" && part === "MAIN" && request.cursor !== undefined)
    throw new ValidationDomainError("Use GROUP_ITEMS for column pagination");
  if ((part === "GROUP_ITEMS") !== (request.groupToken !== undefined))
    throw new ValidationDomainError("groupToken belongs to GROUP_ITEMS");
}
// 기능 : Timestamp 그룹의 날짜를 사용자 시간대 기준으로 생성합니다.
export function localDate(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  return ["year", "month", "day"].map(type => parts.find(part => part.type === type)!.value).join("-");
}
