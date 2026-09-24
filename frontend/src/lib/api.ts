export class APIError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any = null) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function fetchApi<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { requireAuth = true, headers, ...restOptions } = options;
  
  const mergedHeaders: Record<string, string> = {
    ...headers as Record<string, string>,
  };

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData || 
                     (options.body && (options.body as any).constructor?.name === 'FormData');

  if (!isFormData) {
    mergedHeaders["Content-Type"] = mergedHeaders["Content-Type"] || "application/json";
  }

  if (requireAuth && typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      mergedHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: mergedHeaders,
    ...restOptions,
  });

  if (response.status === 401 && typeof window !== "undefined") {
    // Optionally trigger a logout event
    localStorage.removeItem("token");
    if (window.location.pathname !== "/login") {
        window.location.href = "/login";
    }
  }

  if (!response.ok) {
    let data;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    let errorMessage = data?.detail;
    if (Array.isArray(data?.detail)) {
      errorMessage = data.detail.map((e: any) => `${e.loc?.join('.') || 'field'}: ${e.msg}`).join(', ');
    }

    throw new APIError(
      errorMessage || `API request failed with status ${response.status}`,
      response.status,
      data
    );
  }

  return response.json();
}

export type ProcessingStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface Meeting {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  meeting_date: string | null;
  source_type: string | null;
  processing_status: ProcessingStatus;
  created_at: string;
  updated_at: string;
}

export interface Transcript {
  id: string;
  meeting_id: string;
  raw_text: string;
  normalized_text: string | null;
  created_at: string;
  updated_at: string;
}

export type ActionStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED" | "NEEDS_REVIEW";
export type ValidationStatus = "VALID" | "INVALID" | "AMBIGUOUS" | "UNKNOWN";
export type ReviewStatus = "READY" | "NEEDS_REVIEW" | "REVIEWED" | "REJECTED";

export interface ActionItem {
  id: string;
  meeting_id: string;
  task: string;
  owner_name: string | null;
  owner_id: string | null;
  deadline: string | null;
  status: ActionStatus;
  confidence: number | null;
  evidence: string | null;
  source_location: Record<string, any> | null;
  validation_status: ValidationStatus;
  review_status: ReviewStatus;
  review_reasons: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewQueueItem extends Omit<ActionItem, "owner_id" | "source_location"> {
  meeting_title: string;
}

export interface ActionItemWithMeeting extends ActionItem {
  meeting_title: string;
  latest_review_id: string | null;
}

export interface ActionItemUpdate {
  status: ActionStatus;
}
