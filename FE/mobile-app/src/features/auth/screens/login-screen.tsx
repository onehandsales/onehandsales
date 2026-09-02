import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import logoMark from "../../../../assets/brand/logo-mark.png";
import { authProviders } from "../constants/auth-providers";
import type { AuthMode, AuthProviderId } from "../types/auth-provider";

type LoginScreenProps = {
  readonly authError: string | null;
  readonly mode: AuthMode;
  readonly pendingProvider: AuthProviderId | null;
  readonly onModeChange: (mode: AuthMode) => void;
  readonly onProviderPress: (provider: AuthProviderId) => void;
};

const loginCopy: Record<
  AuthMode,
  {
    readonly subtitle: string;
    readonly providerLead: string;
    readonly switchLead: string;
    readonly switchAction: string;
    readonly switchMode: AuthMode;
  }
> = {
  login: {
    subtitle: "OneHand 계정에 로그인",
    providerLead: "다음으로 계속하기",
    switchLead: "신규 사용자이신가요?",
    switchAction: "가입하기",
    switchMode: "signup",
  },
  signup: {
    subtitle: "OneHand 계정 만들기",
    providerLead: "또는 다음으로 계속하기",
    switchLead: "기존 사용자이신가요?",
    switchAction: "로그인하기",
    switchMode: "login",
  },
};

export function LoginScreen({
  authError,
  mode,
  pendingProvider,
  onModeChange,
  onProviderPress,
}: LoginScreenProps) {
  const copy = loginCopy[mode];
  const isPending = pendingProvider !== null;

  if (isPending) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingScreen}>
          <ActivityIndicator
            accessibilityLabel="로그인하고 있어요."
            color="#2383e2"
            size="large"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        <View style={styles.content}>
          <View style={styles.titleBlock}>
            <Image
              accessibilityIgnoresInvertColors
              accessibilityLabel="OneHand"
              resizeMode="contain"
              source={logoMark}
              style={styles.logo}
            />
            <Text style={styles.title}>나만의 AI 워크스페이스</Text>
            <Text style={styles.subtitle}>{copy.subtitle}</Text>
          </View>

          <View style={styles.separatorRow}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>{copy.providerLead}</Text>
            <View style={styles.separatorLine} />
          </View>

          <View style={styles.providerRow}>
            {authProviders.map((provider) => (
              <Pressable
                accessibilityLabel={provider.accessibilityLabel}
                key={provider.id}
                onPress={() => onProviderPress(provider.id)}
                style={({ pressed }) => [
                  styles.providerButton,
                  pressed ? styles.providerButtonPressed : null,
                ]}
              >
                <Image
                  accessibilityIgnoresInvertColors
                  resizeMode="contain"
                  source={provider.logo}
                  style={{
                    height: provider.logoSize,
                    width: provider.logoSize,
                  }}
                />
                <Text numberOfLines={1} style={styles.providerLabel}>
                  {provider.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {authError ? (
            <View accessibilityRole="alert" style={styles.errorBox}>
              <Text style={styles.errorText}>
                로그인을 완료하지 못했어요. {authError}
              </Text>
            </View>
          ) : null}

          <Text style={styles.switchText}>
            {copy.switchLead}{" "}
            <Text
              onPress={() => onModeChange(copy.switchMode)}
              style={styles.inlineLink}
            >
              {copy.switchAction}
            </Text>
          </Text>

          <Text style={styles.termsText}>
            계속 진행시 <Text style={styles.termsLink}>이용약관</Text>과{" "}
            <Text style={styles.termsLink}>개인정보 처리방침</Text>에 동의한
            것으로 간주해요.
          </Text>
        </View>
      </ScrollView>

      <View pointerEvents="box-none" style={styles.languageBar}>
        <Pressable accessibilityLabel="지역: 한국" style={styles.languageButton}>
          <GlobeIcon />
          <Text style={styles.languageText}>지역: 한국</Text>
          <Text style={styles.chevron}>⌄</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function GlobeIcon() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={styles.globe}
    >
      <View style={styles.globeHorizontal} />
      <View style={styles.globeVertical} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#ffffff",
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 96,
    paddingHorizontal: 20,
    paddingTop: 96,
  },
  loadingScreen: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  content: {
    alignSelf: "center",
    maxWidth: 360,
    width: "100%",
  },
  titleBlock: {
    alignItems: "center",
  },
  logo: {
    height: 36,
    marginBottom: 24,
    width: 36,
  },
  title: {
    color: "#050505",
    fontSize: 24,
    fontWeight: "400",
    lineHeight: 27,
    textAlign: "center",
  },
  subtitle: {
    color: "#8f8f8b",
    fontSize: 23,
    fontWeight: "400",
    lineHeight: 27,
    marginTop: 4,
    textAlign: "center",
  },
  separatorRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginTop: 32,
  },
  separatorLine: {
    backgroundColor: "#e9e9e7",
    flex: 1,
    height: 1,
  },
  separatorText: {
    color: "#8f8f8b",
    fontSize: 14,
    fontWeight: "400",
  },
  providerRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 32,
  },
  providerButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#dededa",
    borderRadius: 7,
    borderWidth: 1,
    flex: 1,
    height: 74,
    justifyContent: "center",
    minWidth: 0,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  providerButtonPressed: {
    backgroundColor: "#f7f7f5",
  },
  providerLabel: {
    color: "#191919",
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 16,
    marginTop: 7,
    maxWidth: "100%",
    textAlign: "center",
  },
  errorBox: {
    backgroundColor: "#fff4f4",
    borderColor: "#f1b6b6",
    borderRadius: 7,
    borderWidth: 1,
    marginTop: 18,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  errorText: {
    color: "#a12b2b",
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 18,
    textAlign: "center",
  },
  switchText: {
    color: "#777770",
    fontSize: 15,
    fontWeight: "400",
    lineHeight: 20,
    marginTop: 32,
    textAlign: "center",
  },
  inlineLink: {
    color: "#4f4f4b",
    textDecorationLine: "underline",
  },
  termsText: {
    alignSelf: "center",
    color: "#8f8f8b",
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 20,
    marginTop: 28,
    maxWidth: 300,
    textAlign: "center",
  },
  termsLink: {
    color: "#777770",
    textDecorationLine: "underline",
  },
  languageBar: {
    alignItems: "center",
    bottom: 24,
    left: 0,
    position: "absolute",
    right: 0,
  },
  languageButton: {
    alignItems: "center",
    borderRadius: 6,
    flexDirection: "row",
    gap: 6,
    minHeight: 32,
    paddingHorizontal: 8,
  },
  languageText: {
    color: "#777770",
    fontSize: 14,
    fontWeight: "400",
  },
  chevron: {
    color: "#777770",
    fontSize: 15,
    lineHeight: 17,
    marginTop: -2,
  },
  globe: {
    borderColor: "#777770",
    borderRadius: 7,
    borderWidth: 1.4,
    height: 14,
    overflow: "hidden",
    position: "relative",
    width: 14,
  },
  globeHorizontal: {
    backgroundColor: "#777770",
    height: 1.2,
    left: 1,
    position: "absolute",
    right: 1,
    top: 6,
  },
  globeVertical: {
    backgroundColor: "#777770",
    bottom: 1,
    left: 6,
    position: "absolute",
    top: 1,
    width: 1.2,
  },
});
