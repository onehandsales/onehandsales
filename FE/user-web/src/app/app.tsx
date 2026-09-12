import { RouterProvider } from "react-router-dom";
import { AppProviders } from "@/app/providers/app-providers";
import { router } from "@/app/router/router";

// 기능 : 앱 최상위 화면을 렌더링합니다.
export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
