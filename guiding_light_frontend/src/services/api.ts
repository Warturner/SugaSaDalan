const API_BASE =
  '/guiding_light_backend';

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {

  const response = await fetch(
    `${API_BASE}/${endpoint}`,
    {
      ...options,
      credentials:
        options.credentials ??
        'include'
    }
  );

  let data: any;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      'Server returned an invalid response.'
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
      `Request failed (${response.status})`
    );
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as T;
}