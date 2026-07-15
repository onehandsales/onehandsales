import { Injectable } from "@nestjs/common";

// 역할 : AuthProviderResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface AuthProviderResponse {
  readonly provider: "google";
  readonly label: string;
  readonly enabled: boolean;
  readonly status: "enabled";
  readonly displayOrder: number;
}

// 역할 : ListAuthProvidersUseCase 유스케이스의 application orchestration을 담당합니다.
@Injectable()
export class ListAuthProvidersUseCase {
  // 기능 : 클라이언트에서 사용할 OAuth 제공자 목록과 노출 상태를 반환합니다.
  execute(): { providers: AuthProviderResponse[] } {
    // 1. 클라이언트가 노출할 인증 제공자 설정을 반환한다.
    return {
      providers: [
        {
          provider: "google",
          label: "Google",
          enabled: true,
          status: "enabled",
          displayOrder: 1,
        },
      ],
    };
  }
}

