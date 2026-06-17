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
import { ExportPage } from "@/pages/export";
import { HomePage } from "@/pages/home";
import { ImportPage } from "@/pages/import";
import { LoginPage } from "@/pages/login";
import { MeetingNoteDetailPage } from "@/pages/meeting-notes/detail";
import { MeetingNotesPage } from "@/pages/meeting-notes";
import { NotificationsPage } from "@/pages/notifications";
import { ProductDetailPage } from "@/pages/products/detail";
import { ProductsPage } from "@/pages/products";
import { ProductNewPage } from "@/pages/products/new";
import { SchedulesPage } from "@/pages/schedules";
import { ScheduleWeekPage } from "@/pages/schedules/week";
import { SettingsPage } from "@/pages/settings";
import { TrashPage } from "@/pages/trash";
import { MorePage } from "@/pages/more";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/auth/callback", element: <LoginPage /> },
  {
    path: "/",
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
      { path: "contacts/scan", element: <BusinessCardsPage /> },
      { path: "contacts/:contactId", element: <ContactDetailPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "products/new", element: <ProductNewPage /> },
      { path: "products/:productId", element: <ProductDetailPage /> },
      { path: "deals", element: <DealsPage /> },
      { path: "deals/new", element: <DealNewPage /> },
      { path: "deals/:dealId", element: <DealDetailPage /> },
      { path: "schedules", element: <SchedulesPage /> },
      { path: "schedules/week", element: <ScheduleWeekPage /> },
      { path: "meeting-notes", element: <MeetingNotesPage /> },
      {
        path: "meeting-notes/new",
        element: <Navigate replace to="/meeting-notes?create=1" />,
      },
      { path: "meeting-notes/:meetingNoteId", element: <MeetingNoteDetailPage /> },
      { path: "business-cards", element: <BusinessCardsPage /> },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "import", element: <ImportPage /> },
      { path: "export", element: <ExportPage /> },
      { path: "trash", element: <TrashPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "more", element: <MorePage /> },
    ],
  },
]);
