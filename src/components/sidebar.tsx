import { NavLink } from "react-router";
import {
  LayoutDashboard,
  Receipt,
  Upload,
  Tags,
  Settings,
  ReceiptText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/receipts", label: "Receipts", icon: ReceiptText },
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  open: boolean;
}

export function Sidebar({ open }: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 flex h-screen flex-col border-r bg-card transition-all duration-300",
        open ? "w-56" : "-translate-x-full"
      )}
    >
      <div className="flex h-14 items-center gap-2 px-4">
        <span className="flex items-center gap-2 font-semibold tracking-tight">
          <Receipt className="h-5 w-5 text-primary" />
          Receipts DMS
        </span>
      </div>

      <Separator />

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
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
