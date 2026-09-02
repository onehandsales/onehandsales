import appleLogo from "../../../../assets/auth/apple-logo.png";
import googleLogo from "../../../../assets/auth/google-logo.png";
import lineLogo from "../../../../assets/auth/line-logo.png";
import type { AuthProviderOption } from "../types/auth-provider";

export const authProviders: readonly AuthProviderOption[] = [
  {
    id: "google",
    label: "Google",
    accessibilityLabel: "Google로 계속하기",
    logo: googleLogo,
    logoSize: 28,
  },
  {
    id: "line",
    label: "LINE",
    accessibilityLabel: "LINE으로 계속하기",
    logo: lineLogo,
    logoSize: 30,
  },
  {
    id: "apple",
    label: "Apple",
    accessibilityLabel: "Apple로 계속하기",
    logo: appleLogo,
    logoSize: 30,
  },
];
