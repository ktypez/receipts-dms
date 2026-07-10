import { useState, useRef, type DragEvent } from "react";
import { useNavigate } from "react-router";
import {
  Upload as UploadIcon,
  FileText,
  X,
  AlertCircle,
  CheckCircle2,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCategories } from "@/hooks/use-categories";
import { uploadReceipt, getFileUrl } from "@/lib/api";
import { toast } from "sonner";
import { formatSize } from "@/lib/utils";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
const MAX_SIZE = 10 * 1024 * 1024;

export function Upload() {
  const navigate = useNavigate();
  const { categories, loading: catsLoading } = useCategories();
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const validate = (f: File): string | null => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      return "Invalid file type. Allowed: JPEG, PNG, WebP, PDF";
    }
    if (f.size > MAX_SIZE) {
      return "File too large. Maximum 10 MB";
    }
    return null;
  };

  const handleFile = (f: File) => {
    const err = validate(f);
    if (err) {
      setError(err);
      setFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }
    setError(null);
    setFile(f);
    if (f.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(f));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!file || !category) return;
    setUploading(true);
    try {
      const result = await uploadReceipt(file, category);
      toast.success("Upload successful");
      navigate(`/receipts/${result.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Receipt</CardTitle>
          <CardDescription>
            Drop a receipt file or click to select. Supported: JPEG, PNG, WebP,
            PDF (max 10 MB).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!file ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-12 transition-colors ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
            >
              <UploadIcon className="h-10 w-10 text-muted-foreground/50" />
              <div className="text-center">
                <p className="text-sm font-medium">
                  Drop your receipt here, or click to browse
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  JPEG, PNG, WebP, PDF up to 10 MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={handleInputChange}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border p-4">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-16 w-16 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(file.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearFile}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                {catsLoading ? (
                  <div className="text-sm text-muted-foreground">
                    Loading categories...
                  </div>
                ) : (
                  <Select
                    value={category}
                    onValueChange={setCategory}
                    disabled={uploading}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <Button
                className="w-full"
                onClick={handleUpload}
                disabled={!category || uploading}
              >
                {uploading ? (
                  <>Uploading...</>
                ) : (
                  <>
                    <UploadIcon className="mr-1 h-4 w-4" /> Upload Receipt
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
