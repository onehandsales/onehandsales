import { useAppI18n } from "@/features/app-i18n";
import type { ViewContentProps } from "./view-content-shared";
import { ViewEmpty } from "./view-content-shared";
import { decimalLabel } from "../../utils/view-data-display";

const colors = [
  "#529CCA",
  "#6A9D79",
  "#C89758",
  "#A47BAE",
  "#C87775",
  "#7487B7",
];
// 기능 : 정확한 표시값과 SVG 시각화를 분리하여 차트 종류별 결과를 표시합니다.
export function ChartView({ response }: ViewContentProps<"CHART">) {
  const { t } = useAppI18n();
  const { data } = response;
  if (!data.points.length) return <ViewEmpty />;
  const type = data.presentation.chartType;
  const allPoints = data.points.map((point, index) => ({
    ...point,
    number: Number(point.result.value),
    label: [
      data.categories.find((category) => category.key === point.categoryKey)
        ?.label,
      data.series.find((series) => series.key === point.seriesKey)?.label,
    ]
      .filter(Boolean)
      .join(" · "),
    color:
      colors[
        (point.seriesKey
          ? data.series.findIndex((series) => series.key === point.seriesKey)
          : index) % colors.length
      ]!,
  }));
  const points = allPoints.filter(point => point.result.value !== null);
  const finite = points.every((point) => Number.isFinite(point.number));
  const max = Math.max(1, ...points.map((point) => point.number)),
    min = Math.min(0, ...points.map((point) => point.number));
  const y = (value: number) => 250 - ((value - min) / (max - min)) * 210;
  const width = Math.max(520, points.length * 90),
    step = (width - 80) / points.length;
  const sum = points.reduce((total, point) => total + point.number, 0);
  let angle = -Math.PI / 2;
  return (
    <section className="p-4" data-testid="view-chart">
      <div className="mb-4 text-sm text-[#787774]">
        {t("viewContent.total")}{" "}
        <strong className="ml-2 text-lg font-semibold text-[#37352F]">
          {decimalLabel(data.total.value, data.metric.currencyCode)}
        </strong>
      </div>
      <div className="overflow-x-auto">
        {finite &&
        (type === "PIE" || type === "DONUT") &&
        sum > 0 &&
        points.every((point) => point.number >= 0) ? (
          <svg
            viewBox="0 0 360 280"
            className="mx-auto h-64 max-w-full"
            role="img"
            aria-label={response.viewName}
          >
            {points.map((point) => {
              const next = angle + (point.number / sum) * Math.PI * 2,
                startX = 180 + 110 * Math.cos(angle),
                startY = 140 + 110 * Math.sin(angle),
                endX = 180 + 110 * Math.cos(next),
                endY = 140 + 110 * Math.sin(next);
              const path = `M180,140 L${startX},${startY} A110,110 0 ${next - angle > Math.PI ? 1 : 0},1 ${endX},${endY} Z`;
              angle = next;
              return point.number === sum ? (
                <circle
                  key={point.categoryKey}
                  cx="180"
                  cy="140"
                  r="110"
                  fill={point.color}
                >
                  <title>
                    {point.label}: {decimalLabel(point.result.value)}
                  </title>
                </circle>
              ) : (
                <path
                  key={point.categoryKey}
                  d={path}
                  fill={point.color}
                  stroke="white"
                >
                  <title>
                    {point.label}: {decimalLabel(point.result.value)}
                  </title>
                </path>
              );
            })}
            {type === "DONUT" && (
              <circle cx="180" cy="140" r="65" fill="white" />
            )}
          </svg>
        ) : finite && type !== "PIE" && type !== "DONUT" ? (
          <svg
            width={width}
            height="300"
            role="img"
            aria-label={response.viewName}
          >
            <line
              x1="40"
              x2={width - 20}
              y1={y(0)}
              y2={y(0)}
              stroke="#D9D9D5"
            />
            {type === "LINE" &&
              (data.series.length
                ? data.series.map((series) => series.key)
                : [null]
              ).map((key, index) => (
                <polyline
                  key={key ?? "single"}
                  fill="none"
                  stroke={colors[index % colors.length]}
                  strokeWidth="2"
                  points={points
                    .flatMap((point, index) =>
                      point.seriesKey === key
                        ? [`${40 + step * (index + 0.5)},${y(point.number)}`]
                        : [],
                    )
                    .join(" ")}
                />
              ))}
            {points.map((point, index) => (
              <g key={`${point.categoryKey}:${point.seriesKey}`}>
                <title>
                  {point.label}:{" "}
                  {decimalLabel(point.result.value, data.metric.currencyCode)}
                </title>
                {type === "LINE" ? (
                  <circle
                    cx={40 + step * (index + 0.5)}
                    cy={y(point.number)}
                    r="4"
                    fill={point.color}
                  />
                ) : (
                  <rect
                    x={40 + step * index + step * 0.15}
                    y={Math.min(y(0), y(point.number))}
                    width={step * 0.7}
                    height={Math.max(1, Math.abs(y(0) - y(point.number)))}
                    fill={point.color}
                    rx="3"
                  />
                )}
                <text
                  x={40 + step * (index + 0.5)}
                  y="278"
                  textAnchor="middle"
                  fontSize="10"
                  fill="#787774"
                >
                  {point.label.length > 12
                    ? point.label.slice(0, 11) + "…"
                    : point.label}
                </text>
              </g>
            ))}
          </svg>
        ) : (
          <p className="py-4 text-sm text-[#787774]">
            {t("viewContent.chartRange")}
          </p>
        )}
      </div>
      {data.presentation.showLegend && (
        <div className="my-3 flex flex-wrap gap-3 text-xs">
          {allPoints.map((point) => (
            <span
              key={`${point.categoryKey}:${point.seriesKey}`}
              className="inline-flex items-center gap-1.5"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: point.color }}
              />
              {point.label}
            </span>
          ))}
        </div>
      )}
      <details className="mt-4 text-xs">
        <summary className="cursor-pointer text-[#787774]">
          {t("viewContent.values")}
        </summary>
        <table className="mt-2 w-full text-left">
          <tbody>
            {allPoints.map((point) => (
              <tr key={`${point.categoryKey}:${point.seriesKey}`}>
                <th className="border-b py-2 font-normal">{point.label}</th>
                <td className="border-b text-right">
                  {decimalLabel(point.result.value, data.metric.currencyCode)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}
