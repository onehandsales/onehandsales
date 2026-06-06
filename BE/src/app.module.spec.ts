import { Test } from "@nestjs/testing";

jest.mock("jose", () => {
  class FakeSignJWT {
    setProtectedHeader(): this {
      return this;
    }

    setSubject(): this {
      return this;
    }

    setIssuer(): this {
      return this;
    }

    setAudience(): this {
      return this;
    }

    setIssuedAt(): this {
      return this;
    }

    setExpirationTime(): this {
      return this;
    }

    async sign(): Promise<string> {
      return "mock-token";
    }
  }

  return {
    SignJWT: FakeSignJWT,
    createRemoteJWKSet: jest.fn(() => jest.fn()),
    jwtVerify: jest.fn(),
  };
});

describe("AppModule", () => {
  it("compiles the Nest module graph", async () => {
    const { AppModule } = await import("./app.module");
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(moduleRef).toBeDefined();

    await moduleRef.close();
  });
});
