import { Sun, Moon, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/lib/theme-provider";

export function Settings() {
  const { theme, toggle } = useTheme();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark mode
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggle}
              className="gap-2"
            >
              {theme === "light" ? (
                <>
                  <Moon className="h-4 w-4" /> Dark
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4" /> Light
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            <span className="font-medium text-foreground">Receipts DMS</span>
          </div>
          <p>Version 2.0.0 — Document Management System for personal use.</p>
          <Separator />
          <p>
            Built with React, shadcn/ui, and Cloudflare (D1 + R2 + Pages).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
