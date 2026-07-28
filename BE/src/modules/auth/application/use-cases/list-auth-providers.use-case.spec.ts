import { ListAuthProvidersUseCase } from "./list-auth-providers.use-case";

// 기능 : 인증 제공자 목록이 G08 공개 로그인 순서와 제공자 집합을 유지하는지 검증합니다.
describe("ListAuthProvidersUseCase", () => {
  it("returns Google, LINE, and Apple in display order", () => {
    const useCase = new ListAuthProvidersUseCase();

    expect(useCase.execute()).toEqual({
      providers: [
        {
          provider: "google",
          label: "Google",
          enabled: true,
          status: "enabled",
          displayOrder: 1,
        },
        {
          provider: "line",
          label: "LINE",
          enabled: true,
          status: "enabled",
          displayOrder: 2,
        },
        {
          provider: "apple",
          label: "Apple",
          enabled: true,
          status: "enabled",
          displayOrder: 3,
        },
      ],
    });
  });
});
