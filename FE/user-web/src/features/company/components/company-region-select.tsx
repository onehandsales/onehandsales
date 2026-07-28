import type { ChangeEvent } from "react";
import type { AppLocale } from "@/features/app-i18n";
import type { CompanyRegion } from "@/features/company/types/company";
import {
  COMPANY_REGION_COUNTRY_OPTIONS,
  createCompanyRegionSelectOptions,
  formatCompanyRegionCountryLabel,
  getCompanyRegionSelectValue,
  isCompanyRegionCountryCode,
  type CompanyRegionCountryCode,
  type CompanyRegionSelectOption,
} from "@/features/company/utils/company-region-options";

type CompanyRegionSelectProps = {
  readonly countryCode: CompanyRegionCountryCode;
  readonly disabled?: boolean;
  readonly idPrefix: string;
  readonly isCreating?: boolean;
  readonly locale: AppLocale;
  readonly regions: readonly CompanyRegion[];
  readonly selectedRegionId: string;
  readonly onCountryChange: (countryCode: CompanyRegionCountryCode) => void;
  readonly onRegionSelect: (
    option: CompanyRegionSelectOption | null
  ) => Promise<void> | void;
};

// 기능 : 회사 지역 선택에서 국가와 표준/legacy 지역 option을 함께 렌더링합니다.
export function CompanyRegionSelect({
  countryCode,
  disabled = false,
  idPrefix,
  isCreating = false,
  locale,
  regions,
  selectedRegionId,
  onCountryChange,
  onRegionSelect,
}: CompanyRegionSelectProps) {
  const options = createCompanyRegionSelectOptions(regions, countryCode, locale);
  const selectedValue = getCompanyRegionSelectValue(regions, selectedRegionId);
  const standardOptions = options.filter((option) => !option.isLegacy);
  const legacyOptions = options.filter((option) => option.isLegacy);
  const isDisabled = disabled || isCreating;

  const handleCountryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextCountryCode = event.target.value;

    if (isCompanyRegionCountryCode(nextCountryCode)) {
      onCountryChange(nextCountryCode);
    }
  };

  const handleRegionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const option =
      options.find((item) => item.value === event.target.value) ?? null;

    void onRegionSelect(option);
  };

  return (
    <div className="grid min-w-0 gap-2 sm:grid-cols-[128px_minmax(0,1fr)]">
      <select
        aria-label="국가"
        className="h-10 min-w-0 rounded-md border border-[#E5E7EB] bg-white px-2.5 text-[13px] font-medium text-[#111827] outline-none transition focus:border-[#4880EE] focus:ring-2 focus:ring-[#DBEAFE] disabled:cursor-not-allowed disabled:bg-[#F9FAFB]"
        disabled={isDisabled}
        id={`${idPrefix}-country`}
        value={countryCode}
        onChange={handleCountryChange}
      >
        {COMPANY_REGION_COUNTRY_OPTIONS.map((option) => (
          <option key={option.countryCode} value={option.countryCode}>
            {formatCompanyRegionCountryLabel(option.countryCode, locale)}
          </option>
        ))}
      </select>
      <select
        aria-label="지역"
        className="h-10 min-w-0 rounded-md border border-[#E5E7EB] bg-white px-2.5 text-[13px] font-medium text-[#111827] outline-none transition focus:border-[#4880EE] focus:ring-2 focus:ring-[#DBEAFE] disabled:cursor-not-allowed disabled:bg-[#F9FAFB]"
        disabled={isDisabled}
        id={`${idPrefix}-region`}
        value={selectedValue}
        onChange={handleRegionChange}
      >
        <option value="">{isCreating ? "지역 생성 중..." : "지역 선택"}</option>
        <optgroup label="표준 지역">
          {standardOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </optgroup>
        {legacyOptions.length > 0 ? (
          <optgroup label="사용자 지정 지역">
            {legacyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </optgroup>
        ) : null}
      </select>
    </div>
  );
}
