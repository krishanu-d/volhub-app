import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { TIMEOUT, TOKEN_KEY } from 'src/utils/constant';
import { API_ERRORS } from 'src/utils/errorStrings';
import { storage } from 'src/utils/storage';

// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * Standard response shape returned by every API method.
 * `data` is typed via the generic T so callers get full autocomplete.
 *
 * Usage:
 *   const { success, data, error } = await getRequest<UserProfile>('/user/me');
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: string | null;
  statusCode: number | null;
}

export interface ApiError {
  message: string;
  statusCode: number | null;
  raw: unknown; // original error for debugging
}

// ─── Axios Instance ──────────────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: '',
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
// Reads token from MMKV (synchronous) and attaches it to every request.

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = storage.getString(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ─── Response Interceptor ────────────────────────────────────────────────────
// Handles global error cases. On 401 → clear token (hook into your nav/auth
// logic here when you're ready, e.g. navigationRef.navigate('Login')).

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response, // pass through success responses
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Session expired — clear stored token
      storage.remove(TOKEN_KEY);
      // TODO: redirect to login screen via your navigation ref
      // e.g. navigationRef.current?.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
    return Promise.reject(error);
  },
);

// ─── Response Wrapper ────────────────────────────────────────────────────────
// Normalises every response (success or error) into ApiResponse<T>.

function buildSuccess<T>(response: AxiosResponse<T>): ApiResponse<T> {
  return {
    success: true,
    data: response.data,
    error: null,
    statusCode: response.status,
  };
}

function buildError<T>(error: AxiosError): ApiResponse<T> {
  const statusCode = error.response?.status ?? null;

  let message: string;

  if (error.code === 'ECONNABORTED') {
    message = API_ERRORS.TIMEOUT;
  } else if (!error.response) {
    // Network error — no response received at all
    message = API_ERRORS.NO_INTERNET;
  } else {
    switch (statusCode) {
      case 400:
        message = API_ERRORS.BAD_REQUEST;
        break;
      case 401:
        message = API_ERRORS.UNAUTHORIZED;
        break;
      case 403:
        message = API_ERRORS.FORBIDDEN;
        break;
      case 404:
        message = API_ERRORS.NOT_FOUND;
        break;
      case 500:
      default:
        message = API_ERRORS.SERVER_ERROR;
        break;
    }
  }

  return {
    success: false,
    data: null,
    error: message,
    statusCode,
  };
}

// ─── API Methods ─────────────────────────────────────────────────────────────

/**
 * GET — fetch data, optionally pass query params via config.
 *
 * Example:
 *   const { data } = await getRequest<User[]>('/users', { params: { page: 1 } });
 */
export async function getRequest<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.get<T>(url, config);
    return buildSuccess(response);
  } catch (error) {
    return buildError<T>(error as AxiosError);
  }
}

/**
 * POST — create a resource or trigger an action.
 *
 * Example:
 *   const { data } = await postRequest<AuthTokens>('/auth/login', { email, password });
 */
export async function postRequest<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.post<T>(url, data, config);
    return buildSuccess(response);
  } catch (error) {
    return buildError<T>(error as AxiosError);
  }
}

/**
 * PUT — full update of a resource.
 *
 * Example:
 *   const { success } = await putRequest('/user/update', updatedUser);
 */
export async function putRequest<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.put<T>(url, data, config);
    return buildSuccess(response);
  } catch (error) {
    return buildError<T>(error as AxiosError);
  }
}

/**
 * PATCH — partial update of a resource.
 *
 * Example:
 *   const { success } = await patchRequest('/user/update', { name: 'New Name' });
 */
export async function patchRequest<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.patch<T>(url, data, config);
    return buildSuccess(response);
  } catch (error) {
    return buildError<T>(error as AxiosError);
  }
}

/**
 * DELETE — remove a resource.
 *
 * Example:
 *   const { success } = await deleteRequest('/posts/123');
 */
export async function deleteRequest<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.delete<T>(url, config);
    return buildSuccess(response);
  } catch (error) {
    return buildError<T>(error as AxiosError);
  }
}

export default apiClient;
