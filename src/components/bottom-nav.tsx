import { NavLink } from "react-router";
import {
  LayoutDashboard,
  FileText,
  Upload,
  Tags,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "หน้าแรก", icon: LayoutDashboard },
  { to: "/receipts", label: "เอกสาร", icon: FileText },
  { to: "/upload", label: "อัปโหลด", icon: Upload },
  { to: "/categories", label: "หมวดหมู่", icon: Tags },
  { to: "/settings", label: "ตั้งค่า", icon: Settings },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 z-40 flex h-16 w-full items-center border-t border-border bg-background px-2">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={({ isActive }) =>
            cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-md py-1.5 text-[11px] font-medium transition-colors",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
