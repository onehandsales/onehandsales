import { Injectable } from "@nestjs/common";

export interface AuthProviderResponse {
  readonly provider: "kakao" | "google" | "naver" | "apple";
  readonly label: string;
  readonly enabled: boolean;
  readonly status: "enabled" | "planned" | "disabled";
  readonly displayOrder: number;
}

@Injectable()
export class ListAuthProvidersUseCase {
  execute(): { providers: AuthProviderResponse[] } {
    return {
      providers: [
        {
          provider: "kakao",
          label: "카카오",
          enabled: true,
          status: "enabled",
          displayOrder: 1,
        },
        {
          provider: "naver",
          label: "네이버",
          enabled: true,
          status: "enabled",
          displayOrder: 2,
        },
        {
          provider: "google",
          label: "Google",
          enabled: true,
          status: "enabled",
          displayOrder: 3,
        },
        {
          provider: "apple",
          label: "Apple",
          enabled: false,
          status: "planned",
          displayOrder: 4,
        },
      ],
    };
  }
}

