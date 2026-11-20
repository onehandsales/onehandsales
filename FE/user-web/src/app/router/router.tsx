import { createBrowserRouter } from "react-router-dom";
import { PreviewFrame } from "../layouts/preview-frame";
import { RouteFrame } from "../layouts/route-frame";
import { PublicLayout } from "../layouts/public-layout";
import { PublicPendingPage } from "@/pages/public-pending";
import { publicDestinations } from "@/features/public-web";
import { PublicPage } from "@/pages/public";
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
      ...[...new Set(publicDestinations.map(item => item.path.split(/[?#]/)[0]))].map(path => ({ path, element: <PublicPendingPage /> })),
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
