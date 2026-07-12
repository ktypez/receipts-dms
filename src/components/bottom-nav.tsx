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
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 flex items-center justify-around border-t border-border bg-background px-2 pb-safe-bottom">
      {navItems.map((item, index) => {
        // Center item (index 2) is the upload/action button - raised FAB style
        const isCenter = index === 2;
        
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 transition-all duration-200",
                isCenter
                  ? "relative -top-6"
                  : "",
                isCenter
                  ? cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)] transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground scale-105 shadow-[0_6px_16px_rgba(0,0,0,0.2),0_3px_6px_rgba(0,0,0,0.15)]"
                        : "bg-primary text-primary-foreground"
                    )
                  : cn(
                      "text-[10px] font-medium",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground"
                    )
              )
            }
          >
            <item.icon 
              className={cn(
                "transition-all duration-200",
                isCenter ? "h-6 w-6" : "h-5 w-5",
                isCenter && "text-primary-foreground"
              )} 
            />
            {!isCenter && <span>{item.label}</span>}
          </NavLink>
        );
      })}
    </nav>
  );
}
