import type { PublicSiteLanguage } from "@/features/public-site/i18n/public-site-language";

export type PublicSiteLocaleSlug =
  | "ko"
  | "en-us"
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

  return isPublicSiteLanguage(storedLanguage) ? storedLanguage : null;
}

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

function normalizePathname(pathname: string) {
  const pathOnly = pathname.split(/[?#]/)[0] ?? "/";
  const withLeadingSlash = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
  const withoutTrailingSlash =
    withLeadingSlash.length > 1
      ? withLeadingSlash.replace(/\/+$/, "")
      : withLeadingSlash;

  return withoutTrailingSlash || "/";
}
