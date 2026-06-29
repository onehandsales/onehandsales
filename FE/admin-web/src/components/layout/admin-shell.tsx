import { Outlet } from "react-router-dom";

export function AdminShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="border-b bg-white px-4 py-4 md:fixed md:inset-y-0 md:left-0 md:w-64 md:border-b-0 md:border-r md:py-5">
        <div className="text-sm font-semibold text-primary">onehand.sales admin</div>
      </aside>
      <main className="md:pl-64">
        <Outlet />
      </main>
    </div>
  );
}
