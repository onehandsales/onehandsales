import { createBrowserRouter } from "react-router-dom";
import { PreviewFrame } from "../layouts/preview-frame";
import { PublicPage } from "@/pages/public";
import { LoginPage } from "@/pages/login";
import { WorkspacePage } from "@/pages/workspace";
import { SharedPage } from "@/pages/shared";
import { ComponentsPage } from "@/pages/components";
import { NotFoundPage } from "@/pages/not-found";
import { WorkspaceBoundary, SharedBoundary, RouteFailure } from "./route-boundaries";

export const router = createBrowserRouter([{
  element: <PreviewFrame />, errorElement: <RouteFailure />, children: [
    { path: "/", element: <PublicPage /> },
    { path: "/login", element: <LoginPage /> },
    { element: <WorkspaceBoundary />, children: [
      { path: "/app", element: <WorkspacePage /> },
      { path: "/app/items/:itemId", element: <WorkspacePage /> },
    ] },
    { element: <SharedBoundary />, children: [{ path: "/share/:shareId", element: <SharedPage /> }] },
    { path: "/components", element: <ComponentsPage /> },
    { path: "*", element: <NotFoundPage /> },
  ],
}]);
