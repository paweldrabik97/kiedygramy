export async function api<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }, 
    ...options,
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${msg}`);
  }
  // 204 No Content?
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
