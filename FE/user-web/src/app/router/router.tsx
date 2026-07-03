import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/features/auth";
import { BusinessCardsPage } from "@/pages/business-cards";
import { CompanyDetailPage } from "@/pages/companies/detail";
import { CompaniesPage } from "@/pages/companies";
import { CompanyNewPage } from "@/pages/companies/new";
import { ContactDetailPage } from "@/pages/contacts/detail";
import { ContactsPage } from "@/pages/contacts";
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
import { ScheduleDetailPage } from "@/pages/schedules/detail";
import { SchedulesPage } from "@/pages/schedules";
// import { ScheduleWeekPage } from "@/pages/schedules/week";
import { SettingsPage } from "@/pages/settings";
import { TrashPage } from "@/pages/trash";
import { MorePage } from "@/pages/more";

export const router = createBrowserRouter([
  { path: "/", element: <LoginPage /> },
  { path: "/auth/callback", element: <LoginPage /> },
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
