// 기능 : 금액 입력값에서 숫자만 남기고 불필요한 선행 0을 제거합니다.
export function normalizeCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.replace(/^0+(?=\d)/, "");
}

// 기능 : 금액 입력값을 세 자리 콤마가 포함된 표시 문자열로 변환합니다.
export function formatCurrencyInput(value: string) {
  const normalized = normalizeCurrencyInput(value);
  return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 기능 : 자유 입력된 날짜값을 YYYY-MM-DD 형태로 정규화합니다.
export function normalizeDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 4) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }

  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}
