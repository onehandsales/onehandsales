import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import {
  LegacyAppRedirect,
  LegacyPublicSiteRedirect,
  PublicSiteRoute,
} from "@/app/router/route-elements";
import { ProtectedRoute } from "@/features/auth";
import {
  publicSiteLocalizedPaths,
  publicSiteLocaleSlugs,
  type PublicSiteLocalizedPath,
} from "@/features/public-site/i18n/public-site-locale-routes";
import { AboutPage } from "@/pages/about";
import { BusinessCardsPage } from "@/pages/business-cards";
import { CompanyDetailPage } from "@/pages/companies/detail";
import { CompaniesPage } from "@/pages/companies";
import { CompanyNewFullPage } from "@/pages/companies/new-full";
import { CompanyNewPage } from "@/pages/companies/new";
import { ContactDetailPage } from "@/pages/contacts/detail";
import { ContactsPage } from "@/pages/contacts";
import { ContactPage } from "@/pages/contact";
import { DealDetailPage } from "@/pages/deals/detail";
import { DealsPage } from "@/pages/deals";
import { DealNewPage } from "@/pages/deals/new";
import { HomePage } from "@/pages/home";
import { ImportDetailPage } from "@/pages/import/detail";
import { ImportPage } from "@/pages/import";
import { LoginPage } from "@/pages/login";
import { MeetingNoteDetailPage } from "@/pages/meeting-notes/detail";
import { MeetingNotesPage } from "@/pages/meeting-notes";
import { ProductDetailPage } from "@/pages/products/detail";
import { ProductsPage } from "@/pages/products";
import { ProductNewPage } from "@/pages/products/new";
import { PrivacyPage } from "@/pages/privacy";
import { PricingPage } from "@/pages/pricing";
import { ScheduleDetailPage } from "@/pages/schedules/detail";
import { SchedulesPage } from "@/pages/schedules";
import { SecurityPage } from "@/pages/security";
// import { ScheduleWeekPage } from "@/pages/schedules/week";
import { SettingsPage } from "@/pages/settings";
import { TrashPage } from "@/pages/trash";
import { MorePage } from "@/pages/more";
import { TermsPage } from "@/pages/terms";

const localizedPublicSiteRoutes = publicSiteLocaleSlugs.flatMap((localeSlug) =>
  publicSiteLocalizedPaths.map((publicPath) => ({
    path: publicPath === "/" ? `/${localeSlug}` : `/${localeSlug}${publicPath}`,
    element: (
      <PublicSiteRoute>{getPublicSiteElement(publicPath)}</PublicSiteRoute>
    ),
  }))
);

export const router = createBrowserRouter([
  { path: "/", element: <LegacyPublicSiteRedirect to="/" /> },
  { path: "/login", element: <LegacyPublicSiteRedirect to="/login" /> },
  { path: "/signup", element: <LegacyPublicSiteRedirect to="/signup" /> },
  { path: "/pricing", element: <LegacyPublicSiteRedirect to="/pricing" /> },
  { path: "/contact", element: <LegacyPublicSiteRedirect to="/contact" /> },
  { path: "/about", element: <LegacyPublicSiteRedirect to="/about" /> },
  { path: "/security", element: <LegacyPublicSiteRedirect to="/security" /> },
  { path: "/terms", element: <LegacyPublicSiteRedirect to="/terms" /> },
  { path: "/privacy", element: <LegacyPublicSiteRedirect to="/privacy" /> },
  { path: "/auth/callback", element: <LoginPage /> },
  ...localizedPublicSiteRoutes,
  { path: "/companies", element: <LegacyAppRedirect to="/app/companies" /> },
  {
    path: "/companies/new/full",
    element: <LegacyAppRedirect to="/app/companies/new/full" />,
  },
  {
    path: "/companies/new",
    element: <LegacyAppRedirect to="/app/companies/new" />,
  },
  {
    path: "/companies/:companyId",
    element: (
      <LegacyAppRedirect paramName="companyId" to="/app/companies" />
    ),
  },
  { path: "/contacts", element: <LegacyAppRedirect to="/app/contacts" /> },
  { path: "/contacts/scan", element: <Navigate replace to="/app/business-cards" /> },
  {
    path: "/contacts/:contactId",
    element: <LegacyAppRedirect paramName="contactId" to="/app/contacts" />,
  },
  { path: "/products", element: <LegacyAppRedirect to="/app/products" /> },
  {
    path: "/products/new",
    element: <LegacyAppRedirect to="/app/products/new" />,
  },
  {
    path: "/products/:productId",
    element: <LegacyAppRedirect paramName="productId" to="/app/products" />,
  },
  { path: "/deals", element: <LegacyAppRedirect to="/app/deals" /> },
  { path: "/deals/new", element: <LegacyAppRedirect to="/app/deals/new" /> },
  {
    path: "/deals/:dealId",
    element: <LegacyAppRedirect paramName="dealId" to="/app/deals" />,
  },
  { path: "/schedules", element: <LegacyAppRedirect to="/app/schedules" /> },
  { path: "/schedules/week", element: <Navigate replace to="/app/schedules" /> },
  {
    path: "/schedules/:scheduleId",
    element: <LegacyAppRedirect paramName="scheduleId" to="/app/schedules" />,
  },
  {
    path: "/meeting-notes",
    element: <LegacyAppRedirect to="/app/meeting-notes" />,
  },
  {
    path: "/meeting-notes/new",
    element: <Navigate replace to="/app/meeting-notes?create=1" />,
  },
  {
    path: "/meeting-notes/:meetingNoteId",
    element: (
      <LegacyAppRedirect paramName="meetingNoteId" to="/app/meeting-notes" />
    ),
  },
  {
    path: "/business-cards",
    element: <LegacyAppRedirect to="/app/business-cards" />,
  },
  { path: "/import", element: <LegacyAppRedirect to="/app/import" /> },
  {
    path: "/import/:importUserLogId",
    element: <LegacyAppRedirect paramName="importUserLogId" to="/app/import" />,
  },
  { path: "/trash", element: <LegacyAppRedirect to="/app/trash" /> },
  { path: "/settings", element: <LegacyAppRedirect to="/app/settings" /> },
  { path: "/more", element: <LegacyAppRedirect to="/app/more" /> },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: "companies", element: <CompaniesPage /> },
      { path: "companies/new/full", element: <CompanyNewFullPage /> },
      { path: "companies/new", element: <CompanyNewPage /> },
      { path: "companies/:companyId", element: <CompanyDetailPage /> },
      { path: "contacts", element: <ContactsPage /> },
      { path: "contacts/scan", element: <Navigate replace to="/app/business-cards" /> },
      { path: "contacts/:contactId", element: <ContactDetailPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "products/new", element: <ProductNewPage /> },
      { path: "products/:productId", element: <ProductDetailPage /> },
      { path: "deals", element: <DealsPage /> },
      { path: "deals/new", element: <DealNewPage /> },
      { path: "deals/:dealId", element: <DealDetailPage /> },
      { path: "schedules", element: <SchedulesPage /> },
      // 주간 보고서 Backend 구현 전까지 라우트를 노출하지 않는다.
      // { path: "schedules/week", element: <ScheduleWeekPage /> },
      { path: "schedules/week", element: <Navigate replace to="/app/schedules" /> },
      { path: "schedules/:scheduleId", element: <ScheduleDetailPage /> },
      { path: "meeting-notes", element: <MeetingNotesPage /> },
      {
        path: "meeting-notes/new",
        element: <Navigate replace to="/app/meeting-notes?create=1" />,
      },
      { path: "meeting-notes/:meetingNoteId", element: <MeetingNoteDetailPage /> },
      { path: "business-cards", element: <BusinessCardsPage /> },
      { path: "notifications", element: <Navigate replace to="/app" /> },
      { path: "import", element: <ImportPage /> },
      { path: "import/:importUserLogId", element: <ImportDetailPage /> },
      { path: "export", element: <Navigate replace to="/app" /> },
      { path: "trash", element: <TrashPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "more", element: <MorePage /> },
    ],
  },
]);

function getPublicSiteElement(path: PublicSiteLocalizedPath) {
  if (path === "/pricing") {
    return <PricingPage />;
  }

  if (path === "/contact") {
    return <ContactPage />;
  }

  if (path === "/about") {
    return <AboutPage />;
  }

  if (path === "/security") {
    return <SecurityPage />;
  }

  if (path === "/terms") {
    return <TermsPage />;
  }

  if (path === "/privacy") {
    return <PrivacyPage />;
  }

  return <LoginPage />;
}
