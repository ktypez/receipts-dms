import { useState } from "react";
import { Outlet } from "react-router";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

type SidebarState = "full" | "icon" | "hidden";

const nextState: Record<SidebarState, SidebarState> = {
  full: "icon",
  icon: "hidden",
  hidden: "full",
};

const marginMap: Record<SidebarState, string> = {
  full: "lg:ml-56",
  icon: "lg:ml-16",
  hidden: "lg:ml-0",
};

export function Layout() {
  const [sidebarState, setSidebarState] = useState<SidebarState>("full");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        state={sidebarState}
        onToggle={() => setSidebarState((s) => nextState[s])}
      />

      <div
        className={cn(
          "transition-all duration-300",
          marginMap[sidebarState]
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
