import { useState } from "react";
import { Outlet } from "react-router";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/lib/use-media-query";
import { Toaster } from "sonner";

export function Layout() {
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        open={sidebarOpen}
        isMobile={isMobile}
        onClose={() => setSidebarOpen(false)}
      />

      <div
        className={cn(
          "transition-all duration-300",
          !isMobile && sidebarOpen ? "ml-56" : "ml-0"
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
