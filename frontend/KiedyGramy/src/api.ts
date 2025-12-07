export async function api<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
    credentials: "include",
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const errorMessage = errorBody.message || errorBody.title || res.statusText;
    throw new Error(errorMessage);
  }
  // 204 No Content?
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
