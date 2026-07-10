import { PanelLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useMediaQuery } from "@/lib/use-media-query";
import { useLocation } from "react-router";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/receipts": "Receipts",
  "/upload": "Upload",
  "/categories": "Categories",
  "/settings": "Settings",
};

interface TopbarProps {
  onToggleSidebar: () => void;
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const title = pageTitles[location.pathname] || "Receipts DMS";
  const Icon = isMobile ? Menu : PanelLeft;

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
      <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
        <Icon className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      <h1 className="text-lg font-semibold">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
