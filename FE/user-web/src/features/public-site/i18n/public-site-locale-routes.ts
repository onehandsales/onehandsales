import type { PublicSiteLanguage } from "@/features/public-site/i18n/public-site-language";

export type PublicSiteLocaleSlug =
  | "ko"
  | "en-us"
  | "en-ca";

export type PublicSiteLocalizedPath =
  | "/"
  | "/login"
  | "/signup"
  | "/product"
  | "/features"
  | "/features/customers"
  | "/features/pipeline"
  | "/features/schedules-follow-up"
  | "/features/activity-records"
  | "/features/ai-sales-assistant"
  | "/features/reports"
  | "/pricing"
  | "/solutions"
  | "/solutions/personal"
  | "/solutions/real-estate"
  | "/solutions/insurance-auto"
  | "/solutions/b2b-field"
  | "/download"
  | "/help"
  | "/faq"
  | "/contact"
  | "/about"
  | "/security"
  | "/terms"
  | "/privacy";

export const defaultPublicSiteLanguage: PublicSiteLanguage = "ko";

export const publicSiteLanguageStorageKey = "onehand.sales.publicLanguage";

export const publicSiteLanguageValues = [
  "ko",
  "en-US",
  "en-CA",
] as const satisfies readonly PublicSiteLanguage[];

export const publicSiteLocaleSlugs = [
  "ko",
  "en-us",
  "en-ca",
] as const satisfies readonly PublicSiteLocaleSlug[];

// Future public-site locale candidates: ja, en-gb, en-sg, en-au.
// Keep them inactive until copy, legal, pricing, support, SEO, and QA are confirmed.

export const publicSiteLocalizedPaths = [
  "/",
  "/login",
  "/signup",
  "/product",
  "/features",
  "/features/customers",
  "/features/pipeline",
  "/features/schedules-follow-up",
  "/features/activity-records",
  "/features/ai-sales-assistant",
  "/features/reports",
  "/pricing",
  "/solutions",
  "/solutions/personal",
  "/solutions/real-estate",
  "/solutions/insurance-auto",
  "/solutions/b2b-field",
  "/download",
  "/help",
  "/faq",
  "/contact",
  "/about",
  "/security",
  "/terms",
  "/privacy",
] as const satisfies readonly PublicSiteLocalizedPath[];

export const publicSiteLanguageSlugByLanguage: Record<
  PublicSiteLanguage,
  PublicSiteLocaleSlug
> = {
  ko: "ko",
  "en-US": "en-us",
  "en-CA": "en-ca",
};

export const publicSiteLanguageBySlug: Record<
  PublicSiteLocaleSlug,
  PublicSiteLanguage
> = {
  ko: "ko",
  "en-us": "en-US",
  "en-ca": "en-CA",
};

type PublicSiteLanguageUserProfile = {
  readonly preferredLocale?: string | null;
  readonly countryCode?: string | null;
  readonly signupLocale?: string | null;
  readonly signupCountryCode?: string | null;
  readonly lastLoginLocale?: string | null;
  readonly lastLoginCountryCode?: string | null;
};

// 기능 : 공개 사이트 언어 값을 URL locale slug로 변환합니다.
export function getPublicSiteLocaleSlug(
  language: PublicSiteLanguage
): PublicSiteLocaleSlug {
  return publicSiteLanguageSlugByLanguage[language];
}

// 기능 : URL locale slug에서 공개 사이트 언어 값을 찾습니다.
export function getPublicSiteLanguageFromLocaleSlug(
  slug: string | undefined
): PublicSiteLanguage | null {
  if (!slug) {
    return null;
  }

  const normalizedSlug = slug.toLowerCase();

  return isPublicSiteLocaleSlug(normalizedSlug)
    ? publicSiteLanguageBySlug[normalizedSlug]
    : null;
}

// 기능 : 현재 pathname의 첫 번째 segment에서 공개 사이트 언어를 추출합니다.
export function getPublicSiteLanguageFromPathname(
  pathname: string
): PublicSiteLanguage | null {
  const [, firstSegment] = pathname.split("/");

  return getPublicSiteLanguageFromLocaleSlug(firstSegment);
}

// 기능 : 공개 사이트 pathname에서 locale prefix를 제거합니다.
export function stripPublicSiteLocaleFromPathname(pathname: string) {
  // 1. 이후 단계에서 사용할 normalizedPathname 값을 준비한다.
  const normalizedPathname = normalizePathname(pathname);
  // 2. 이후 단계에서 사용할 배열 구조분해 값을 준비한다.
  const [, firstSegment, ...restSegments] = normalizedPathname.split("/");

  // 3. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (!getPublicSiteLanguageFromLocaleSlug(firstSegment)) {
    return normalizedPathname;
  }

  // 4. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (restSegments.length === 0) {
    return "/";
  }

  // 5. 계산된 결과를 호출자에게 반환한다.
  return normalizePathname(`/${restSegments.join("/")}`);
}

// 기능 : 공개 사이트 경로에 선택된 locale prefix와 query/hash suffix를 붙입니다.
export function toPublicSitePath(
  language: PublicSiteLanguage,
  pathname: PublicSiteLocalizedPath | string = "/"
) {
  // 1. 이후 단계에서 사용할 suffix 값을 준비한다.
  const suffix = getPathSuffix(pathname);
  // 2. 이후 단계에서 사용할 normalizedPathname 값을 준비한다.
  const normalizedPathname = normalizePathname(pathname);

  // 3. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (!isPublicSiteLocalizedPath(normalizedPathname)) {
    return `${normalizedPathname}${suffix}`;
  }

  // 4. 이후 단계에서 사용할 slug 값을 준비한다.
  const slug = getPublicSiteLocaleSlug(language);

  // 5. 이후 단계에서 사용할 localizedPath 값을 준비한다.
  const localizedPath = normalizedPathname === "/"
    ? `/${slug}`
    : `/${slug}${normalizedPathname}`;

  // 6. 계산된 결과를 호출자에게 반환한다.
  return `${localizedPath}${suffix}`;
}

// 기능 : 온보딩 화면의 locale prefix 경로를 계산합니다.
export function toPublicSiteOnboardingPath(language: PublicSiteLanguage) {
  return `/${getPublicSiteLocaleSlug(language)}/onboarding`;
}

// 기능 : 현재 공개 사이트 pathname의 locale prefix를 다른 언어로 교체합니다.
export function replacePublicSiteLocaleInPathname(
  pathname: string,
  language: PublicSiteLanguage
) {
  const publicPathname = stripPublicSiteLocaleFromPathname(pathname);

  return toPublicSitePath(
    language,
    isPublicSiteLocalizedPath(publicPathname) ? publicPathname : "/"
  );
}

// 기능 : pathname, 저장값, 브라우저 언어 순서로 공개 사이트 언어를 결정합니다.
export function resolvePublicSiteLanguage(pathname?: string): PublicSiteLanguage {
  const pathnameLanguage =
    typeof pathname === "string"
      ? getPublicSiteLanguageFromPathname(pathname)
      : typeof window !== "undefined"
        ? getPublicSiteLanguageFromPathname(window.location.pathname)
        : null;

  return (
    pathnameLanguage ??
    getStoredPublicSiteLanguage() ??
    getBrowserPublicSiteLanguage() ??
    defaultPublicSiteLanguage
  );
}

// 기능 : 사용자 locale/country와 fallback으로 공개 사이트 언어를 결정합니다.
export function resolvePublicSiteLanguageFromUserProfile(
  user: PublicSiteLanguageUserProfile | null | undefined,
  fallbackLanguage: PublicSiteLanguage = resolvePublicSiteLanguage()
): PublicSiteLanguage {
  const profileLocale = getUserProfileLocale(user);
  const profileCountryCode = getUserProfileCountryCode(user);

  if (
    profileLocale === "ko" ||
    profileLocale === "en-US" ||
    profileLocale === "en-CA"
  ) {
    return profileLocale;
  }

  if (profileLocale === "en") {
    if (profileCountryCode === "CA") {
      return "en-CA";
    }

    if (profileCountryCode === "US") {
      return "en-US";
    }

    return fallbackLanguage === "en-CA" ? "en-CA" : "en-US";
  }

  if (profileCountryCode === "KR") {
    return "ko";
  }

  if (profileCountryCode === "CA") {
    return "en-CA";
  }

  if (profileCountryCode === "US") {
    return "en-US";
  }

  return fallbackLanguage;
}

// 기능 : 입력값이 지원하는 공개 사이트 언어인지 확인합니다.
export function isPublicSiteLanguage(
  value: unknown
): value is PublicSiteLanguage {
  return publicSiteLanguageValues.some((language) => language === value);
}

// 기능 : 입력 문자열이 지원하는 공개 사이트 locale slug인지 확인합니다.
export function isPublicSiteLocaleSlug(
  value: string
): value is PublicSiteLocaleSlug {
  return publicSiteLocaleSlugs.some((slug) => slug === value);
}

// 기능 : 입력 문자열이 공개 사이트에서 locale prefix를 붙일 수 있는 경로인지 확인합니다.
export function isPublicSiteLocalizedPath(
  value: string
): value is PublicSiteLocalizedPath {
  return publicSiteLocalizedPaths.some((path) => path === value);
}

// 기능 : 브라우저 저장소에서 마지막 공개 사이트 언어 선택값을 읽습니다.
function getStoredPublicSiteLanguage(): PublicSiteLanguage | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedLanguage = window.localStorage.getItem(
    publicSiteLanguageStorageKey
  );

  return isPublicSiteLanguage(storedLanguage) ? storedLanguage : null;
}

// 기능 : 브라우저 언어 설정에서 공개 사이트 기본 언어를 추론합니다.
function getBrowserPublicSiteLanguage(): PublicSiteLanguage | null {
  // 1. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (typeof window === "undefined") {
    return null;
  }

  // 2. 이후 단계에서 사용할 browserLanguage 값을 준비한다.
  const browserLanguage = window.navigator.language.toLowerCase();

  // 3. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (browserLanguage === "en-ca") {
    return "en-CA";
  }

  // 4. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (browserLanguage.startsWith("en")) {
    return "en-US";
  }

  // 5. 계산된 결과를 호출자에게 반환한다.
  return null;
}

// 기능 : 사용자 프로필의 locale 값을 공개 사이트 언어군으로 축소합니다.
function getUserProfileLocale(
  user: PublicSiteLanguageUserProfile | null | undefined
): PublicSiteLanguage | "en" | null {
  const localeCandidates = [
    user?.preferredLocale,
    user?.lastLoginLocale,
    user?.signupLocale,
  ];

  for (const locale of localeCandidates) {
    const normalizedLocale = locale?.trim().replace("_", "-").toLowerCase();

    if (normalizedLocale === "ko" || normalizedLocale === "ko-kr") {
      return "ko";
    }

    if (normalizedLocale === "en-us") {
      return "en-US";
    }

    if (normalizedLocale === "en-ca") {
      return "en-CA";
    }

    if (normalizedLocale === "en" || normalizedLocale?.startsWith("en-")) {
      return "en";
    }
  }

  return null;
}

// 기능 : 사용자 프로필의 국가 코드를 공개 사이트 지원 국가로 축소합니다.
function getUserProfileCountryCode(
  user: PublicSiteLanguageUserProfile | null | undefined
): "KR" | "US" | "CA" | null {
  const countryCodeCandidates = [
    user?.countryCode,
    user?.lastLoginCountryCode,
    user?.signupCountryCode,
  ];

  for (const countryCode of countryCodeCandidates) {
    const normalizedCountryCode = countryCode?.trim().toUpperCase();

    if (
      normalizedCountryCode === "KR" ||
      normalizedCountryCode === "US" ||
      normalizedCountryCode === "CA"
    ) {
      return normalizedCountryCode;
    }
  }

  return null;
}

// 기능 : 경로 비교를 위해 pathname의 query/hash와 trailing slash를 정리합니다.
function normalizePathname(pathname: string) {
  // 1. 이후 단계에서 사용할 pathOnly 값을 준비한다.
  const pathOnly = pathname.split(/[?#]/)[0] ?? "/";
  // 2. 이후 단계에서 사용할 withLeadingSlash 값을 준비한다.
  const withLeadingSlash = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
  // 3. 이후 단계에서 사용할 withoutTrailingSlash 값을 준비한다.
  const withoutTrailingSlash =
    withLeadingSlash.length > 1
      ? withLeadingSlash.replace(/\/+$/, "")
      : withLeadingSlash;

  // 4. 계산된 결과를 호출자에게 반환한다.
  return withoutTrailingSlash || "/";
}

// 기능 : locale 경로 변환 후 유지할 query와 hash suffix를 추출합니다.
function getPathSuffix(pathname: string) {
  const suffixStart = pathname.search(/[?#]/);

  return suffixStart >= 0 ? pathname.slice(suffixStart) : "";
}
