import { RouterProvider } from "react-router-dom";
import { AppProviders } from "./providers/app-providers";
import { router } from "./router/router";

// 기능 : 실제 인증이나 업무 연결 없이 새 목 앱의 기본 라우터를 실행한다.
export function App() { return <AppProviders><RouterProvider router={router} /></AppProviders>; }
