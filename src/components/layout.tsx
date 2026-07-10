import { useState } from "react";
import { Outlet } from "react-router";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={sidebarOpen} />

      <div
        className={cn(
          "transition-all duration-300",
          sidebarOpen ? "lg:ml-56" : "lg:ml-0"
        )}
      >
        <Topbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}
