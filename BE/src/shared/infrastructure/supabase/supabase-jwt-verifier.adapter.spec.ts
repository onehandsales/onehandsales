import { ConfigService } from "@nestjs/config";
import { SupabaseJwtVerifierAdapter } from "./supabase-jwt-verifier.adapter";

describe("SupabaseJwtVerifierAdapter", () => {
  it("normalizes Supabase custom LINE provider metadata to the app LINE provider", async () => {
    const adapter = new SupabaseJwtVerifierAdapter(
      new ConfigService({
        SUPABASE_JWT_ISSUER: "https://example.supabase.co/auth/v1",
      })
    );

    Object.defineProperty(adapter, "verifyJwt", {
      value: jest.fn().mockResolvedValue({
        sub: "supabase-user-1",
        email: "line-user@example.com",
        app_metadata: {
          provider: "custom:line",
        },
        user_metadata: {
          provider_id: "line-provider-user-1",
          name: "LINE User",
        },
      }),
    });

    await expect(adapter.verifyAccessToken("supabase-access-token")).resolves.toEqual({
      provider: "line",
      providerAccountId: "line-provider-user-1",
      authUserId: "supabase-user-1",
      email: "line-user@example.com",
      name: "LINE User",
    });
  });
});
