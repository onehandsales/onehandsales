import { env } from "@/lib/env";

type JsonRequestBody = Record<string, unknown> | readonly unknown[];

type ApiClientOptions = Omit<RequestInit, "body"> & {
  accessToken?: string | null;
  body?: BodyInit | JsonRequestBody | null;
  skipAuthRefresh?: boolean;
  withCredentials?: boolean;
};

export type ApiBlobResponse = {
  readonly blob: Blob;
  readonly fileName: string | null;
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
      message: "?ъ슜???뱀뿉?쒕뒗 愿由ъ옄 API瑜??몄텧?????놁뼱??",
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

export async function apiBlobClient(
  path: string,
  options: ApiClientOptions = {}
): Promise<ApiBlobResponse> {
  if (path.startsWith("/admin/api/")) {
    throw new ApiClientError({
      statusCode: 400,
      code: "InvalidUserWebApiPath",
      message: "?ъ슜???뱀뿉?쒕뒗 愿由ъ옄 API瑜??몄텧?????놁뼱??",
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
      return handleBlobResponse(await request(path, options));
    }

    appAccessToken = null;
  }

  return handleBlobResponse(response);
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.statusCode === 401) {
      return "濡쒓렇?명븯硫??댁슜?????덉뼱??";
    }

    if (error.statusCode === 410 && error.isDeletedResource) {
      return "??젣????ぉ?댁뿉??";
    }

    if (error.statusCode === 409 && error.isDeletedResource) {
      return "??젣????ぉ? 蹂듦뎄?????섏젙?????덉뼱??";
    }

    const conflictMessage = getConflictErrorMessage(error.code);
    if (conflictMessage) {
      return conflictMessage;
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "?붿껌??泥섎━?섏? 紐삵뻽?댁슂. ?ㅼ떆 ?쒕룄??二쇱꽭??";
}

// 湲곕뒫 : Backend safe failure ?묐떟??retryable 媛믪쓣 ?ъ슜???ъ떆??踰꾪듉 ?몄텧 湲곗??쇰줈 蹂?섑빀?덈떎.
export function isApiErrorRetryable(error: unknown): boolean {
  if (!(error instanceof ApiClientError)) {
    return false;
  }

  return (
    getBooleanField(error.raw, "retryable") ??
    getBooleanField(getNestedError(error.raw), "retryable") ??
    false
  );
}

function getConflictErrorMessage(code: string) {
  switch (code) {
    case "CompanyInUse":
      return "연결된 담당자 또는 딜을 정리하면 회사를 삭제할 수 있어요.";
    case "ContactInUse":
      return "연결된 딜을 정리하면 담당자를 삭제할 수 있어요.";
    case "ProductInUse":
      return "연결된 딜을 정리하면 제품을 삭제할 수 있어요.";
    case "DealInUse":
      return "연결된 활동을 정리하면 딜을 삭제할 수 있어요.";
    default:
      return null;
  }
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

  const text = await response.text();

  if (text.length === 0) {
    return undefined as TResponse;
  }

  return JSON.parse(text) as TResponse;
}

async function handleBlobResponse(response: Response): Promise<ApiBlobResponse> {
  if (!response.ok) {
    const raw = await readResponseBody(response);
    throw new ApiClientError(normalizeError(response, raw));
  }

  return {
    blob: await response.blob(),
    fileName: parseContentDispositionFileName(
      response.headers.get("content-disposition")
    ),
  };
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

function parseContentDispositionFileName(value: string | null) {
  if (!value) {
    return null;
  }

  const encodedFileName = value.match(/filename\*=UTF-8''([^;]+)/i)?.[1];

  if (encodedFileName) {
    return decodeURIComponent(encodedFileName);
  }

  return value.match(/filename="?([^";]+)"?/i)?.[1] ?? null;
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

function getBooleanField(value: unknown, field: string): boolean | null {
  if (!isRecord(value)) {
    return null;
  }

  const fieldValue = value[field];

  return typeof fieldValue === "boolean" ? fieldValue : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
