import { ViewDataConfigurationError } from "./view-data.errors";

const SCALE = 10_000_000_000n;
// 기능 : DB의 Decimal(30,10) 값을 손실 없는 고정 소수 정수로 해석합니다.
export function decimalUnits(value: string): bigint {
  if (!/^-?\d+(?:\.\d{1,10})?$/.test(value) || value.length > 64)
    throw new ViewDataConfigurationError();
  const negative = value.startsWith("-");
  const [integer = "0", fraction = ""] = value.replace(/^-/, "").split(".");
  const amount = BigInt(integer) * SCALE + BigInt(fraction.padEnd(10, "0"));
  return negative ? -amount : amount;
}
// 기능 : 내부 정수를 불필요한 소수 0이 없는 Decimal 문자열로 반환합니다.
export function decimalString(units: bigint): string {
  const sign = units < 0n ? "-" : "";
  const value = units < 0n ? -units : units;
  const fraction = (value % SCALE)
    .toString()
    .padStart(10, "0")
    .replace(/0+$/, "");
  return `${sign}${value / SCALE}${fraction ? "." + fraction : ""}`;
}
// 기능 : 평균과 비율을 소수 10자리에서 반올림하여 계산합니다.
export function divideDecimal(numerator: bigint, denominator: bigint): bigint {
  if (denominator === 0n) throw new ViewDataConfigurationError();
  const negative = numerator < 0n !== denominator < 0n;
  const n = numerator < 0n ? -numerator : numerator,
    d = denominator < 0n ? -denominator : denominator;
  const quotient = n / d + ((n % d) * 2n >= d ? 1n : 0n);
  return negative ? -quotient : quotient;
}
// 기능 : 진행률의 원본 값과 배율에서 정확한 비율을 계산합니다.
export function decimalRatio(value: string, scale: string): string {
  return decimalString(
    divideDecimal(decimalUnits(value) * SCALE, decimalUnits(scale)),
  );
}
