import { BrandingSettingsPage } from "@/pages/branding-settings";
import { CompanySettingsPage } from "@/pages/company-settings";
import { PublicProfilePage } from "@/pages/public-profile";
import { createBrowserRouter } from "react-router-dom";
import { ResetRequestPage, NewPasswordPage } from "@/pages/password-reset";
import { AuthContinuePage, AuthFuturePage, AppFuturePage } from "@/pages/auth-boundary";
import { TwoFactorPage } from "@/pages/two-factor";
import { AuthLayout } from "../layouts/auth-layout";
import { SignupPage } from "@/pages/signup";
import { EmailVerificationPage } from "@/pages/auth-handoff";
import { OnboardingPage } from "@/pages/onboarding";
import { WorkspaceEntryPage } from "@/pages/setup-dashboard";
import { PreviewFrame } from "../layouts/preview-frame";
import { AppShell } from "../layouts/app-shell";
import { RouteFrame } from "../layouts/route-frame";
import { HelpLayout } from "../layouts/help-layout";
import { HelpPage } from "@/pages/help";
import { CompanyPage } from "@/pages/company";
import { companyRoutes } from "@/features/public-company";
import { SupportPage } from "@/pages/support";
import { PublicLayout } from "../layouts/public-layout";
import { QueryScope } from "../providers/query-scope";
import { PublicPendingPage } from "@/pages/public-pending";
import { publicDestinations } from "@/features/public-web";
import { PublicPage } from "@/pages/public";
import { IntroductionPage } from "@/pages/introduction";
import { PricingPage } from "@/pages/pricing";
import { ReviewsPage } from "@/pages/reviews";
import { BlogPage } from "@/pages/blog";
import { TemplatesPage } from "@/pages/templates";
import { InvoiceGeneratorPage } from "@/pages/invoice-generator";
import { templateRoutes } from "@/features/public-template";
import { commercialPendingDestinations, commercialRoutes } from "@/features/public-commercial";
import { introductionRoutes, introductionPendingDestinations } from "@/features/public-introduction";
import { LoginPage } from "@/pages/login";
import { WorkspacePage } from "@/pages/workspace";
import { SharedPage } from "@/pages/shared";
import { ComponentsPage } from "@/pages/components";
import { NotFoundPage, AppNotFoundPage } from "@/pages/not-found";
import { WorkspaceBoundary, WorkspaceContentScope, SharedBoundary, RouteFailure } from "./route-boundaries";

export const router = createBrowserRouter([{
  element: <RouteFrame />, errorElement: <RouteFailure />, children: [
    { path: "/u/:slug", element: <PublicProfilePage /> },
    { path: "/onboarding", element: <OnboardingPage /> },
    { element: <AuthLayout />, children: [{ path: "/auth/continue", element: <AuthContinuePage /> }, { path: "/password/reset", element: <ResetRequestPage /> }, { path: "/password/new", element: <NewPasswordPage /> }, { path: "/verify-email/request", element: <AuthFuturePage /> }, { path: "/signup", element: <SignupPage /> }, { path: "/login", element: <LoginPage /> }, { path: "/two-factor", element: <TwoFactorPage /> }, { path: "/verify-email", element: <EmailVerificationPage /> }] },
    { element: <QueryScope><HelpLayout /></QueryScope>, children: [
      { path: "/help", element: <HelpPage /> }, { path: "/help/collections/:collectionId", element: <HelpPage /> }, { path: "/help/articles/:articleId", element: <HelpPage /> },
    ] },
    { element: <QueryScope><PublicLayout /></QueryScope>, children: [
      { path: "/", element: <PublicPage /> },
      { path: "/pricing", element: <PricingPage /> },
      { path: "/support", element: <SupportPage /> },
      ...companyRoutes.map(route => ({ path: route.path, element: <CompanyPage /> })),
      { path: "/reviews", element: <ReviewsPage /> },
      { path: "/invoice-generator", element: <InvoiceGeneratorPage /> },
      { path: "/blog", element: <BlogPage /> },
      { path: "/blog/:slug", element: <BlogPage /> },
      ...[...new Set([...templateRoutes.map(route => route.path), ...publicDestinations.filter(item => item.goal === "G06").map(item => item.path.split(/[?#]/)[0] ?? "/templates")])].map(path => ({ path, element: <TemplatesPage /> })),
      { path: "/templates/:type", element: <TemplatesPage /> },
      ...introductionRoutes.map(route => ({ path: route.path, element: <IntroductionPage key={route.id} id={route.id} /> })),
      ...[...new Set([...publicDestinations, ...introductionPendingDestinations, ...commercialPendingDestinations].map(item => item.path.split(/[?#]/)[0] ?? "/"))].filter(path => path !== "/signup" && path !== "/login" && path !== "/help" && path !== "/support" && path !== "/invoice-generator" && !path.startsWith("/blog") && !publicDestinations.some(item => item.goal === "G06" && item.path.split(/[?#]/)[0] === path) && ![...introductionRoutes, ...commercialRoutes, ...templateRoutes, ...companyRoutes].some(route => route.path === path)).map(path => ({ path, element: <PublicPendingPage /> })),
    ] },
    { element: <WorkspaceBoundary />, children: [
      { element: <AppShell />, children: [
      { element: <WorkspaceContentScope />, children: [
      { path: "/app/pending/:destination", element: <AppFuturePage /> }, { path: "/app/settings/company", element: <CompanySettingsPage /> }, { path: "/app/settings/branding", element: <BrandingSettingsPage /> },
      { path: "/app", element: <WorkspaceEntryPage /> },
      { path: "/app/preview", element: <WorkspacePage /> },
      { path: "/app/items/:itemId", element: <WorkspacePage /> },
      ] },
      ] },
      { path: "/app/*", element: <AppNotFoundPage /> },
    ] },
    { element: <PreviewFrame />, children: [
    { element: <SharedBoundary />, children: [{ path: "/share/:shareId", element: <SharedPage /> }] },
    { path: "/components", element: <ComponentsPage /> },
    ] },
    { path: "*", element: <NotFoundPage /> },
  ],
}]);
