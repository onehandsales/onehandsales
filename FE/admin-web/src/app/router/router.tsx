import { createBrowserRouter } from "react-router-dom";
import { AdminShell } from "@/components/layout/admin-shell";
import { PlaceholderPage } from "@/components/layout/placeholder-page";
import { AnalyticsPage } from "@/pages/analytics";
import { AuditLogsPage } from "@/pages/audit-logs";
import { DashboardPage } from "@/pages/dashboard";
import { LoginPage } from "@/pages/login";
import { OrganizationsPage } from "@/pages/organizations";
import { SubscriptionsPage } from "@/pages/subscriptions";
import { SupportPage } from "@/pages/support";
import { SystemPage } from "@/pages/system";
import { UsersPage } from "@/pages/users";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: <AdminShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "users/:userId", element: <PlaceholderPage title="사용자 상세" /> },
      { path: "organizations", element: <OrganizationsPage /> },
      { path: "subscriptions", element: <SubscriptionsPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "audit-logs", element: <AuditLogsPage /> },
      { path: "system", element: <SystemPage /> },
      { path: "support", element: <SupportPage /> },
    ],
  },
]);
