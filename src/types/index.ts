export interface Receipt {
  id: string;
  filename: string;
  category: string;
  owner?: string;
  content_type: string;
  size: number;
  uploaded_at: string;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface UploadResponse {
  id: string;
  filename: string;
  category: string;
  owner?: string;
  uploaded_at: string;
  notes?: string;
}

export interface ApiError {
  error: string;
}
