import GoogleLogo from "@/assets/icons/google.svg";
import KakaoLogo from "@/assets/icons/kakao.svg";
import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import { AgreementModal } from "@/features/auth/components/AgreementModal";
import { useSocialLogin } from "@/features/auth/useSocialLogin";
import { type AgreementType } from "@/lib/api/agreements";
import type { OAuthProvider } from "@/lib/api/auth";
import { useAuth } from "@/stores/authStore";
import { Entypo } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

const heroImage = require("../../../assets/images/login-hero.jpg");

const HERO_FADE_HEIGHT = 140;

const agreementLinkStyle = {
  color: colors.primary,
  fontWeight: "600",
} as const;

// The hero photo runs under the copy, so fade its bottom edge into the page
// background instead of cutting it off with a hard line.
const HeroFade = () => {
  return (
    <View
      className="absolute inset-x-0 bottom-0"
      style={{ height: HERO_FADE_HEIGHT }}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="heroFade" x1="0" y1="0" x2="0" y2="1">
            <Stop
              offset="0"
              stopColor={colors.background}
              stopOpacity="0"
            />
            <Stop
              offset="1"
              stopColor={colors.background}
              stopOpacity="1"
            />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#heroFade)" />
      </Svg>
    </View>
  );
};

type SocialButtonProps = {
  provider: OAuthProvider;
  label: string;
  isPending: boolean;
  isDisabled: boolean;
  onPress: (provider: OAuthProvider) => void;
};

const SocialButton = ({
  provider,
  label,
  isPending,
  isDisabled,
  onPress,
}: SocialButtonProps) => {
  const isKakao = provider === "kakao";
  const labelColor = isKakao ? colors["kakao-foreground"] : colors.foreground;

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ busy: isPending, disabled: isDisabled }}
      className={[
        "h-14 flex-row items-center justify-center gap-2 rounded-xl",
        isKakao ? "bg-kakao" : "border border-white/10 bg-surface",
        isDisabled ? "opacity-60" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={isDisabled}
      onPress={() => onPress(provider)}
    >
      {isPending ? (
        <ActivityIndicator color={labelColor} />
      ) : (
        <>
          {isKakao ? (
            <KakaoLogo width={20} height={20} />
          ) : (
            <GoogleLogo width={20} height={20} />
          )}
          <AppText size={16} style={{ color: labelColor, fontWeight: "700" }}>
            {label}
          </AppText>
        </>
      )}
    </Pressable>
  );
};

type LoginPageProps = {
  onLoggedIn: () => void;
  onSkip: () => void;
};

export default function LoginPage({ onLoggedIn, onSkip }: LoginPageProps) {
  const insets = useSafeAreaInsets();
  const { skipLogin } = useAuth();
  const { login, pendingProvider, error } = useSocialLogin(onLoggedIn);
  const [openAgreement, setOpenAgreement] = useState<AgreementType>();

  const isPending = pendingProvider !== undefined;

  const handleSkip = async () => {
    await skipLogin();
    onSkip();
  };

  return (
    <View className="flex-1 bg-background">
      <View className="h-[45%] w-full">
        <Image
          source={heroImage}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
        />
        <HeroFade />
      </View>

      <Pressable
        accessibilityLabel="로그인 건너뛰기"
        accessibilityRole="button"
        className="rounded-full bg-black/35 px-3 py-2"
        onPress={handleSkip}
        style={{ position: "absolute", top: insets.top + 8, right: 16 }}
      >
        <AppText size={13} style={{ fontWeight: "600" }}>
          건너뛰기
        </AppText>
      </Pressable>

      <View className="flex-1 justify-between px-6 pb-10">
        <View>
          <Entypo name="location-pin" size={34} color={colors.primary} />
          <View className="mt-1 flex-row">
            <AppText variant="display">여행</AppText>
            <AppText variant="display" color="primary">
              수집가
            </AppText>
          </View>
          <AppText className="mt-4" variant="title" size={22}>
            여행의 순간을 수집하세요
          </AppText>
          <AppText color="muted" className="mt-3" style={{ lineHeight: 22 }}>
            방문한 장소를 인증하고{"\n"}나만의 여행 도감을 완성해보세요.
          </AppText>
        </View>

        <View className="gap-3">
          {error ? (
            <AppText
              color="muted"
              size={13}
              style={{ color: "#FF8080", textAlign: "center" }}
            >
              {error.message}
            </AppText>
          ) : null}

          <SocialButton
            provider="kakao"
            label="카카오로 계속하기"
            isPending={pendingProvider === "kakao"}
            isDisabled={isPending}
            onPress={login}
          />
          <SocialButton
            provider="google"
            label="Google로 계속하기"
            isPending={pendingProvider === "google"}
            isDisabled={isPending}
            onPress={login}
          />

          <AppText
            className="mt-2"
            color="muted"
            size={12}
            style={{ lineHeight: 18, textAlign: "center" }}
          >
            계속하면{" "}
            <Text
              accessibilityRole="link"
              onPress={() => setOpenAgreement("TOS")}
              style={agreementLinkStyle}
            >
              서비스 이용약관
            </Text>
            {" 및 "}
            <Text
              accessibilityRole="link"
              onPress={() => setOpenAgreement("PRIVACY")}
              style={agreementLinkStyle}
            >
              개인정보 처리방침
            </Text>
            에 동의하게 됩니다.
          </AppText>
        </View>
      </View>

      <AgreementModal
        type={openAgreement}
        onClose={() => setOpenAgreement(undefined)}
      />
    </View>
  );
}
