import { useState, useMemo } from "react";
import { Link } from "react-router";
import { Plus, Search, Trash2, Eye, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReceipts } from "@/hooks/use-receipts";
import { useCategories } from "@/hooks/use-categories";
import { formatDate, formatSize } from "@/lib/utils";
import { getFileUrl } from "@/lib/api";
import { toast } from "sonner";

const PAGE_SIZE = 20;

export function Receipts() {
  const { receipts, loading, error, remove, reload } = useReceipts();
  const { categories } = useCategories();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    let items = receipts;
    if (categoryFilter) {
      items = items.filter((r) => r.category === categoryFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter((r) => r.filename.toLowerCase().includes(q));
    }
    return items;
  }, [receipts, categoryFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await remove(deleteId);
      toast.success("Receipt deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setPage(1);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={reload}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Receipts</CardTitle>
          <Button asChild>
            <Link to="/upload">
              <Plus className="mr-1 h-4 w-4" /> Upload
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by filename..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="py-20 text-center text-muted-foreground">
              Loading...
            </div>
          ) : paged.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              {receipts.length === 0
                ? "No receipts yet."
                : "No receipts match your filters."}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">File</TableHead>
                      <TableHead>Filename</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-24 text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paged.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-md bg-muted">
                            {r.content_type.startsWith("image/") ? (
                              <img
                                src={getFileUrl(r.id)}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <Link
                            to={`/receipts/${r.id}`}
                            className="hover:underline"
                          >
                            {r.filename}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{r.category}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatSize(r.size)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(r.uploaded_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/receipts/${r.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Dialog
                              open={deleteId === r.id}
                              onOpenChange={(open) =>
                                setDeleteId(open ? r.id : null)
                              }
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete receipt</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete{" "}
                                    <strong>{r.filename}</strong>? This action
                                    cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => setDeleteId(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                  >
                                    {deleting ? "Deleting..." : "Delete"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Showing {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                  {filtered.length}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
