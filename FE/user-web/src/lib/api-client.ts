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

// 역할 : ApiClientError 도메인 오류를 표현합니다.
export class ApiClientError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly raw: unknown;

  // 기능 : 클래스 실행에 필요한 의존성과 초기 상태를 준비합니다.
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

// 기능 : set Api Access Token 값을 설정합니다.
export function setApiAccessToken(accessToken: string | null) {
  appAccessToken = accessToken;
}

// 기능 : clear Api Access Token 상태를 초기화합니다.
export function clearApiAccessToken() {
  appAccessToken = null;
}

// 기능 : set Api Refresh Handler 값을 설정합니다.
export function setApiRefreshHandler(handler: ApiRefreshHandler | null) {
  apiRefreshHandler = handler;
}

// 기능 : api Client 기능을 수행합니다.
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

// 기능 : api Blob Client 기능을 수행합니다.
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

// 기능 : get Api Error Message 값을 조회합니다.
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

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "?붿껌??泥섎━?섏? 紐삵뻽?댁슂. ?ㅼ떆 ?쒕룄??二쇱꽭??";
}

// 湲곕뒫 : Backend safe failure ?묐떟??retryable 媛믪쓣 ?ъ슜???ъ떆??踰꾪듉 ?몄텧 湲곗??쇰줈 蹂?섑빀?덈떎.
// 기능 : is Api Error Retryable 여부를 판별합니다.
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

// 기능 : request 기능을 수행합니다.
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

// 기능 : handle Response 이벤트를 처리합니다.
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

// 기능 : handle Blob Response 이벤트를 처리합니다.
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

// 기능 : build Url 기능을 수행합니다.
function buildUrl(path: string) {
  const baseUrl = env.apiUrl.endsWith("/") ? env.apiUrl.slice(0, -1) : env.apiUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

// 기능 : get Request Body 값을 조회합니다.
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

// 기능 : is Body Init 여부를 판별합니다.
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

// 기능 : read Response Body 값을 읽습니다.
async function readResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

// 기능 : normalize Error 값을 내부 기준으로 정규화합니다.
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

// 기능 : parse Content Disposition File Name 값을 해석합니다.
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

// 기능 : get Nested Error 값을 조회합니다.
function getNestedError(value: unknown): unknown {
  if (!isRecord(value)) {
    return null;
  }

  return value.error;
}

// 기능 : get String Field 값을 조회합니다.
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

// 기능 : get Boolean Field 값을 조회합니다.
function getBooleanField(value: unknown, field: string): boolean | null {
  if (!isRecord(value)) {
    return null;
  }

  const fieldValue = value[field];

  return typeof fieldValue === "boolean" ? fieldValue : null;
}

// 기능 : is Record 여부를 판별합니다.
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
