import type { PublicSiteLanguage } from "@/features/public-site/i18n/public-site-language";

export type PublicSiteLocaleSlug =
  | "ko"
  | "en-us"
  | "en-ca";

export type PublicSiteLocalizedPath =
  | "/"
  | "/login"
  | "/signup"
  | "/features"
  | "/pricing"
  | "/solutions"
  | "/download"
  | "/help"
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
  "/features",
  "/pricing",
  "/solutions",
  "/download",
  "/help",
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
  const normalizedPathname = normalizePathname(pathname);
  const [, firstSegment, ...restSegments] = normalizedPathname.split("/");

  if (!getPublicSiteLanguageFromLocaleSlug(firstSegment)) {
    return normalizedPathname;
  }

  if (restSegments.length === 0) {
    return "/";
  }

  return normalizePathname(`/${restSegments.join("/")}`);
}

// 기능 : 공개 사이트 경로에 선택된 locale prefix와 query/hash suffix를 붙입니다.
export function toPublicSitePath(
  language: PublicSiteLanguage,
  pathname: PublicSiteLocalizedPath | string = "/"
) {
  const suffix = getPathSuffix(pathname);
  const normalizedPathname = normalizePathname(pathname);

  if (!isPublicSiteLocalizedPath(normalizedPathname)) {
    return `${normalizedPathname}${suffix}`;
  }

  const slug = getPublicSiteLocaleSlug(language);

  const localizedPath = normalizedPathname === "/"
    ? `/${slug}`
    : `/${slug}${normalizedPathname}`;

  return `${localizedPath}${suffix}`;
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
  if (typeof window === "undefined") {
    return null;
  }

  const browserLanguage = window.navigator.language.toLowerCase();

  if (browserLanguage === "en-ca") {
    return "en-CA";
  }

  if (browserLanguage.startsWith("en")) {
    return "en-US";
  }

  return null;
}

// 기능 : 경로 비교를 위해 pathname의 query/hash와 trailing slash를 정리합니다.
function normalizePathname(pathname: string) {
  const pathOnly = pathname.split(/[?#]/)[0] ?? "/";
  const withLeadingSlash = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
  const withoutTrailingSlash =
    withLeadingSlash.length > 1
      ? withLeadingSlash.replace(/\/+$/, "")
      : withLeadingSlash;

  return withoutTrailingSlash || "/";
}

// 기능 : locale 경로 변환 후 유지할 query와 hash suffix를 추출합니다.
function getPathSuffix(pathname: string) {
  const suffixStart = pathname.search(/[?#]/);

  return suffixStart >= 0 ? pathname.slice(suffixStart) : "";
}
