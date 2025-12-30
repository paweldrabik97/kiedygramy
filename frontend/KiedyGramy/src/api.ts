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

export async function api<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
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
