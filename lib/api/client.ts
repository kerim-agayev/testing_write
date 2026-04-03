export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, message: string, code: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed', code: 'UNKNOWN' }));
    throw new ApiError(res.status, body.error || 'Request failed', body.code || 'UNKNOWN');
  }
  return res.json();
}

export async function get<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`);
  return handleResponse<T>(res);
}

export async function post<T>(path: string, data?: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined,
  });
  return handleResponse<T>(res);
}

export async function patch<T>(path: string, data: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<T>(res);
}

export async function del<T = { ok: boolean }>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`, { method: 'DELETE' });
  return handleResponse<T>(res);
}
