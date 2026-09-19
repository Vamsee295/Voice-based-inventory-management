const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export class ApiError extends Error {
  constructor(public status: number, public message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      // Ignore JSON parse errors for non-JSON responses
    }
    
    throw new ApiError(
      response.status,
      errorData?.detail || response.statusText || 'An API error occurred',
      errorData
    );
  }

  // Handle 204 No Content or empty responses
  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) => 
    fetchApi<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T>(endpoint: string, data: any, options?: RequestInit) => 
    fetchApi<T>(endpoint, { 
      ...options, 
      method: 'POST',
      body: JSON.stringify(data)
    }),
    
  put: <T>(endpoint: string, data: any, options?: RequestInit) => 
    fetchApi<T>(endpoint, { 
      ...options, 
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    
  patch: <T>(endpoint: string, data: any, options?: RequestInit) => 
    fetchApi<T>(endpoint, { 
      ...options, 
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
    
  delete: <T>(endpoint: string, options?: RequestInit) => 
    fetchApi<T>(endpoint, { ...options, method: 'DELETE' }),
};
