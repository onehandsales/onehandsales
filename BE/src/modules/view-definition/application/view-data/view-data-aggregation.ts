import type {
  ViewDataBinding,
  ViewMetric,
  ViewAggregate,
} from "./view-data.types";
import type { ViewSourceItem } from "./view-data-loader";
import {
  decimalString,
  decimalUnits,
  divideDecimal,
} from "./view-data-decimal";
import {
  ViewDataConfigurationError,
  ViewDataNeedsConfiguration,
} from "./view-data.errors";
import { jsonObject } from "./view-data-json";
import type { ViewDataQueryContext } from "./view-data-query-context";

export type ViewMetricReader = {
  metric: ViewMetric;
  aggregate: (items: ViewSourceItem[]) => ViewAggregate;
};
// 기능 : 명시 계산과 측정 binding을 검증하고 원본 기여 기반 accumulator를 만듭니다.
export function metricReader(
  context: ViewDataQueryContext,
  bindingOverride?: ViewDataBinding,
): ViewMetricReader {
  const config = jsonObject(context.snapshot.configuration.view.configJson);
  const aggregation = config.aggregation ?? "COUNT_ITEMS";
  if (
    !["COUNT_ITEMS", "COUNT_VALUES", "SUM", "AVG", "MIN", "MAX"].includes(
      String(aggregation),
    )
  )
    throw new ViewDataNeedsConfiguration(
      "AGGREGATION_UNSUPPORTED",
      "aggregation",
    );
  const candidates = bindingOverride
    ? [bindingOverride]
    : context.values.bindings.filter((binding) => binding.role === "MEASURE");
  if (candidates.length > 1)
    throw new ViewDataNeedsConfiguration("MEASURE_AMBIGUOUS", "MEASURE");
  const binding = candidates[0];
  if (aggregation !== "COUNT_ITEMS" && !binding)
    throw new ViewDataNeedsConfiguration("ROLE_REQUIRED", "MEASURE");
  if (
    binding &&
    !["COUNT_ITEMS", "COUNT_VALUES"].includes(String(aggregation)) &&
    !["Number", "Currency", "Rating"].includes(binding.attributeType)
  )
    throw new ViewDataNeedsConfiguration(
      "MEASURE_TYPE_UNSUPPORTED",
      "MEASURE",
      binding.id,
    );
  if (binding?.attributeType === "Currency" && !binding.currencyCode)
    throw new ViewDataNeedsConfiguration(
      "CURRENCY_REQUIRED",
      "MEASURE",
      binding.id,
    );
  const row =
    context.snapshot.configuration.viewAttributeSettingDefinitions.find(
      (row) => row.id === binding?.id,
    );
  const byItem = new Map<string, string[]>();
  for (const item of context.items) {
    const field =
      row && aggregation !== "COUNT_ITEMS"
        ? context.values.field(item, row)
        : null;
    if (field?.state === "INVALID" || field?.state === "UNAVAILABLE")
      throw new ViewDataConfigurationError();
    byItem.set(
      item.key,
      field?.values.map((value) =>
        aggregation === "COUNT_VALUES"
          ? "1"
          : typeof value.value === "string"
            ? value.value
            : "0",
      ) ?? [],
    );
  }
  const metric: ViewMetric = {
    aggregation: aggregation as ViewMetric["aggregation"],
    bindingId: aggregation === "COUNT_ITEMS" ? null : (binding?.id ?? null),
    currencyCode: ["COUNT_ITEMS", "COUNT_VALUES"].includes(String(aggregation))
      ? null
      : (binding?.currencyCode ?? null),
    missingValueItemCount:
      aggregation === "COUNT_ITEMS"
        ? 0
        : context.items.filter((item) => !byItem.get(item.key)?.length).length,
  };
  // 기능 : 셀 평균의 평균이 아닌 원본 값 전체에서 합계·평균을 계산합니다.
  const aggregate = (items: ViewSourceItem[]): ViewAggregate => {
    const unique = [...new Map(items.map((item) => [item.key, item])).values()];
    const numbers = unique
      .flatMap((item) => byItem.get(item.key) ?? [])
      .map(decimalUnits);
    const itemCount = unique.length,
      valueCount = numbers.length;
    if (aggregation === "COUNT_ITEMS")
      return { value: String(itemCount), itemCount, valueCount: 0 };
    if (aggregation === "COUNT_VALUES")
      return { value: String(valueCount), itemCount, valueCount };
    if (!numbers.length) return { value: null, itemCount, valueCount };
    let value = numbers[0]!;
    if (aggregation === "SUM" || aggregation === "AVG")
      value = numbers.reduce((sum, number) => sum + number, 0n);
    if (aggregation === "AVG") value = divideDecimal(value, BigInt(valueCount));
    if (aggregation === "MIN")
      value = numbers.reduce(
        (min, number) => (number < min ? number : min),
        value,
      );
    if (aggregation === "MAX")
      value = numbers.reduce(
        (max, number) => (number > max ? number : max),
        value,
      );
    return { value: decimalString(value), itemCount, valueCount };
  };
  return { metric, aggregate };
}
