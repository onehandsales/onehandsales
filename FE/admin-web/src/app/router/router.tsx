import { createBrowserRouter, Navigate } from "react-router-dom";
import { AdminShell } from "@/components/layout/admin-shell";
import { PlaceholderPage } from "@/components/layout/placeholder-page";
import { ProtectedAdminRoute } from "@/features/auth";
import { LoginPage } from "@/pages/login";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <ProtectedAdminRoute>
        <AdminShell />
      </ProtectedAdminRoute>
    ),
    children: [
      { index: true, element: <PlaceholderPage title="Admin Web" /> },
      { path: "users", element: <Navigate replace to="/" /> },
      { path: "users/:userId", element: <Navigate replace to="/" /> },
      { path: "organizations", element: <Navigate replace to="/" /> },
      { path: "subscriptions", element: <Navigate replace to="/" /> },
      { path: "analytics", element: <Navigate replace to="/" /> },
      { path: "audit-logs", element: <Navigate replace to="/" /> },
      { path: "system", element: <Navigate replace to="/" /> },
      { path: "support", element: <Navigate replace to="/" /> },
    ],
  },
]);
