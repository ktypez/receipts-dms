import { NavLink } from "react-router";
import {
  LayoutDashboard,
  Receipt,
  Upload,
  Tags,
  Settings,
  PanelLeftClose,
  ChevronLeft,
  ChevronRight,
  Menu,
  ReceiptText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/receipts", label: "Receipts", icon: ReceiptText },
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/settings", label: "Settings", icon: Settings },
];

type SidebarState = "full" | "icon" | "hidden";

interface SidebarProps {
  state: SidebarState;
  onToggle: () => void;
}

export function Sidebar({ state, onToggle }: SidebarProps) {
  return (
    <>
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 flex h-screen flex-col border-r bg-card transition-all duration-300",
          state === "full" && "w-56",
          state === "icon" && "w-16",
          state === "hidden" && "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center gap-2 px-4">
          {state === "full" && (
            <span className="flex items-center gap-2 font-semibold tracking-tight">
              <Receipt className="h-5 w-5 text-primary" />
              Receipts DMS
            </span>
          )}
          {state === "icon" && (
            <Receipt className="mx-auto h-5 w-5 text-primary" />
          )}
        </div>

        {(state === "full" || state === "icon") && <Separator />}

        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  state === "icon" && "justify-center px-2"
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {state === "full" && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <Separator />

        <div className="p-2">
          {state === "full" && (
            <Button
              variant="ghost"
              className="w-full"
              onClick={onToggle}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Collapse
            </Button>
          )}
          {state === "icon" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-full"
              onClick={onToggle}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
      </aside>

      {state === "hidden" && (
        <Button
          variant="outline"
          size="icon"
          className="fixed left-3 top-3 z-50 h-8 w-8"
          onClick={onToggle}
        >
          <Menu className="h-4 w-4" />
        </Button>
      )}
    </>
  );
}
