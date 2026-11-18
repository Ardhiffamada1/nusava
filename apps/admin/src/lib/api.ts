const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const primaryUrl = `${API_BASE_URL}${normalizedEndpoint}`;
  const fallbackUrl = `/api/v1${normalizedEndpoint}`;

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(primaryUrl, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch (err) {
    if (primaryUrl !== fallbackUrl) {
      response = await fetch(fallbackUrl, {
        ...options,
        headers,
        credentials: 'include',
      });
    } else {
      throw err;
    }
  }

  const contentType = response.headers.get('content-type');
  let data: any = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else if (contentType && (contentType.includes('text/csv') || contentType.includes('text/plain'))) {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage = data?.message || response.statusText || 'Request failed';
    throw new ApiError(errorMessage, response.status, data?.details);
  }

  return data as T;
}
