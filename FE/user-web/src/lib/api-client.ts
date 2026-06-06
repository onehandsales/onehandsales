import { env } from "@/lib/env";

type JsonRequestBody = Record<string, unknown> | readonly unknown[];

type ApiClientOptions = Omit<RequestInit, "body"> & {
  accessToken?: string | null;
  body?: BodyInit | JsonRequestBody | null;
  skipAuthRefresh?: boolean;
  withCredentials?: boolean;
};

type ApiErrorShape = {
  readonly statusCode: number;
  readonly code: string;
  readonly message: string;
  readonly raw: unknown;
};

type ApiRefreshHandler = () => Promise<string | null>;

let appAccessToken: string | null = null;
let apiRefreshHandler: ApiRefreshHandler | null = null;

export class ApiClientError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly raw: unknown;

  constructor(error: ApiErrorShape) {
    super(error.message);
    this.name = "ApiClientError";
    this.statusCode = error.statusCode;
    this.code = error.code;
    this.raw = error.raw;
  }

  get isDeletedResource() {
    return this.code === "DeletedResource";
  }
}

export function setApiAccessToken(accessToken: string | null) {
  appAccessToken = accessToken;
}

export function clearApiAccessToken() {
  appAccessToken = null;
}

export function setApiRefreshHandler(handler: ApiRefreshHandler | null) {
  apiRefreshHandler = handler;
}

export async function apiClient<TResponse>(
  path: string,
  options: ApiClientOptions = {}
): Promise<TResponse> {
  if (path.startsWith("/admin/api/")) {
    throw new ApiClientError({
      statusCode: 400,
      code: "InvalidUserWebApiPath",
      message: "사용자 웹에서는 관리자 API를 호출할 수 없습니다.",
      raw: null,
    });
  }

  const response = await request(path, options);

  if (
    response.status === 401 &&
    !options.skipAuthRefresh &&
    apiRefreshHandler !== null
  ) {
    const refreshedToken = await apiRefreshHandler();

    if (refreshedToken) {
      appAccessToken = refreshedToken;
      return handleResponse<TResponse>(await request(path, options));
    }

    appAccessToken = null;
  }

  return handleResponse<TResponse>(response);
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.statusCode === 401) {
      return "인증이 필요합니다.";
    }

    if (error.statusCode === 410 && error.isDeletedResource) {
      return "삭제된 항목입니다.";
    }

    if (error.statusCode === 409 && error.isDeletedResource) {
      return "삭제된 항목은 복구한 뒤 수정할 수 있습니다.";
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "요청을 처리하지 못했습니다.";
}

async function request(path: string, options: ApiClientOptions) {
  const headers = new Headers(options.headers);
  const body = getRequestBody(options.body);

  if (body.shouldSetJsonContentType) {
    headers.set("Content-Type", "application/json");
  }

  const accessToken = options.accessToken ?? appAccessToken;

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return fetch(buildUrl(path), {
    ...options,
    body: body.value,
    credentials: options.withCredentials ? "include" : options.credentials,
    headers,
  });
}

async function handleResponse<TResponse>(response: Response): Promise<TResponse> {
  if (!response.ok) {
    const raw = await readResponseBody(response);
    throw new ApiClientError(normalizeError(response, raw));
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}

function buildUrl(path: string) {
  const baseUrl = env.apiUrl.endsWith("/") ? env.apiUrl.slice(0, -1) : env.apiUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

function getRequestBody(body: BodyInit | JsonRequestBody | null | undefined) {
  if (body === undefined || body === null) {
    return { value: body, shouldSetJsonContentType: false };
  }

  if (isBodyInit(body)) {
    return {
      value: body,
      shouldSetJsonContentType:
        typeof body === "string" || body instanceof URLSearchParams,
    };
  }

  return {
    value: JSON.stringify(body),
    shouldSetJsonContentType: true,
  };
}

function isBodyInit(value: unknown): value is BodyInit {
  return (
    typeof value === "string" ||
    value instanceof Blob ||
    value instanceof FormData ||
    value instanceof URLSearchParams ||
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value) ||
    (typeof ReadableStream !== "undefined" && value instanceof ReadableStream)
  );
}

async function readResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

function normalizeError(response: Response, raw: unknown): ApiErrorShape {
  const nestedError = getNestedError(raw);
  const code =
    getStringField(raw, "error") ??
    getStringField(nestedError, "error") ??
    response.statusText ??
    "ApiError";
  const message =
    getStringField(raw, "message") ??
    getStringField(nestedError, "message") ??
    code;

  return {
    statusCode: response.status,
    code,
    message,
    raw,
  };
}

function getNestedError(value: unknown): unknown {
  if (!isRecord(value)) {
    return null;
  }

  return value.error;
}

function getStringField(value: unknown, field: string): string | null {
  if (!isRecord(value)) {
    return null;
  }

  const fieldValue = value[field];

  if (typeof fieldValue === "string") {
    return fieldValue;
  }

  if (Array.isArray(fieldValue)) {
    return fieldValue.filter((item) => typeof item === "string").join(", ");
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
