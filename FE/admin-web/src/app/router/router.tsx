import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedAdminRoute } from "@/features/auth";
import { HomePage } from "@/pages/home";
import { LoginPage } from "@/pages/login";

// 기능 : Admin Web route를 /admin/api/me 확인 흐름으로만 구성합니다.
export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <ProtectedAdminRoute>
        <HomePage />
      </ProtectedAdminRoute>
    ),
  },
  { path: "*", element: <Navigate replace to="/" /> },
]);
