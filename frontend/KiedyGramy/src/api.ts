export class ApiError extends Error {
  status: number;
  retryAfterSeconds?: number;
  body?: any;

  constructor(message: string, status: number, body?: any, retryAfterSeconds?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

function getRetryAfterSeconds(res: Response): number | undefined {
  const h = res.headers.get("Retry-After");
  if (!h) return undefined;
  const n = Number(h);
  return Number.isFinite(n) ? n : undefined;  
}

const BASE_URL = (import.meta as any).env.VITE_API_URL || "";

export async function api<T>(url: string, options: RequestInit = {}): Promise<T> {
  const fullUrl = `${BASE_URL}${url}`;
  const res = await fetch(fullUrl, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    credentials: "include",
  });

  if (!res.ok) {
  const errorBody = await res.json().catch(() => ({}));

  const errorMessage =
    errorBody.detail ||
    errorBody.message ||
    errorBody.title ||
    (errorBody.errors ? JSON.stringify(errorBody.errors) : "") ||
    res.statusText;

  throw new Error(errorMessage);
}

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
