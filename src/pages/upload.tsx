import { useState, useRef, type DragEvent } from "react";
import { useNavigate } from "react-router";
import {
  Upload as UploadIcon,
  FileText,
  X,
  AlertCircle,
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
import { Progress } from "@/components/ui/progress";
import { useCategories } from "@/hooks/use-categories";
import { uploadReceiptWithProgress, getFileUrl } from "@/lib/api";
import { toast } from "sonner";
import { formatSize } from "@/lib/utils";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
const MAX_SIZE = 3 * 1024 * 1024;
const COMPRESS_MAX = 2048;
const COMPRESS_QUALITY = 0.8;

async function compressImage(file: File): Promise<File> {
  const img = await createImageBitmap(file);
  let { width, height } = img;
  if (width > COMPRESS_MAX || height > COMPRESS_MAX) {
    const ratio = Math.min(COMPRESS_MAX / width, COMPRESS_MAX / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);
  img.close();
  const blob = await new Promise<Blob>((r) =>
    canvas.toBlob((b) => r(b!), "image/webp", COMPRESS_QUALITY)
  );
  return new File([blob], file.name.replace(/\.\w+$/, ".webp"), {
    type: "image/webp",
  });
}

export function Upload() {
  const navigate = useNavigate();
  const { categories, loading: catsLoading } = useCategories();
  const [file, setFile] = useState<File | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressing, setCompressing] = useState(false);
  const [category, setCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const validate = (f: File): string | null => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      return "Invalid file type. Allowed: JPEG, PNG, WebP, PDF";
    }
    if (f.size > 10 * 1024 * 1024) {
      return "File too large. Maximum 10 MB";
    }
    return null;
  };

  const handleFile = async (f: File) => {
    const err = validate(f);
    if (err) {
      setError(err);
      clearFileState();
      return;
    }
    setError(null);
    setOriginalSize(f.size);

    if (f.type.startsWith("image/")) {
      setCompressing(true);
      try {
        const compressed = await compressImage(f);
        setFile(compressed);
        setPreviewUrl(URL.createObjectURL(compressed));
      } catch {
        setFile(f);
        setPreviewUrl(URL.createObjectURL(f));
      } finally {
        setCompressing(false);
      }
    } else {
      setFile(f);
      setPreviewUrl(null);
    }
  };

  const clearFileState = () => {
    setFile(null);
    setOriginalSize(0);
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const clearFile = () => {
    clearFileState();
    if (fileInputRef.current) fileInputRef.current.value = "";
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

  const handleUpload = async () => {
    if (!file || !category) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const result = await uploadReceiptWithProgress(
        file,
        category,
        setUploadProgress
      );
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
            PDF. Images are compressed to WebP for smaller storage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!file && !compressing ? (
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
                  JPEG, PNG, WebP, PDF (images compressed to WebP)
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
          ) : compressing ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <p className="text-sm text-muted-foreground">
                Compressing image...
              </p>
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
                  <p className="truncate text-sm font-medium">{file?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {originalSize && file && originalSize !== file.size ? (
                      <>
                        <span className="line-through">
                          {formatSize(originalSize)}
                        </span>{" "}
                        → {formatSize(file.size)}
                      </>
                    ) : (
                      file && formatSize(file.size)
                    )}
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

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Uploading...</span>
                    <span className="font-medium">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleUpload}
                disabled={!category || uploading}
              >
                {uploading ? (
                  <>{uploadProgress}% — Uploading...</>
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
