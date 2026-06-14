const TOKEN_KEY = 'erp_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public erros?: { campo: string; erro: string }[],
  ) {
    super(message);
  }
}

interface ApiOptions {
  method?: string;
  body?: unknown;
}

/** Chama a API NestJS (proxy /api em dev). Injeta o JWT e normaliza erros. */
export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = tokenStore.get();
  const res = await fetch(`/api${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    const message = (data?.message as string) ?? 'Algo deu errado.';
    if (res.status === 401) tokenStore.clear();
    throw new ApiError(res.status, message, data?.erros);
  }
  return data as T;
}
