import { Phone } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";
import {
  APP_SUPPORTED_PHONE_COUNTRY_CODES,
  type AppPhoneCountryCode,
} from "@/features/app-i18n";

const CONTACT_PHONE_COUNTRY_OPTIONS: Array<{
  readonly code: AppPhoneCountryCode;
  readonly label: string;
}> = APP_SUPPORTED_PHONE_COUNTRY_CODES.map((code) => ({
  code,
  label: code === "KR" ? "KR +82" : "US +1",
}));

type ContactPhoneInputControlProps = {
  readonly ariaDescribedBy?: string;
  readonly countryCode: AppPhoneCountryCode;
  readonly countryRegister: UseFormRegisterReturn;
  readonly id: string;
  readonly invalid?: boolean;
  readonly nationalNumberRegister: UseFormRegisterReturn;
};

// 기능 : 담당자 전화번호의 국가 코드와 national number 입력 컨트롤을 렌더링합니다.
export function ContactPhoneInputControl({
  ariaDescribedBy,
  countryCode,
  countryRegister,
  id,
  invalid = false,
  nationalNumberRegister,
}: ContactPhoneInputControlProps) {
  const placeholder =
    countryCode === "US" ? "415-555-1234" : "010-1234-5678";

  return (
    <div className="grid min-w-0 grid-cols-[96px_minmax(0,1fr)] gap-2">
      <select
        aria-label="전화번호 국가"
        className="h-10 rounded-md border border-[#E6EAF0] bg-white px-2 text-[13px] font-semibold text-[#475569] outline-none transition-colors focus:border-[#4880EE] focus:ring-1 focus:ring-[#4880EE]"
        id={`${id}-country`}
        {...countryRegister}
      >
        {CONTACT_PHONE_COUNTRY_OPTIONS.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="relative min-w-0">
        <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          aria-describedby={ariaDescribedBy}
          aria-invalid={invalid}
          aria-label="전화번호"
          className="h-10 w-full rounded-md border border-[#E6EAF0] pl-9 pr-3 text-[13px] outline-none transition-colors focus:border-[#4880EE] focus:ring-1 focus:ring-[#4880EE]"
          id={id}
          inputMode="tel"
          placeholder={placeholder}
          {...nationalNumberRegister}
        />
      </div>
    </div>
  );
}
