import type { AppI18nResource } from "@/features/app-i18n/constants";

// 기능 : 영어 앱 문구 resource를 namespace별로 정의합니다.
export const enResource = {
  common: {
    close: "Close",
    retry: "Try again",
    save: "Save",
    saving: "Saving",
    noRecord: "No record",
  },
  settings: {
    profileTitle: "Profile Settings",
    profileDescription: "Set your display profile and global defaults.",
    name: "Name",
    noName: "No name",
    displayLanguage: "Display Language",
    timeZone: "Time Zone",
    defaultCountry: "Default Country",
    defaultCurrency: "Default Currency",
    profileSaved: "Profile saved.",
    nameTooLong: "Enter a name with 80 characters or fewer.",
  },
  navigation: {
    home: "Home",
    companies: "Companies",
    contacts: "Contacts",
    products: "Products",
    deals: "Deals",
    schedules: "Schedule",
    meetingNotes: "Meeting Notes",
    businessCards: "Business Cards",
    settings: "Settings",
  },
  errors: {
    unknown: "We could not handle the request.",
    USER_LOCALE_UNSUPPORTED: "Choose a supported language.",
    USER_TIMEZONE_INVALID: "Choose a valid time zone.",
    USER_COUNTRY_UNSUPPORTED: "Choose a supported country.",
    USER_DEFAULT_CURRENCY_UNSUPPORTED: "Choose a supported currency.",
    CURRENCY_UNSUPPORTED: "Choose a supported currency.",
    AMOUNT_INTEGER_REQUIRED: "Enter an integer amount of 0 or more.",
    CONTACT_PHONE_COUNTRY_UNSUPPORTED: "Choose a supported phone country.",
    CONTACT_PHONE_INVALID: "Check the phone number format.",
  },
} satisfies AppI18nResource;
