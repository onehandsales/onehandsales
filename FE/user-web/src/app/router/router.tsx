import { createBrowserRouter } from "react-router-dom";
import { PreviewFrame } from "../layouts/preview-frame";
import { RouteFrame } from "../layouts/route-frame";
import { PublicLayout } from "../layouts/public-layout";
import { PublicPendingPage } from "@/pages/public-pending";
import { publicDestinations } from "@/features/public-web";
import { PublicPage } from "@/pages/public";
import { IntroductionPage } from "@/pages/introduction";
import { PricingPage } from "@/pages/pricing";
import { ReviewsPage } from "@/pages/reviews";
import { commercialPendingDestinations, commercialRoutes } from "@/features/public-commercial";
import { introductionRoutes, introductionPendingDestinations } from "@/features/public-introduction";
import { LoginPage } from "@/pages/login";
import { WorkspacePage } from "@/pages/workspace";
import { SharedPage } from "@/pages/shared";
import { ComponentsPage } from "@/pages/components";
import { NotFoundPage } from "@/pages/not-found";
import { WorkspaceBoundary, SharedBoundary, RouteFailure } from "./route-boundaries";

export const router = createBrowserRouter([{
  element: <RouteFrame />, errorElement: <RouteFailure />, children: [
    { element: <PublicLayout />, children: [
      { path: "/", element: <PublicPage /> },
      { path: "/signup", element: <PublicPendingPage /> },
      { path: "/pricing", element: <PricingPage /> },
      { path: "/reviews", element: <ReviewsPage /> },
      ...introductionRoutes.map(route => ({ path: route.path, element: <IntroductionPage key={route.id} id={route.id} /> })),
      ...[...new Set([...publicDestinations, ...introductionPendingDestinations, ...commercialPendingDestinations].map(item => item.path.split(/[?#]/)[0]))].filter(path => ![...introductionRoutes, ...commercialRoutes].some(route => route.path === path)).map(path => ({ path, element: <PublicPendingPage /> })),
    ] },
    { element: <PreviewFrame />, children: [
    { path: "/login", element: <LoginPage /> },
    { element: <WorkspaceBoundary />, children: [
      { path: "/app", element: <WorkspacePage /> },
      { path: "/app/items/:itemId", element: <WorkspacePage /> },
    ] },
    { element: <SharedBoundary />, children: [{ path: "/share/:shareId", element: <SharedPage /> }] },
    { path: "/components", element: <ComponentsPage /> },
    { path: "*", element: <NotFoundPage /> },
    ] },
  ],
}]);
