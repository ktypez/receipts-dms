import { BrowserRouter, Routes, Route } from "react-router";
import { ThemeProvider } from "@/lib/theme-provider";
import { Layout } from "@/components/layout";
import { Dashboard } from "@/pages/dashboard";
import { Receipts } from "@/pages/receipts";
import { ReceiptDetail } from "@/pages/receipt-detail";
import { Upload } from "@/pages/upload";
import { Categories } from "@/pages/categories";
import { Settings } from "@/pages/settings";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </ThemeProvider>
  );
}
