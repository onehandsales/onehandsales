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
  // 1. 이후 단계에서 사용할 headers 값을 준비한다.
  const headers = new Headers(options.headers);
  // 2. 현재 단계에서 필요한 동작을 실행한다.
  headers.set("Content-Type", "application/json");

  // 3. 이후 단계에서 사용할 accessToken 값을 준비한다.
  const accessToken = options.accessToken ?? adminAccessToken;

  // 4. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  // 5. 비동기 결과를 받아 response에 저장한다.
  const response = await fetch(`${env.apiUrl}/admin/api${path}`, {
    ...options,
    headers,
  });

  // 6. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (!response.ok) {
    throw new Error(`Admin API request failed: ${response.status}`);
  }

  // 7. 계산된 결과를 호출자에게 반환한다.
  return response.json() as Promise<TResponse>;
}
