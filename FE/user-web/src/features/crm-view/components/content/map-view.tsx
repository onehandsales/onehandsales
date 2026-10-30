import { useEffect, useMemo, useRef, useState } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAppI18n } from "@/features/app-i18n";
import { useViewData } from "../../hooks/use-view-data";
import type { ViewDataItem } from "../../types/view-data";
import type { ViewContentProps } from "./view-content-shared";
import { ViewPagination, viewButton } from "./view-content-shared";

// 기능 : 지도와 정렬 목록을 itemKey로 연결하고 영역·핀 페이지를 독립 조회합니다.
export function MapView({
  response,
  scope,
  request,
  onRequest,
}: ViewContentProps<"MAP">) {
  const { t } = useAppI18n();
  const container = useRef<HTMLDivElement>(null),
    mapRef = useRef<L.Map | null>(null),
    layerRef = useRef<L.LayerGroup | null>(null),
    fitted = useRef(false);
  const [selected, setSelected] = useState<string | undefined>(),
    [listCursor, setListCursor] = useState<string | undefined>(),
    [markerCursor, setMarkerCursor] = useState<string | undefined>(),
    [unlocated, setUnlocated] = useState(false),
    [tileError, setTileError] = useState(false);
  const listQuery = useViewData(
    scope,
    {
      ...request,
      part: unlocated ? "UNLOCATED_ITEMS" : "MAP_ITEMS",
      cursor: listCursor,
    },
    !!listCursor || unlocated,
  );
  const markerQuery = useViewData(
    scope,
    { ...request, part: "MAP_MARKERS", cursor: markerCursor },
    !!markerCursor,
  );
  const focusQuery = useViewData(
    scope,
    {
      ...request,
      part: "MAP_MARKERS",
      cursor: undefined,
      focusItemKey: selected,
    },
    !!selected,
  );
  const focusedItemQuery = useViewData(
    scope,
    {
      ...request,
      part: "MAP_ITEMS",
      cursor: undefined,
      focusItemKey: selected,
    },
    !!selected,
  );
  const list =
    listQuery.data?.state === "READY" &&
    (listQuery.data.part === "MAP_ITEMS" ||
      listQuery.data.part === "UNLOCATED_ITEMS")
      ? listQuery.data.data
      : unlocated || listCursor ? { items: [], pageInfo: { hasNextPage: false, nextCursor: null } } : response.data.list;
  const markers =
    markerQuery.data?.state === "READY" &&
    markerQuery.data.part === "MAP_MARKERS"
      ? markerQuery.data.data
      : response.data.markers;
  const focused = useMemo(
    () =>
      focusQuery.data?.state === "READY" &&
      focusQuery.data.part === "MAP_MARKERS"
        ? focusQuery.data.data.items
        : [],
    [focusQuery.data],
  );
  const selectedItem =
    focusedItemQuery.data?.state === "READY" &&
    focusedItemQuery.data.part === "MAP_ITEMS"
      ? focusedItemQuery.data.data.items[0]
      : null;
  useEffect(() => {
    if (!container.current) return;
    const map = L.map(container.current, {
      center: [20, 0],
      zoom: 2,
      scrollWheelZoom: false,
    });
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
    const tileUrl =
      import.meta.env.VITE_MAP_TILE_URL ||
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
    L.tileLayer(tileUrl, {
      attribution:
        import.meta.env.VITE_MAP_ATTRIBUTION ||
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      referrerPolicy: "strict-origin-when-cross-origin",
    })
      .on("tileerror", () => setTileError(true))
      .addTo(map);
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      fitted.current = false;
    };
  }, []);
  useEffect(() => {
    const map = mapRef.current,
      layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    const all = [
      ...new Map(
        [...markers.items, ...focused].map((marker) => [marker.key, marker]),
      ).values(),
    ];
    for (const marker of all) {
      const point = L.circleMarker([marker.latitude, marker.longitude], {
        radius: marker.item.itemKey === selected ? 9 : 6,
        color: "#FFFFFF",
        weight: 2,
        fillColor: marker.item.itemKey === selected ? "#D89C45" : "#4880EE",
        fillOpacity: 1,
      }).addTo(layer);
      const label = document.createElement("span");
      label.textContent = marker.item.title;
      point
        .bindTooltip(label, {
          permanent: response.data.presentation.showLabels === true,
        })
        .on("click", () => setSelected(marker.item.itemKey));
    }
    if (
      !fitted.current &&
      response.data.bounds &&
      response.data.presentation.fitToData
    ) {
      const bounds = response.data.bounds;
      map.fitBounds(
        [
          [bounds.south, bounds.west],
          [
            bounds.north,
            bounds.east < bounds.west ? bounds.east + 360 : bounds.east,
          ],
        ],
        { padding: [30, 30], maxZoom: 14 },
      );
      fitted.current = true;
    }
    if (focused[0]) map.panTo([focused[0].latitude, focused[0].longitude]);
  }, [
    markers.items,
    focused,
    selected,
    response.data.bounds,
    response.data.presentation.fitToData,
    response.data.presentation.showLabels,
  ]);
  // 기능 : 지도 이동만으로 전체 조회를 반복하지 않고 선택한 영역만 다시 조회합니다.
  function searchBounds() {
    const bounds = mapRef.current?.getBounds();
    if (!bounds) return;
    const wrap = (longitude: number) =>
      ((((longitude + 180) % 360) + 360) % 360) - 180;
    setListCursor(undefined);
    setMarkerCursor(undefined);
    setSelected(undefined);
    onRequest({
      ...request,
      bounds: [
        wrap(bounds.getWest()),
        Math.max(-90, bounds.getSouth()),
        wrap(bounds.getEast()),
        Math.min(90, bounds.getNorth()),
      ],
      cursor: undefined,
    });
  }
  const row = (item: ViewDataItem) => (
    <button
      key={item.itemKey}
      className={`block w-full border-b px-3 py-3 text-left text-sm ${selected === item.itemKey ? "bg-blue-50" : "hover:bg-[#F7F7F5]"}`}
      onClick={() => setSelected(item.itemKey)}
    >
      {item.title}
    </button>
  );
  return (
    <section data-testid="view-map">
      <div className="flex flex-wrap items-center gap-2 border-b p-3">
        <button className={viewButton} onClick={searchBounds}>
          {t("viewContent.searchMapArea")}
        </button>
        <button
          className={viewButton}
          onClick={() => {
            setUnlocated(!unlocated);
            setListCursor(undefined);
          }}
        >
          {t(unlocated ? "viewContent.located" : "viewContent.unlocated")} ·{" "}
          {unlocated
            ? (response.summary?.eligibleItemCount ?? 0)
            : response.data.unlocatedCount}
        </button>
      </div>
      <div className="grid min-h-[420px] grid-cols-1 md:grid-cols-[1fr_280px]">
        <div className="relative">
          <div
            ref={container}
            className="z-0 h-[420px] w-full"
            aria-label={t("viewContent.map")}
          />
          {tileError && (
            <p
              role="status"
              className="absolute bottom-7 left-2 z-[500] rounded bg-white px-2 py-1 text-xs"
            >
              {t("viewContent.mapTileError")}
            </p>
          )}
          <ViewPagination
            pageInfo={markers.pageInfo}
            onNext={setMarkerCursor}
            {...(markerCursor
              ? { onFirst: () => setMarkerCursor(undefined) }
              : {})}
            busy={markerQuery.isFetching}
          />
        </div>
        <div className="border-l">
          <div
            className="max-h-[420px] overflow-y-auto"
            aria-busy={listQuery.isFetching}
          >
            {selectedItem &&
              !list.items.some(
                (item) => item.itemKey === selectedItem.itemKey,
              ) &&
              row(selectedItem)}
            {list.items.map(row)}
          </div>
          {(listQuery.isError ||
            markerQuery.isError ||
            focusQuery.isError ||
            focusedItemQuery.isError) && (
            <p role="alert" className="p-3 text-xs text-red-700">
              {t("viewContent.loadError")}
            </p>
          )}
          <ViewPagination
            pageInfo={list.pageInfo}
            onNext={setListCursor}
            {...(listCursor ? { onFirst: () => setListCursor(undefined) } : {})}
            busy={listQuery.isFetching}
          />
        </div>
      </div>
    </section>
  );
}
