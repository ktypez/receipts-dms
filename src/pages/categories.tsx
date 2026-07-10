import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCategories } from "@/hooks/use-categories";
import { useReceipts } from "@/hooks/use-receipts";
import { formatDateShort } from "@/lib/utils";
import { toast } from "sonner";

export function Categories() {
  const { categories, loading, error, reload, create, update, remove } =
    useCategories();
  const { receipts } = useReceipts();
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const receiptCounts = receipts.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {});

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    try {
      await create(name);
      setNewName("");
      toast.success("Category created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = async (id: string) => {
    const name = editName.trim();
    if (!name) return;
    try {
      await update(id, name);
      setEditId(null);
      toast.success("Category updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await remove(deleteId);
      toast.success("Category deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
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
          <CardTitle>Manage Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-2">
            <Input
              placeholder="New category name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button onClick={handleAdd} disabled={!newName.trim() || adding}>
              <Plus className="mr-1 h-4 w-4" />
              {adding ? "Adding..." : "Add"}
            </Button>
          </div>

          {loading ? (
            <div className="py-20 text-center text-muted-foreground">
              Loading...
            </div>
          ) : categories.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No categories yet. Add one above.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Receipts</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {editId === c.id ? (
                          <div className="flex gap-2">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleEdit(c.id);
                                if (e.key === "Escape") setEditId(null);
                              }}
                              autoFocus
                              className="h-8"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleEdit(c.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          c.name
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {receiptCounts[c.name] || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateShort(c.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditId(c.id);
                              setEditName(c.name);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Dialog
                            open={deleteId === c.id}
                            onOpenChange={(open) =>
                              setDeleteId(open ? c.id : null)
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
                                <DialogTitle>Delete category</DialogTitle>
                                <DialogDescription>
                                  {(receiptCounts[c.name] || 0) > 0 ? (
                                    <span className="text-destructive">
                                      Cannot delete "{c.name}" —{" "}
                                      {receiptCounts[c.name]} receipt(s) are
                                      using this category. Reassign them first.
                                    </span>
                                  ) : (
                                    <span>
                                      Are you sure you want to delete{" "}
                                      <strong>{c.name}</strong>? This action
                                      cannot be undone.
                                    </span>
                                  )}
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setDeleteId(null)}
                                >
                                  Cancel
                                </Button>
                                {(receiptCounts[c.name] || 0) === 0 && (
                                  <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                  >
                                    {deleting ? "Deleting..." : "Delete"}
                                  </Button>
                                )}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
