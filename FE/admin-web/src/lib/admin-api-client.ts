import { env } from "@/lib/env";

type AdminApiClientOptions = RequestInit & {
  accessToken?: string | null;
};

let adminAccessToken: string | null = null;

// 기능 : set Admin Api Access Token 값을 설정합니다.
export function setAdminApiAccessToken(accessToken: string | null) {
  adminAccessToken = accessToken;
}

// 기능 : clear Admin Api Access Token 상태를 초기화합니다.
export function clearAdminApiAccessToken() {
  adminAccessToken = null;
}

// 기능 : admin Api Client 기능을 수행합니다.
export async function adminApiClient<TResponse>(
  path: string,
  options: AdminApiClientOptions = {}
): Promise<TResponse> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  const accessToken = options.accessToken ?? adminAccessToken;

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${env.apiUrl}/admin/api${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Admin API request failed: ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}
