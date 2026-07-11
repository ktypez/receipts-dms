import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Layout } from "@/components/layout";
import { Dashboard } from "@/pages/dashboard";
import { Receipts } from "@/pages/receipts";
import { ReceiptDetail } from "@/pages/receipt-detail";
import { Upload } from "@/pages/upload";
import { Categories } from "@/pages/categories";
import { Settings } from "@/pages/settings";
import { Login } from "@/pages/login";

function ProtectedRoutes() {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="receipts" element={<Receipts />} />
        <Route path="receipts/:id" element={<ReceiptDetail />} />
        <Route path="upload" element={<Upload />} />
        <Route path="categories" element={<Categories />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<ProtectedRoutes />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
