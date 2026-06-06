import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { PlaceholderPage } from "@/components/layout/placeholder-page";
import { BusinessCardsPage } from "@/pages/business-cards";
import { CompanyDetailPage } from "@/pages/companies/detail";
import { CompaniesPage } from "@/pages/companies";
import { ContactsPage } from "@/pages/contacts";
import { DealsPage } from "@/pages/deals";
import { ExportPage } from "@/pages/export";
import { HomePage } from "@/pages/home";
import { ImportPage } from "@/pages/import";
import { LoginPage } from "@/pages/login";
import { MeetingNotesPage } from "@/pages/meeting-notes";
import { ProductsPage } from "@/pages/products";
import { SchedulesPage } from "@/pages/schedules";
import { SettingsPage } from "@/pages/settings";
import { TrashPage } from "@/pages/trash";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "companies", element: <CompaniesPage /> },
      { path: "companies/:companyId", element: <CompanyDetailPage /> },
      { path: "contacts", element: <ContactsPage /> },
      { path: "contacts/:contactId", element: <PlaceholderPage title="거래처 상세" /> },
      { path: "products", element: <ProductsPage /> },
      { path: "products/:productId", element: <PlaceholderPage title="제품 상세" /> },
      { path: "deals", element: <DealsPage /> },
      { path: "deals/:dealId", element: <PlaceholderPage title="딜 상세" /> },
      { path: "schedules", element: <SchedulesPage /> },
      { path: "meeting-notes", element: <MeetingNotesPage /> },
      { path: "business-cards", element: <BusinessCardsPage /> },
      { path: "import", element: <ImportPage /> },
      { path: "export", element: <ExportPage /> },
      { path: "trash", element: <TrashPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
