import type { PublicSiteLanguage } from "@/features/public-site/i18n/public-site-language";

export type PublicSiteLocaleSlug =
  | "ko"
  | "ja"
  | "zh-tw"
  | "en-us"
  | "en-gb"
  | "en-sg"
  | "en-au"
  | "en-ca";

export type PublicSiteLocalizedPath =
  | "/"
  | "/login"
  | "/signup"
  | "/pricing"
  | "/contact"
  | "/about"
  | "/security"
  | "/terms"
  | "/privacy";

export const defaultPublicSiteLanguage: PublicSiteLanguage = "ko";

export const publicSiteLanguageStorageKey = "onehand.sales.publicLanguage";

export const publicSiteLanguageValues = [
  "ko",
  "ja",
  "zh-TW",
  "en-US",
  "en-GB",
  "en-SG",
  "en-AU",
  "en-CA",
] as const satisfies readonly PublicSiteLanguage[];

export const publicSiteLocaleSlugs = [
  "ko",
  "ja",
  "zh-tw",
  "en-us",
  "en-gb",
  "en-sg",
  "en-au",
  "en-ca",
] as const satisfies readonly PublicSiteLocaleSlug[];

export const publicSiteLocalizedPaths = [
  "/",
  "/login",
  "/signup",
  "/pricing",
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
  ja: "ja",
  "zh-TW": "zh-tw",
  "en-US": "en-us",
  "en-GB": "en-gb",
  "en-SG": "en-sg",
  "en-AU": "en-au",
  "en-CA": "en-ca",
};

export const publicSiteLanguageBySlug: Record<
  PublicSiteLocaleSlug,
  PublicSiteLanguage
> = {
  ko: "ko",
  ja: "ja",
  "zh-tw": "zh-TW",
  "en-us": "en-US",
  "en-gb": "en-GB",
  "en-sg": "en-SG",
  "en-au": "en-AU",
  "en-ca": "en-CA",
};

export function getPublicSiteLocaleSlug(
  language: PublicSiteLanguage
): PublicSiteLocaleSlug {
  return publicSiteLanguageSlugByLanguage[language];
}

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

export function getPublicSiteLanguageFromPathname(
  pathname: string
): PublicSiteLanguage | null {
  const [, firstSegment] = pathname.split("/");

  return getPublicSiteLanguageFromLocaleSlug(firstSegment);
}

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

export function toPublicSitePath(
  language: PublicSiteLanguage,
  pathname: PublicSiteLocalizedPath | string = "/"
) {
  const normalizedPathname = normalizePathname(pathname);

  if (!isPublicSiteLocalizedPath(normalizedPathname)) {
    return normalizedPathname;
  }

  const slug = getPublicSiteLocaleSlug(language);

  return normalizedPathname === "/"
    ? `/${slug}`
    : `/${slug}${normalizedPathname}`;
}

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

export function isPublicSiteLanguage(
  value: unknown
): value is PublicSiteLanguage {
  return publicSiteLanguageValues.some((language) => language === value);
}

export function isPublicSiteLocaleSlug(
  value: string
): value is PublicSiteLocaleSlug {
  return publicSiteLocaleSlugs.some((slug) => slug === value);
}

export function isPublicSiteLocalizedPath(
  value: string
): value is PublicSiteLocalizedPath {
  return publicSiteLocalizedPaths.some((path) => path === value);
}

function getStoredPublicSiteLanguage(): PublicSiteLanguage | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedLanguage = window.localStorage.getItem(
    publicSiteLanguageStorageKey
  );

  if (storedLanguage === "zh") {
    return "zh-TW";
  }

  return isPublicSiteLanguage(storedLanguage) ? storedLanguage : null;
}

function getBrowserPublicSiteLanguage(): PublicSiteLanguage | null {
  if (typeof window === "undefined") {
    return null;
  }

  const browserLanguage = window.navigator.language.toLowerCase();

  if (browserLanguage.startsWith("ja")) {
    return "ja";
  }

  if (browserLanguage.startsWith("zh")) {
    return "zh-TW";
  }

  if (browserLanguage === "en-gb") {
    return "en-GB";
  }

  if (browserLanguage === "en-sg") {
    return "en-SG";
  }

  if (browserLanguage === "en-au") {
    return "en-AU";
  }

  if (browserLanguage === "en-ca") {
    return "en-CA";
  }

  if (browserLanguage.startsWith("en")) {
    return "en-US";
  }

  return null;
}

function normalizePathname(pathname: string) {
  const pathOnly = pathname.split(/[?#]/)[0] ?? "/";
  const withLeadingSlash = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
  const withoutTrailingSlash =
    withLeadingSlash.length > 1
      ? withLeadingSlash.replace(/\/+$/, "")
      : withLeadingSlash;

  return withoutTrailingSlash || "/";
}
