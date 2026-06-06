export const USER_REPOSITORY = Symbol("USER_REPOSITORY");

export interface UserSettingRecord {
  readonly sensitiveWarningEnabled: boolean;
  readonly defaultReminderMinutes: number;
  readonly emailNotificationEnabled: boolean;
  readonly browserPushEnabled: boolean;
}

export interface UpdateUserSettingInput {
  readonly sensitiveWarningEnabled?: boolean;
  readonly defaultReminderMinutes?: number;
  readonly emailNotificationEnabled?: boolean;
  readonly browserPushEnabled?: boolean;
}

export interface DeletedUserRecord {
  readonly id: string;
  readonly status: "DELETED";
  readonly deletedAt: Date;
  readonly permanentDeleteAt: Date;
}

export interface UserRepository {
  getOrCreateSetting(userId: string): Promise<UserSettingRecord>;
  updateSetting(
    userId: string,
    input: UpdateUserSettingInput
  ): Promise<UserSettingRecord>;
  softDeleteUserAndRevokeSessions(
    userId: string,
    now: Date,
    permanentDeleteAt: Date
  ): Promise<DeletedUserRecord>;
}

