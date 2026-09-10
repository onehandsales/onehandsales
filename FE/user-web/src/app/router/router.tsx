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
import { CompanyDetailPage } from "@/pages/companies/detail";
import { CompaniesPage } from "@/pages/companies";
import { CompanyNewFullPage } from "@/pages/companies/new-full";
import { CompanyNewPage } from "@/pages/companies/new";
import { ContactPage } from "@/pages/contact";
import { DownloadPage } from "@/pages/download";
import { FaqPage } from "@/pages/faq";
import { ActivityRecordsFeaturePage } from "@/pages/features/activity-records";
import { AiSalesAssistantFeaturePage } from "@/pages/features/ai-sales-assistant";
import { CustomerManagementFeaturePage } from "@/pages/features/customers";
import { FeaturesPage } from "@/pages/features";
import { PipelineFeaturePage } from "@/pages/features/pipeline";
import { ReportsFeaturePage } from "@/pages/features/reports";
import { SchedulesFollowUpFeaturePage } from "@/pages/features/schedules-follow-up";
import { HelpPage } from "@/pages/help";
import { HomePage } from "@/pages/home";
import { LoginPage } from "@/pages/login";
import { ProductPage } from "@/pages/product";
import { PrivacyPage } from "@/pages/privacy";
import { PricingPage } from "@/pages/pricing";
import { SecurityPage } from "@/pages/security";
import { B2bFieldSolutionPage } from "@/pages/solutions/b2b-field";
import { InsuranceAutoSolutionPage } from "@/pages/solutions/insurance-auto";
import { SolutionsPage } from "@/pages/solutions";
import { PersonalSolutionPage } from "@/pages/solutions/personal";
import { RealEstateSolutionPage } from "@/pages/solutions/real-estate";
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
  { path: "/product", element: <LegacyPublicSiteRedirect to="/product" /> },
  { path: "/features", element: <LegacyPublicSiteRedirect to="/features" /> },
  {
    path: "/features/customers",
    element: <LegacyPublicSiteRedirect to="/features/customers" />,
  },
  {
    path: "/features/pipeline",
    element: <LegacyPublicSiteRedirect to="/features/pipeline" />,
  },
  {
    path: "/features/schedules-follow-up",
    element: <LegacyPublicSiteRedirect to="/features/schedules-follow-up" />,
  },
  {
    path: "/features/activity-records",
    element: <LegacyPublicSiteRedirect to="/features/activity-records" />,
  },
  {
    path: "/features/ai-sales-assistant",
    element: <LegacyPublicSiteRedirect to="/features/ai-sales-assistant" />,
  },
  {
    path: "/features/reports",
    element: <LegacyPublicSiteRedirect to="/features/reports" />,
  },
  { path: "/pricing", element: <LegacyPublicSiteRedirect to="/pricing" /> },
  { path: "/solutions", element: <LegacyPublicSiteRedirect to="/solutions" /> },
  {
    path: "/solutions/personal",
    element: <LegacyPublicSiteRedirect to="/solutions/personal" />,
  },
  {
    path: "/solutions/real-estate",
    element: <LegacyPublicSiteRedirect to="/solutions/real-estate" />,
  },
  {
    path: "/solutions/insurance-auto",
    element: <LegacyPublicSiteRedirect to="/solutions/insurance-auto" />,
  },
  {
    path: "/solutions/b2b-field",
    element: <LegacyPublicSiteRedirect to="/solutions/b2b-field" />,
  },
  { path: "/download", element: <LegacyPublicSiteRedirect to="/download" /> },
  { path: "/help", element: <LegacyPublicSiteRedirect to="/help" /> },
  { path: "/faq", element: <LegacyPublicSiteRedirect to="/faq" /> },
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
  { path: "/contacts", element: <LegacyAppRedirect to="/app" /> },
  { path: "/contacts/scan", element: <LegacyAppRedirect to="/app" /> },
  { path: "/contacts/new/full", element: <LegacyAppRedirect to="/app" /> },
  { path: "/contacts/new", element: <LegacyAppRedirect to="/app" /> },
  { path: "/contacts/:contactId", element: <LegacyAppRedirect to="/app" /> },
  { path: "/products", element: <LegacyAppRedirect to="/app" /> },
  { path: "/products/new/full", element: <LegacyAppRedirect to="/app" /> },
  { path: "/products/new", element: <LegacyAppRedirect to="/app" /> },
  { path: "/products/:productId", element: <LegacyAppRedirect to="/app" /> },
  { path: "/deals", element: <LegacyAppRedirect to="/app" /> },
  { path: "/deals/new/full", element: <LegacyAppRedirect to="/app" /> },
  { path: "/deals/new", element: <LegacyAppRedirect to="/app" /> },
  { path: "/deals/:dealId", element: <LegacyAppRedirect to="/app" /> },
  { path: "/trash", element: <LegacyAppRedirect to="/app/trash" /> },
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
      { path: "contacts/*", element: <Navigate replace to="/app" /> },
      { path: "products/*", element: <Navigate replace to="/app" /> },
      { path: "deals/*", element: <Navigate replace to="/app" /> },
      { path: "export", element: <Navigate replace to="/app" /> },
      { path: "trash", element: <TrashPage /> },
      { path: "more", element: <MorePage /> },
    ],
  },
]);

// 기능 : 공개 사이트 locale route가 렌더링할 page element를 선택합니다.
function getPublicSiteElement(path: PublicSiteLocalizedPath) {
  if (path === "/pricing") {
    return <PricingPage />;
  }

  if (path === "/features") {
    return <FeaturesPage />;
  }

  if (path === "/features/customers") {
    return <CustomerManagementFeaturePage />;
  }

  if (path === "/features/pipeline") {
    return <PipelineFeaturePage />;
  }

  if (path === "/features/schedules-follow-up") {
    return <SchedulesFollowUpFeaturePage />;
  }

  if (path === "/features/activity-records") {
    return <ActivityRecordsFeaturePage />;
  }

  if (path === "/features/ai-sales-assistant") {
    return <AiSalesAssistantFeaturePage />;
  }

  if (path === "/features/reports") {
    return <ReportsFeaturePage />;
  }

  if (path === "/product") {
    return <ProductPage />;
  }

  if (path === "/solutions") {
    return <SolutionsPage />;
  }

  if (path === "/solutions/personal") {
    return <PersonalSolutionPage />;
  }

  if (path === "/solutions/real-estate") {
    return <RealEstateSolutionPage />;
  }

  if (path === "/solutions/insurance-auto") {
    return <InsuranceAutoSolutionPage />;
  }

  if (path === "/solutions/b2b-field") {
    return <B2bFieldSolutionPage />;
  }

  if (path === "/download") {
    return <DownloadPage />;
  }

  if (path === "/help") {
    return <HelpPage />;
  }

  if (path === "/faq") {
    return <FaqPage />;
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
