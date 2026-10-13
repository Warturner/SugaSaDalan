const API_BASE = '/guiding_light_backend';

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}/${endpoint}`, {
    ...options,
    credentials: options.credentials ?? 'include'
  });

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new Error('Server returned an invalid response.');
  }

  // Notify the dashboard immediately when an authenticated endpoint
  // rejects a displaced/expired session. Wrong login credentials are
  // not a dashboard-session error.
  if (response.status === 401 && endpoint !== 'login.php') {
    window.dispatchEvent(new CustomEvent('guiding-light:session-invalid', {
      detail: data?.reason ?? null
    }));
  }

  if (!response.ok) {
    throw new Error(data?.error || `Request failed (${response.status})`);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as T;
}
