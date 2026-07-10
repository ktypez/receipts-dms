import { useState } from "react";
import { Outlet } from "react-router";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

export function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />

      <div
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-56"
        )}
      >
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      <Toaster
        position="bottom-right"
        richColors
        closeButton
      />
    </div>
  );
}
