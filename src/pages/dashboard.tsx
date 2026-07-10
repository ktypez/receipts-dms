import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Upload, ReceiptText, Tags, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useReceipts } from "@/hooks/use-receipts";
import { useCategories } from "@/hooks/use-categories";
import { formatDateShort, formatSize } from "@/lib/utils";
import { getFileUrl } from "@/lib/api";
import type { Receipt } from "@/types";

function StatCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  href: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <Link
          to={href}
          className="mt-1 inline-flex items-center text-xs text-primary hover:underline"
        >
          View all <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
}

function RecentReceipt({ r }: { r: Receipt }) {
  return (
    <Link
      to={`/receipts/${r.id}`}
      className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted overflow-hidden">
        {r.content_type.startsWith("image/") ? (
          <img
            src={getFileUrl(r.id)}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <ReceiptText className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">{r.filename}</p>
        <p className="text-xs text-muted-foreground">
          {formatDateShort(r.uploaded_at)} &middot; {formatSize(r.size)}
        </p>
      </div>
      <Badge variant="secondary" className="shrink-0">
        {r.category}
      </Badge>
    </Link>
  );
}

export function Dashboard() {
  const { receipts, loading: loadingReceipts } = useReceipts();
  const { categories, loading: loadingCategories } = useCategories();
  const [recent, setRecent] = useState<Receipt[]>([]);

  useEffect(() => {
    setRecent(receipts.slice(0, 5));
  }, [receipts]);

  const last7 = receipts.filter((r) => {
    const diff = Date.now() - new Date(r.uploaded_at).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  });

  const loading = loadingReceipts || loadingCategories;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={ReceiptText}
          label="Total Receipts"
          value={receipts.length}
          href="/receipts"
        />
        <StatCard
          icon={Upload}
          label="Uploaded This Week"
          value={last7.length}
          href="/receipts"
        />
        <StatCard
          icon={Tags}
          label="Categories"
          value={categories.length}
          href="/categories"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Receipts</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/receipts">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <Upload className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No receipts yet. Upload your first receipt!
              </p>
              <Button asChild>
                <Link to="/upload">Upload Receipt</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((r) => (
                <RecentReceipt key={r.id} r={r} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
