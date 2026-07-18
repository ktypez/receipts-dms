import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Layout } from "@/components/layout";

const Dashboard = lazy(() => import("@/pages/dashboard").then(m => ({ default: m.Dashboard })));
const Receipts = lazy(() => import("@/pages/receipts").then(m => ({ default: m.Receipts })));
const ReceiptDetail = lazy(() => import("@/pages/receipt-detail").then(m => ({ default: m.ReceiptDetail })));
const Upload = lazy(() => import("@/pages/upload").then(m => ({ default: m.Upload })));
const Categories = lazy(() => import("@/pages/categories").then(m => ({ default: m.Categories })));
const Settings = lazy(() => import("@/pages/settings").then(m => ({ default: m.Settings })));
const Login = lazy(() => import("@/pages/login").then(m => ({ default: m.Login })));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
    </div>
  );
}

function ProtectedRoutes() {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={
              <Suspense fallback={<PageLoader />}>
                <Login />
              </Suspense>
            } />
            <Route path="*" element={<ProtectedRoutes />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
