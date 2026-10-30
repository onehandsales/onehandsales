import type { ViewDataQueryContext } from "../view-data-query-context";
import type {
  ViewBounds,
  ViewMainDataByType,
  ViewMarker,
  ViewMarkerPage,
  ViewItemPage,
} from "../view-data.types";
import { jsonObject } from "../view-data-json";
import { assertViewDataLimit } from "../view-data.errors";
// 기능 : 유효 좌표·미위치 목록·핀과 목록의 독립 페이지를 구성합니다.
export function readMapData(
  context: ViewDataQueryContext,
): ViewMainDataByType["MAP"] | ViewMarkerPage | ViewItemPage {
  const presentation = context.presentation({
    fitToData: true,
    showLabels: true,
  });
  const binding = context.binding("LOCATION", ["Location"], true, true)!;
  const row =
    context.snapshot.configuration.viewAttributeSettingDefinitions.find(
      (row) => row.id === binding.id,
    )!;
  const markers: ViewMarker[] = [],
    unlocated = [];
  for (const source of context.items) {
    const item = context.values.item(source);
    const locations = context.values
      .field(source, row)
      .values.flatMap((value) => {
        const data = jsonObject(value.value),
          latitude = data.latitude,
          longitude = data.longitude;
        return typeof latitude === "number" &&
          typeof longitude === "number" &&
          Math.abs(latitude) <= 90 &&
          Math.abs(longitude) <= 180
          ? [
              {
                key: `${item.itemKey}:${value.valueDefinitionId}`,
                item,
                latitude,
                longitude,
              },
            ]
          : [];
      });
    markers.push(...locations);
    assertViewDataLimit(markers.length, 20000);
    if (!locations.length) unlocated.push(item);
  }
  if (context.part === "UNLOCATED_ITEMS") {
    context.eligibleCount = unlocated.length;
    return context.page(unlocated);
  }
  const selected = markers.filter((marker) =>
    context.request.focusItemKey
      ? marker.item.itemKey === context.request.focusItemKey
      : !context.request.bounds || inBounds(marker, context.request.bounds),
  );
  const ids = new Set(selected.map((marker) => marker.item.itemKey));
  const items = context.items
    .filter((item) => ids.has(item.key))
    .map((item) => context.values.item(item));
  context.eligibleCount = items.length;
  if (context.part === "MAP_MARKERS") return context.page(selected);
  if (context.part === "MAP_ITEMS") return context.page(items);
  return {
    presentation,
    bounds: mapBounds(markers),
    markers: context.page(selected, "MAP_MARKERS"),
    list: context.page(items, "MAP_ITEMS"),
    unlocatedCount: unlocated.length,
  };
}
// 기능 : 날짜변경선을 가로지르는 지도 영역도 좌표 비교로 판별합니다.
function inBounds(
  marker: ViewMarker,
  [west, south, east, north]: [number, number, number, number],
): boolean {
  return (
    marker.latitude >= south &&
    marker.latitude <= north &&
    (west <= east
      ? marker.longitude >= west && marker.longitude <= east
      : marker.longitude >= west || marker.longitude <= east)
  );
}
// 기능 : 경도의 가장 큰 빈 간격을 제외하여 최소 횡단 범위를 계산합니다.
function mapBounds(markers: ViewMarker[]): ViewBounds | null {
  if (!markers.length) return null;
  const longitudes = [
    ...new Set(markers.map((marker) => marker.longitude)),
  ].sort((a, b) => a - b);
  let gap = -1,
    index = 0;
  for (let i = 0; i < longitudes.length; i++) {
    const next =
      i + 1 < longitudes.length ? longitudes[i + 1]! : longitudes[0]! + 360;
    if (next - longitudes[i]! > gap) {
      gap = next - longitudes[i]!;
      index = i;
    }
  }
  return {
    west: longitudes[(index + 1) % longitudes.length]!,
    east: longitudes[index]!,
    south: Math.min(...markers.map((marker) => marker.latitude)),
    north: Math.max(...markers.map((marker) => marker.latitude)),
  };
}
