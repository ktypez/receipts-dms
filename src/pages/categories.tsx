import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

import { toast } from "sonner";

export function Categories() {
  const {
    categories,
    subcategories,
    loading,
    error,
    reload,
    loadSubcategories,
    create,
    update,
    remove,
    createSub,
    updateSub,
    removeSub,
  } = useCategories();
  const { receipts } = useReceipts();
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [subName, setSubName] = useState<Record<string, string>>({});
  const [addingSub, setAddingSub] = useState<string | null>(null);
  const [editSub, setEditSub] = useState<{ cat: string; id: string } | null>(
    null
  );
  const [editSubName, setEditSubName] = useState("");

  const receiptCounts = receipts.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {});

  const subCounts = receipts.reduce<Record<string, number>>((acc, r) => {
    if (r.subcategory) {
      const key = `${r.category}::${r.subcategory}`;
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, {});

  const toggleExpand = async (id: string) => {
    const next = !expanded[id];
    setExpanded((prev) => ({ ...prev, [id]: next }));
    if (next && !subcategories[id]) {
      await loadSubcategories(id);
    }
  };

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

  const handleAddSub = async (categoryId: string) => {
    const name = (subName[categoryId] || "").trim();
    if (!name) return;
    try {
      await createSub(categoryId, name);
      setSubName((prev) => ({ ...prev, [categoryId]: "" }));
      setAddingSub(null);
      toast.success("Sub-category created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create");
    }
  };

  const handleEditSub = async (categoryId: string, subId: string) => {
    const name = editSubName.trim();
    if (!name) return;
    try {
      await updateSub(categoryId, subId, name);
      setEditSub(null);
      toast.success("Sub-category updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  };

  const handleDeleteSub = async (categoryId: string, subId: string) => {
    try {
      await removeSub(categoryId, subId);
      toast.success("Sub-category deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
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
          <div className="mb-6 flex gap-3">
            <Input
              placeholder="ชื่อหมวดหมู่ใหม่"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="h-10"
            />
            <Button onClick={handleAdd} disabled={!newName.trim() || adding}>
              <Plus className="mr-1 h-4 w-4" />
              {adding ? "กำลังเพิ่ม..." : "เพิ่ม"}
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
            <div className="space-y-2">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg border border-border bg-card"
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleExpand(c.id)}
                      className="shrink-0 text-muted-foreground hover:text-foreground"
                      aria-label="Toggle sub-categories"
                    >
                      {expanded[c.id] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{c.name}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {receiptCounts[c.name] || 0}
                    </Badge>
                    <div className="flex shrink-0 gap-1">
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
                  </div>

                  {editId === c.id && (
                    <div className="border-t border-border px-4 py-3">
                      <div className="flex gap-3">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEdit(c.id);
                            if (e.key === "Escape") setEditId(null);
                          }}
                          autoFocus
                          className="flex-1"
                        />
                        <Button onClick={() => handleEdit(c.id)}>บันทึก</Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditId(null)}
                        >
                          ยกเลิก
                        </Button>
                      </div>
                    </div>
                  )}

                  {expanded[c.id] && (
                    <div className="border-t border-border px-4 py-3 pl-11 space-y-2">
                      {(subcategories[c.id] || []).length === 0 ? (
                        <p className="text-xs text-muted-foreground py-1">
                          ยังไม่มีหมวดหมู่ย่อย
                        </p>
                      ) : (
                        (subcategories[c.id] || []).map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center gap-2 rounded-md border border-border/60 bg-background px-3 py-2"
                          >
                            {editSub?.id === s.id ? (
                              <div className="flex flex-1 gap-2">
                                <Input
                                  value={editSubName}
                                  onChange={(e) =>
                                    setEditSubName(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      handleEditSub(c.id, s.id);
                                    if (e.key === "Escape") setEditSub(null);
                                  }}
                                  autoFocus
                                  className="flex-1 h-8"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleEditSub(c.id, s.id)}
                                >
                                  บันทึก
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditSub(null)}
                                >
                                  ยกเลิก
                                </Button>
                              </div>
                            ) : (
                              <>
                                <span className="flex-1 truncate text-sm">
                                  {s.name}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="shrink-0 text-muted-foreground"
                                >
                                  {subCounts[`${c.name}::${s.name}`] || 0}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    setEditSub({ cat: c.id, id: s.id });
                                    setEditSubName(s.name);
                                  }}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteSub(c.id, s.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        ))
                      )}

                      {addingSub === c.id ? (
                        <div className="flex gap-2 pt-1">
                          <Input
                            value={subName[c.id] || ""}
                            onChange={(e) =>
                              setSubName((prev) => ({
                                ...prev,
                                [c.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddSub(c.id);
                              if (e.key === "Escape") setAddingSub(null);
                            }}
                            placeholder="ชื่อหมวดหมู่ย่อย"
                            autoFocus
                            className="flex-1 h-8"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddSub(c.id)}
                            disabled={!(subName[c.id] || "").trim()}
                          >
                            เพิ่ม
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setAddingSub(null)}
                          >
                            ยกเลิก
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground"
                          onClick={() => {
                            setAddingSub(c.id);
                            if (!subcategories[c.id])
                              loadSubcategories(c.id);
                          }}
                        >
                          <Plus className="mr-1 h-3.5 w-3.5" /> เพิ่มหมวดหมู่ย่อย
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
