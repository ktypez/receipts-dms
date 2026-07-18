import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "@/components/sidebar";
import { BottomNav } from "@/components/bottom-nav";
import { Topbar } from "@/components/topbar";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/lib/use-media-query";
import { Toaster } from "sonner";

export function Layout() {
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {isMobile ? <BottomNav /> : <Sidebar open={sidebarOpen} />}

      <div
        className={cn(
          "transition-all duration-300",
          !isMobile && sidebarOpen && "ml-56",
          isMobile && "pb-20"  // Space for bottom nav
        )}
      >
        <Topbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}
