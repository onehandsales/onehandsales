// 기능 : 숫자를 IEEE754로 변환하지 않고 서버가 반환한 십진수 문자열을 표시합니다.
export function decimalLabel(
  value: string | null,
  currencyCode: string | null = null,
): string {
  if (value === null) return "—";
  const [integer = "0", fraction] = value.split(".");
  const grouped = /^-?\d+$/.test(integer)
    ? BigInt(integer).toLocaleString()
    : integer;
  return `${grouped}${fraction ? `.${fraction}` : ""}${currencyCode ? ` ${currencyCode}` : ""}`;
}
import type { ViewDataBinding } from "../types/view-data";

// 기능 : 표시 배율과 소수 자리수를 정수 연산으로 적용하여 금액 손실을 막습니다.
export function formattedViewNumber(value: string, binding: ViewDataBinding): string {
  if (!/^-?\d+(?:\.\d{1,10})?$/.test(value)) return "—";
  const format = binding.format && typeof binding.format === "object" && !Array.isArray(binding.format) ? binding.format : {};
  const negative = value.startsWith("-"), [integer = "0", fraction = ""] = value.replace(/^-/, "").split(".");
  let amount = BigInt(integer + fraction.padEnd(10, "0"));
  const percentage = format.style === "PERCENT";
  if (percentage && format.valueScale === 1) amount *= 100n;
  const digits = typeof format.fractionDigits === "number" && Number.isInteger(format.fractionDigits) && format.fractionDigits >= 0 && format.fractionDigits <= 10 ? format.fractionDigits : 10;
  const divisor = 10n ** BigInt(10 - digits);
  const rounded = amount / divisor + (amount % divisor * 2n >= divisor ? 1n : 0n);
  const factor = 10n ** BigInt(digits), rest = digits ? (rounded % factor).toString().padStart(digits, "0") : "";
  const displayedFraction = format.fractionDigits === undefined ? rest.replace(/0+$/, "") : rest;
  const label = decimalLabel(`${negative && rounded !== 0n ? "-" : ""}${rounded / factor}${displayedFraction ? "." + displayedFraction : ""}`, percentage ? null : binding.currencyCode);
  return label + (percentage ? "%" : "");
}

