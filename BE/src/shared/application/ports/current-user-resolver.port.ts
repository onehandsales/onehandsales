import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

export const CURRENT_USER_RESOLVER = Symbol("CURRENT_USER_RESOLVER");

export interface CurrentUserResolver {
  resolveFromAccessToken(accessToken: string): Promise<CurrentUserContext>;
}

