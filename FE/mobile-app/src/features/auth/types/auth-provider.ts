export type AuthProviderId = "google" | "line" | "apple";

export type AuthMode = "login" | "signup";

export type AuthProviderOption = {
  readonly id: AuthProviderId;
  readonly label: string;
  readonly accessibilityLabel: string;
  readonly logo: import("react-native").ImageSourcePropType;
  readonly logoSize: number;
};
