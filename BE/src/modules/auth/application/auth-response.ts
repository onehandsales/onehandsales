import type {
  AuthDeviceRecord,
  AuthMeRecord,
} from "@/modules/auth/application/ports/auth.repository";

export interface AuthTokenResponse {
  readonly accessToken: string;
  readonly accessTokenExpiresAt: string;
  readonly refreshToken: null;
  readonly user: MeResponse;
  readonly device?: {
    readonly id: string;
    readonly slot: string;
    readonly label: string | null;
  };
}

export interface MeResponse {
  readonly id: string;
  readonly supabaseUserId: string | null;
  readonly name: string | null;
  readonly email: string | null;
  readonly role: string;
  readonly status: string;
  readonly settings: {
    readonly sensitiveWarningEnabled: boolean;
    readonly defaultReminderMinutes: number;
    readonly emailNotificationEnabled: boolean;
    readonly browserPushEnabled: boolean;
  };
}

export interface AdminMeResponse {
  readonly id: string;
  readonly supabaseUserId: string | null;
  readonly name: string | null;
  readonly email: string | null;
  readonly role: "ADMIN";
}

export function createAuthTokenResponse(input: {
  readonly accessToken: string;
  readonly accessTokenExpiresAt: Date;
  readonly user: AuthMeRecord;
  readonly device?: AuthDeviceRecord;
}): AuthTokenResponse {
  const response: AuthTokenResponse = {
    accessToken: input.accessToken,
    accessTokenExpiresAt: input.accessTokenExpiresAt.toISOString(),
    refreshToken: null,
    user: toMeResponse(input.user),
  };

  if (!input.device) {
    return response;
  }

  return {
    ...response,
    device: {
      id: input.device.id,
      slot: input.device.slot,
      label: input.device.label,
    },
  };
}

export function toMeResponse(user: AuthMeRecord): MeResponse {
  return {
    id: user.id,
    supabaseUserId: user.supabaseUserId,
    name: user.displayName,
    email: user.email,
    role: user.role,
    status: user.status,
    settings: user.settings,
  };
}

export function toAdminMeResponse(user: AuthMeRecord): AdminMeResponse {
  return {
    id: user.id,
    supabaseUserId: user.supabaseUserId,
    name: user.displayName,
    email: user.email,
    role: "ADMIN",
  };
}
