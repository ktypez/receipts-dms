import { NavLink } from "react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Upload,
  Tags,
  Settings,
} from "lucide-react";
import { cn, staggerContainer, fadeUpItem } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/receipts", label: "Documents", icon: FileText },
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  open: boolean;
}

export function Sidebar({ open }: SidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{
        x: open ? 0 : -224,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 z-40 flex h-screen w-56 flex-col bg-background border-r border-border"
    >
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <span className="flex items-center gap-2 font-semibold tracking-tight text-foreground">
          <FileText className="h-5 w-5" />
          Paper
        </span>
      </div>

      <motion.nav
        className="flex-1 space-y-1 p-2"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {navItems.map((item) => (
          <motion.div key={item.to} variants={fadeUpItem}>
            <NavLink
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          </motion.div>
        ))}
      </motion.nav>
    </motion.aside>
  );
}