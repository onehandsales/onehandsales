import type { AppI18nResource } from "@/features/app-i18n/constants";

// 기능 : 한국어 앱 문구 resource를 namespace별로 정의합니다.
export const koKRResource = {
  common: {
    close: "닫기",
    retry: "다시 시도",
    save: "저장",
    saving: "저장 중",
    noRecord: "기록 없음",
  },
  settings: {
    profileTitle: "프로필 설정",
    profileDescription: "개인 표시 정보와 글로벌 기본값을 설정해요.",
    name: "이름",
    noName: "이름 없음",
    displayLanguage: "표시 언어",
    timeZone: "시간대",
    defaultCountry: "기본 국가",
    defaultCurrency: "기본 통화",
    profileSaved: "개인 정보를 저장했어요.",
    nameTooLong: "이름은 80자 이하로 입력해 주세요.",
  },
  navigation: {
    home: "홈",
    companies: "회사",
    contacts: "담당자",
    products: "제품",
    deals: "딜",
    schedules: "일정",
    meetingNotes: "회의록",
    businessCards: "명함 스캔",
    settings: "설정",
  },
  errors: {
    unknown: "요청을 처리하지 못했어요.",
    USER_LOCALE_UNSUPPORTED: "지원하는 언어를 선택해 주세요.",
    USER_TIMEZONE_INVALID: "올바른 시간대를 선택해 주세요.",
    USER_COUNTRY_UNSUPPORTED: "지원하는 국가를 선택해 주세요.",
    USER_DEFAULT_CURRENCY_UNSUPPORTED: "지원하는 통화를 선택해 주세요.",
    CURRENCY_UNSUPPORTED: "지원하는 통화를 선택해 주세요.",
    AMOUNT_INTEGER_REQUIRED: "금액은 0 이상의 정수로 입력해 주세요.",
  },
} satisfies AppI18nResource;
