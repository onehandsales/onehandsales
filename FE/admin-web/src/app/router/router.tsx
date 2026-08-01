import { createBrowserRouter, Navigate } from "react-router-dom";
import { AdminShell } from "@/components/layout/admin-shell";
import { PlaceholderPage } from "@/components/layout/placeholder-page";
import { ProtectedAdminRoute } from "@/features/auth";
import { AuditLogsPage } from "@/pages/audit-logs";
import { LoginPage } from "@/pages/login";
import { UserDetailPage } from "@/pages/users/detail";
import { UserDomainPage } from "@/pages/users/domain";
import { UsersPage } from "@/pages/users";

// 기능 : Admin Web의 보호 route와 화면 route를 구성합니다.
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
      { path: "users", element: <UsersPage /> },
      { path: "users/:userId", element: <UserDetailPage /> },
      { path: "users/:userId/domain", element: <UserDomainPage /> },
      { path: "organizations", element: <Navigate replace to="/" /> },
      { path: "subscriptions", element: <Navigate replace to="/" /> },
      { path: "analytics", element: <Navigate replace to="/" /> },
      { path: "audit-logs", element: <AuditLogsPage /> },
      { path: "system", element: <Navigate replace to="/" /> },
      { path: "support", element: <Navigate replace to="/" /> },
    ],
  },
]);
