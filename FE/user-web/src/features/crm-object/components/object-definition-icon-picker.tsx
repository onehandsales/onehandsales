import EmojiPicker, {
  EmojiStyle,
  Theme,
  type EmojiClickData,
} from "emoji-picker-react";
import { Search } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { type CSSProperties, useMemo, useState } from "react";
import { type AppLocale } from "@/features/app-i18n";
import { SidebarCrmObjectIcon } from "@/features/crm-object/components/sidebar-crm-object-icon";
import {
  createEmojiObjectIconValue,
  createLucideObjectIconValue,
  getLucideObjectIconName,
  type DynamicLucideIconName,
} from "@/features/crm-object/utils/object-definition-icon-value";
import { cn } from "@/utils/cn";

type ObjectDefinitionIconPickerProps = {
  readonly emojiSearchClearButtonLabel: string;
  readonly emojiSearchPlaceholder: string;
  readonly emojiTabLabel: string;
  readonly iconNoResultsLabel: string;
  readonly iconSearchPlaceholder: string;
  readonly iconTabLabel: string;
  readonly label: string;
  readonly locale: AppLocale;
  readonly onChange: (value: string) => void;
  readonly value: string;
};

type ObjectDefinitionIconPickerTab = "emoji" | "icon";

type RecommendedIconLabel = {
  readonly aliases: Record<AppLocale, string>;
  readonly labels: Record<AppLocale, string>;
  readonly name: DynamicLucideIconName;
};

type CompactEmojiPickerStyle = CSSProperties & Record<`--${string}`, string>;

export const DEFAULT_OBJECT_DEFINITION_ICON =
  createLucideObjectIconValue("box");

const ICON_SEARCH_RESULT_LIMIT = 42;
const RECOMMENDED_ICON_RESULT_LIMIT = 400;

const compactEmojiPickerStyle: CompactEmojiPickerStyle = {
  "--epr-category-label-height": "22px",
  "--epr-category-navigation-button-size": "22px",
  "--epr-emoji-fullsize":
    "calc(var(--epr-emoji-size) + var(--epr-emoji-padding) * 2)",
  "--epr-emoji-padding": "2px",
  "--epr-emoji-size": "18px",
  "--epr-header-padding": "8px var(--epr-horizontal-padding)",
  "--epr-horizontal-padding": "8px",
  "--epr-search-border-color": "#dededa",
  "--epr-search-border-color-active": "#dededa",
  "--epr-search-input-bg-color": "#ffffff",
  "--epr-search-input-bg-color-active": "#ffffff",
  "--epr-search-input-border-radius": "5px",
  "--epr-search-input-height": "28px",
  "--epr-search-input-padding": "0 26px 0 28px",
  "--epr-search-input-placeholder-color": "#aaa9a3",
  "--epr-search-input-text-color": "#111111",
  fontSize: 12,
  border: 0,
  borderRadius: 0,
  boxShadow: "none",
};

const recommendedIconLabels: readonly RecommendedIconLabel[] = [
  {
    aliases: { "ko-KR": "기본 항목 박스", en: "default item box" },
    labels: { "ko-KR": "기본", en: "Default" },
    name: "box",
  },
  {
    aliases: { "ko-KR": "회사 거래처 고객사 건물", en: "company account building" },
    labels: { "ko-KR": "회사", en: "Company" },
    name: "building-2",
  },
  {
    aliases: { "ko-KR": "고객 사람 사용자", en: "customers users people" },
    labels: { "ko-KR": "고객", en: "Customers" },
    name: "users-round",
  },
  {
    aliases: { "ko-KR": "업무 영업 일", en: "work business sales" },
    labels: { "ko-KR": "업무", en: "Work" },
    name: "briefcase-business",
  },
  {
    aliases: { "ko-KR": "관계 파트너 계약", en: "relationship partner deal" },
    labels: { "ko-KR": "관계", en: "Relationship" },
    name: "handshake",
  },
  {
    aliases: { "ko-KR": "폴더 문서 묶음", en: "folder documents" },
    labels: { "ko-KR": "폴더", en: "Folder" },
    name: "folder",
  },
  {
    aliases: { "ko-KR": "공간 집 위치", en: "home place space" },
    labels: { "ko-KR": "공간", en: "Place" },
    name: "house",
  },
  {
    aliases: { "ko-KR": "상품 제품 쇼핑", en: "product goods shopping" },
    labels: { "ko-KR": "상품", en: "Product" },
    name: "shopping-bag",
  },
  {
    aliases: { "ko-KR": "기관 조직 은행", en: "organization institution bank" },
    labels: { "ko-KR": "기관", en: "Organization" },
    name: "landmark",
  },
  {
    aliases: { "ko-KR": "연락처 담당자 명함", en: "contact person card" },
    labels: { "ko-KR": "연락처", en: "Contact" },
    name: "contact",
  },
  {
    aliases: { "ko-KR": "위치 주소 지도", en: "location address map" },
    labels: { "ko-KR": "위치", en: "Location" },
    name: "map-pin",
  },
  {
    aliases: { "ko-KR": "문서 기록 파일", en: "document file record" },
    labels: { "ko-KR": "문서", en: "Document" },
    name: "file-text",
  },
  {
    aliases: { "ko-KR": "목록 체크리스트 작업", en: "list checklist task" },
    labels: { "ko-KR": "목록", en: "List" },
    name: "clipboard-list",
  },
  {
    aliases: { "ko-KR": "배송 차량 이동", en: "truck delivery vehicle" },
    labels: { "ko-KR": "배송", en: "Delivery" },
    name: "truck",
  },
  {
    aliases: { "ko-KR": "매장 상점", en: "store shop" },
    labels: { "ko-KR": "매장", en: "Store" },
    name: "store",
  },
  {
    aliases: { "ko-KR": "통계 차트 분석", en: "chart analytics report" },
    labels: { "ko-KR": "차트", en: "Chart" },
    name: "chart-column",
  },
];

const prioritizedRecommendedIconNames = [
  "box",
  "boxes",
  "package",
  "archive",
  "database",
  "table",
  "layout-grid",
  "list",
  "building",
  "building-2",
  "factory",
  "warehouse",
  "store",
  "landmark",
  "school",
  "hospital",
  "hotel",
  "house",
  "briefcase-business",
  "handshake",
  "network",
  "workflow",
  "user",
  "users",
  "users-round",
  "contact",
  "id-card",
  "badge-check",
  "circle-user-round",
  "user-check",
  "user-plus",
  "user-search",
  "mail",
  "mails",
  "mail-check",
  "mail-plus",
  "mail-search",
  "message-circle",
  "message-square-text",
  "messages-square",
  "phone",
  "phone-call",
  "smartphone",
  "file",
  "file-text",
  "files",
  "folder",
  "folders",
  "folder-open",
  "clipboard",
  "clipboard-list",
  "clipboard-check",
  "notebook",
  "book-open",
  "sheet",
  "banknote",
  "wallet",
  "receipt",
  "receipt-text",
  "credit-card",
  "circle-dollar-sign",
  "hand-coins",
  "chart-bar",
  "chart-column",
  "chart-line",
  "chart-pie",
  "trending-up",
  "activity",
  "gauge",
  "goal",
  "shopping-bag",
  "shopping-cart",
  "tag",
  "tags",
  "barcode",
  "scan-barcode",
  "ticket",
  "truck",
  "package-check",
  "package-plus",
  "calendar",
  "calendar-days",
  "calendar-check",
  "clock",
  "alarm-clock",
  "history",
  "timer",
  "settings",
  "cog",
  "wrench",
  "sliders-horizontal",
  "filter",
  "search",
  "square-pen",
  "shield",
  "shield-check",
  "lock",
  "key-round",
  "map-pin",
  "map",
] satisfies readonly DynamicLucideIconName[];
const allIconNames = Object.keys(
  dynamicIconImports,
).sort() as DynamicLucideIconName[];
const prioritizedRecommendedIconNameSet = new Set<DynamicLucideIconName>(
  prioritizedRecommendedIconNames,
);
const recommendedIconNames = [
  ...prioritizedRecommendedIconNames,
  ...allIconNames.filter(
    (iconName) => !prioritizedRecommendedIconNameSet.has(iconName),
  ),
].slice(0, RECOMMENDED_ICON_RESULT_LIMIT);
const recommendedIconLabelByName = new Map(
  recommendedIconLabels.map((icon) => [icon.name, icon]),
);

// 기능 : 관리 항목 이모지와 lucide 아이콘을 작은 팝오버 picker로 선택합니다.
export function ObjectDefinitionIconPicker({
  emojiSearchClearButtonLabel,
  emojiSearchPlaceholder,
  emojiTabLabel,
  iconNoResultsLabel,
  iconSearchPlaceholder,
  iconTabLabel,
  label,
  locale,
  onChange,
  value,
}: ObjectDefinitionIconPickerProps) {
  // 1. picker 팝오버, 선택 탭, 아이콘 검색 상태를 준비한다.
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ObjectDefinitionIconPickerTab>(
    getLucideObjectIconName(value) ? "icon" : "emoji",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const visibleIconNames = useMemo(
    () => getVisibleIconNames(searchQuery, locale),
    [locale, searchQuery],
  );

  const onEmojiClick = (emojiData: EmojiClickData) => {
    onChange(createEmojiObjectIconValue(emojiData.emoji));
    setIsOpen(false);
  };

  const onIconClick = (iconName: DynamicLucideIconName) => {
    onChange(createLucideObjectIconValue(iconName));
    setIsOpen(false);
  };

  return (
    <div className="relative shrink-0">
      <button
        aria-expanded={isOpen}
        aria-label={label}
        className={cn(
          "group/object-icon-tooltip relative flex h-10 w-10 items-center justify-center rounded-[6px] bg-white p-0 text-[#4B5563] transition-colors hover:bg-[#E4E2DC] active:bg-[#D3D1CB]",
          isOpen ? "bg-[#E4E2DC]" : null,
        )}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        <SidebarCrmObjectIcon
          className="pointer-events-none flex h-4 w-4 items-center justify-center text-[15px] leading-none"
          name={value}
          strokeWidth={1.9}
        />
        <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#111827] px-2 py-1 text-[14px] font-medium leading-none text-white opacity-0 shadow-lg transition-opacity group-hover/object-icon-tooltip:opacity-100">
          {label}
        </span>
      </button>

      {isOpen ? (
        <>
          <button
            aria-label={label}
            className="fixed inset-0 z-20 cursor-default bg-transparent"
            type="button"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-12 z-30 w-[232px] overflow-hidden rounded-[8px] border border-[#dededa] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.14)]">
            <div className="grid grid-cols-2 gap-1 border-b border-[#E7E5E1] bg-white px-2 py-1.5">
              <ObjectDefinitionIconPickerTabButton
                isSelected={activeTab === "emoji"}
                label={emojiTabLabel}
                onSelect={() => setActiveTab("emoji")}
              />
              <ObjectDefinitionIconPickerTabButton
                isSelected={activeTab === "icon"}
                label={iconTabLabel}
                onSelect={() => setActiveTab("icon")}
              />
            </div>

            {activeTab === "emoji" ? (
              <EmojiPicker
                autoFocusSearch={false}
                className="object-definition-emoji-picker"
                emojiStyle={EmojiStyle.NATIVE}
                height={188}
                lazyLoadEmojis
                previewConfig={{ showPreview: false }}
                searchClearButtonLabel={emojiSearchClearButtonLabel}
                searchPlaceholder={emojiSearchPlaceholder}
                skinTonesDisabled
                style={compactEmojiPickerStyle}
                theme={Theme.LIGHT}
                width="100%"
                onEmojiClick={onEmojiClick}
              />
            ) : (
              <div className="p-2 text-[12px]">
                <label className="flex h-7 items-center gap-1.5 rounded-[5px] border border-[#dededa] bg-white px-2 text-[#64748B] transition-colors focus-within:border-[#dededa]">
                  <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={1.9} />
                  <input
                    autoComplete="off"
                    className="min-w-0 flex-1 bg-transparent text-[12px] font-normal text-[#111111] outline-none placeholder:text-[#aaa9a3]"
                    name="objectDefinitionLucideIconSearch"
                    placeholder={iconSearchPlaceholder}
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </label>

                {visibleIconNames.length > 0 ? (
                  <div className="mt-2 grid max-h-[144px] grid-cols-6 gap-1 overflow-y-auto pr-0.5">
                    {visibleIconNames.map((iconName) => (
                      <ObjectDefinitionIconOptionButton
                        iconName={iconName}
                        isSelected={getLucideObjectIconName(value) === iconName}
                        key={iconName}
                        onSelect={onIconClick}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 rounded-[5px] bg-[#F7F6F3] px-2 py-2 text-[12px] leading-4 text-[#6B7280]">
                    {iconNoResultsLabel}
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

// 기능 : 이모지와 lucide 선택 탭 버튼을 렌더링합니다.
function ObjectDefinitionIconPickerTabButton({
  isSelected,
  label,
  onSelect,
}: {
  readonly isSelected: boolean;
  readonly label: string;
  readonly onSelect: () => void;
}) {
  return (
    <button
      aria-pressed={isSelected}
      className={cn(
        "h-7 rounded-[5px] text-[12px] font-normal transition-colors hover:bg-[#E4E2DC] active:bg-[#D3D1CB]",
        isSelected
          ? "bg-[#E4E2DC] text-[#111111]"
          : "text-[#6B7280] hover:text-[#111111]",
      )}
      type="button"
      onClick={onSelect}
    >
      {label}
    </button>
  );
}

// 기능 : lucide 아이콘 선택 버튼 한 칸을 렌더링합니다.
function ObjectDefinitionIconOptionButton({
  iconName,
  isSelected,
  onSelect,
}: {
  readonly iconName: DynamicLucideIconName;
  readonly isSelected: boolean;
  readonly onSelect: (iconName: DynamicLucideIconName) => void;
}) {
  return (
    <button
      aria-pressed={isSelected}
      className={cn(
        "grid h-7 w-7 place-items-center rounded-[5px] text-[#4B5563] transition-colors hover:bg-[#E4E2DC] active:bg-[#D3D1CB]",
        isSelected
          ? "bg-[#E4E2DC] text-[#111111]"
          : "bg-white",
      )}
      title={getIconLabel(iconName, "en")}
      type="button"
      onClick={() => onSelect(iconName)}
    >
      <SidebarCrmObjectIcon
        className="h-4 w-4"
        name={createLucideObjectIconValue(iconName)}
        strokeWidth={1.8}
      />
    </button>
  );
}

// 기능 : 검색어에 따라 추천 또는 전체 lucide 아이콘 후보를 반환합니다.
function getVisibleIconNames(
  searchQuery: string,
  locale: AppLocale,
): readonly DynamicLucideIconName[] {
  const normalizedQuery = normalizeSearchText(searchQuery);

  if (normalizedQuery.length === 0) {
    return recommendedIconNames;
  }

  return allIconNames
    .filter((iconName) => isIconSearchMatch(iconName, normalizedQuery, locale))
    .slice(0, ICON_SEARCH_RESULT_LIMIT);
}

// 기능 : 아이콘 이름과 별칭이 검색어와 맞는지 확인합니다.
function isIconSearchMatch(
  iconName: DynamicLucideIconName,
  normalizedQuery: string,
  locale: AppLocale,
) {
  const iconLabel = getIconLabel(iconName, locale);
  const recommendedIcon = recommendedIconLabelByName.get(iconName);
  const searchableText = normalizeSearchText(
    `${iconName} ${iconLabel} ${recommendedIcon?.aliases[locale] ?? ""}`,
  );

  return searchableText.includes(normalizedQuery);
}

// 기능 : 아이콘 표시 이름을 현재 언어에 맞춰 반환합니다.
function getIconLabel(iconName: DynamicLucideIconName, locale: AppLocale) {
  const recommendedIcon = recommendedIconLabelByName.get(iconName);

  if (recommendedIcon) {
    return recommendedIcon.labels[locale];
  }

  return iconName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// 기능 : 아이콘 검색 비교에 사용할 문자열을 정규화합니다.
function normalizeSearchText(value: string) {
  return value.trim().toLowerCase();
}
