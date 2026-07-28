import {
  APP_SUPPORTED_CURRENCY_CODES,
  type AppCurrencyCode,
} from "@/features/app-i18n/constants";

type CurrencyCodeSelectProps = {
  readonly ariaLabel?: string;
  readonly className?: string;
  readonly disabled?: boolean;
  readonly id?: string;
  readonly value: AppCurrencyCode;
  readonly onChange: (currencyCode: AppCurrencyCode) => void;
};

// 기능 : Product/Deal 금액 입력에서 지원 통화를 선택하는 공통 select를 렌더링합니다.
export function CurrencyCodeSelect({
  ariaLabel = "통화",
  className,
  disabled,
  id,
  value,
  onChange,
}: CurrencyCodeSelectProps) {
  return (
    <select
      aria-label={ariaLabel}
      className={className}
      disabled={disabled}
      id={id}
      onChange={(event) => onChange(event.currentTarget.value as AppCurrencyCode)}
      value={value}
    >
      {APP_SUPPORTED_CURRENCY_CODES.map((currencyCode) => (
        <option key={currencyCode} value={currencyCode}>
          {currencyCode}
        </option>
      ))}
    </select>
  );
}
