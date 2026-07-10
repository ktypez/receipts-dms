import { useParams, useNavigate, Link } from "react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Trash2,
  FileText,
  Download,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useReceipts } from "@/hooks/use-receipts";
import { formatDate, formatSize } from "@/lib/utils";
import { getFileUrl } from "@/lib/api";
import { toast } from "sonner";

export function ReceiptDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { receipts, loading, remove } = useReceipts();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const receipt = receipts.find((r) => r.id === id);

  useEffect(() => {
    if (!loading && !receipt && receipts.length > 0) {
      navigate("/receipts", { replace: true });
    }
  }, [loading, receipt, receipts, navigate]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await remove(id);
      toast.success("Receipt deleted");
      navigate("/receipts");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <AlertCircle className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">Receipt not found</p>
        <Button variant="outline" asChild>
          <Link to="/receipts">Back to receipts</Link>
        </Button>
      </div>
    );
  }

  const isImage = receipt.content_type.startsWith("image/");
  const isPdf = receipt.content_type === "application/pdf";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/receipts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-xl font-semibold truncate">{receipt.filename}</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center rounded-lg border bg-muted/30 min-h-[300px]">
              {isImage ? (
                <img
                  src={getFileUrl(receipt.id)}
                  alt={receipt.filename}
                  className="max-h-[600px] max-w-full object-contain"
                />
              ) : isPdf ? (
                <iframe
                  src={getFileUrl(receipt.id)}
                  className="h-[600px] w-full rounded-lg"
                  title={receipt.filename}
                />
              ) : (
                <div className="flex flex-col items-center gap-3 py-10">
                  <FileText className="h-16 w-16 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Preview not available
                  </p>
                  <Button variant="outline" asChild>
                    <a
                      href={getFileUrl(receipt.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="mr-1 h-4 w-4" /> Download file
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Filename</p>
              <p className="text-sm font-medium break-all">
                {receipt.filename}
              </p>
            </div>

            <Separator />

            <div>
              <p className="text-xs text-muted-foreground">Category</p>
              <Badge variant="secondary" className="mt-1">
                {receipt.category}
              </Badge>
            </div>

            <Separator />

            <div>
              <p className="text-xs text-muted-foreground">File type</p>
              <p className="text-sm">{receipt.content_type}</p>
            </div>

            <Separator />

            <div>
              <p className="text-xs text-muted-foreground">Size</p>
              <p className="text-sm">{formatSize(receipt.size)}</p>
            </div>

            <Separator />

            <div>
              <p className="text-xs text-muted-foreground">Uploaded at</p>
              <p className="text-sm">{formatDate(receipt.uploaded_at)}</p>
            </div>

            <Separator />

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" asChild>
                <a
                  href={getFileUrl(receipt.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="mr-1 h-4 w-4" /> Open
                </a>
              </Button>
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete receipt</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete{" "}
                      <strong>{receipt.filename}</strong>? This action cannot be
                      undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteOpen(false)}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
