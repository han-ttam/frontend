import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import { useAuth } from "@/stores/authStore";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 파괴적인(되돌리기 어려운) 동작은 붉은색으로 구분한다. colors 팔레트엔
// 아직 위험색이 없어 로그인 화면의 에러색과 같은 값을 재사용한다.
const dangerColor = "#FF8080";

type SettingsModalProps = {
  visible: boolean;
  onClose: () => void;
};

type SettingsRowProps = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  // 아직 화면이 없는 항목은 눌러도 동작하지 않고 "준비 중" 배지를 보여준다.
  comingSoon?: boolean;
  destructive?: boolean;
  busy?: boolean;
  onPress?: () => void;
};

const SettingsRow = ({
  icon,
  label,
  comingSoon = false,
  destructive = false,
  busy = false,
  onPress,
}: SettingsRowProps) => {
  const tint = destructive ? dangerColor : colors.foreground;
  const disabled = comingSoon || busy;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      className={[
        "flex-row items-center gap-3 rounded-2xl px-3 py-4",
        disabled ? "opacity-50" : "active:bg-background",
      ].join(" ")}
      disabled={disabled}
      onPress={onPress}
    >
      <View className="h-9 w-9 items-center justify-center rounded-full bg-background">
        <Feather name={icon} size={18} color={tint} />
      </View>
      <AppText size={15} style={{ color: tint, flex: 1, fontWeight: "600" }}>
        {label}
      </AppText>
      {busy ? (
        <ActivityIndicator color={tint} />
      ) : comingSoon ? (
        <View className="rounded-full bg-background px-2.5 py-1">
          <AppText color="muted" size={11} style={{ fontWeight: "600" }}>
            준비 중
          </AppText>
        </View>
      ) : (
        <Feather name="chevron-right" size={18} color={colors.muted} />
      )}
    </Pressable>
  );
};

export const SettingsModal = ({ visible, onClose }: SettingsModalProps) => {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, signOut, withdraw } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleSignOut = () => {
    Alert.alert("로그아웃", "정말 로그아웃 할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          setIsSigningOut(true);
          // signOut 은 기기 토큰을 먼저 지우고 서버 로그아웃 실패는 삼키므로
          // 여기서 예외를 걱정하지 않아도 된다. 끝나면 로그인 화면으로 보낸다.
          await signOut();
          onClose();
          router.replace("/login");
        },
      },
    ]);
  };

  const handleSignIn = () => {
    onClose();
    router.push("/login");
  };

  const handleWithdraw = () => {
    Alert.alert(
      "회원 탈퇴",
      "탈퇴하면 방문·찜·평점·뱃지 등 활동 기록이 모두 삭제되고 되돌릴 수 없어요. 정말 탈퇴할까요?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "탈퇴하기",
          style: "destructive",
          onPress: async () => {
            setIsWithdrawing(true);
            try {
              // withdraw 는 서버 탈퇴가 성공했을 때만 로컬 토큰을 지운다.
              await withdraw();
              onClose();
              router.replace("/login");
            } catch {
              // 멱등이라 재시도가 안전하므로, 세션을 유지한 채 다시 시도하게 한다.
              setIsWithdrawing(false);
              Alert.alert(
                "탈퇴 실패",
                "잠시 후 다시 시도해 주세요. 문제가 계속되면 고객센터로 문의해 주세요.",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <Pressable className="flex-1 justify-end bg-black/60" onPress={onClose}>
        {/* 시트 내부를 눌렀을 때 바깥 오버레이의 onPress(닫기)로 전파되지 않게 막는다. */}
        <Pressable
          className="rounded-t-3xl bg-surface px-5 pt-3"
          style={{ paddingBottom: insets.bottom + 16 }}
          onPress={(event) => event.stopPropagation()}
        >
          <View className="mb-2 items-center">
            <View className="h-1 w-10 rounded-full bg-foreground/20" />
          </View>

          <View className="mb-2 flex-row items-center justify-between">
            <AppText variant="subtitle">설정</AppText>
            <Pressable
              accessibilityLabel="설정 닫기"
              accessibilityRole="button"
              className="h-9 w-9 items-center justify-center rounded-full bg-background"
              onPress={onClose}
            >
              <Feather name="x" size={18} color={colors.foreground} />
            </Pressable>
          </View>

          <SettingsRow icon="bell" label="고지사항" comingSoon />
          <SettingsRow icon="moon" label="테마 설정" comingSoon />
          <SettingsRow icon="globe" label="언어 설정" comingSoon />

          <View className="my-1 h-px bg-foreground/10" />

          {isAuthenticated ? (
            <SettingsRow
              icon="log-out"
              label="로그아웃"
              busy={isSigningOut}
              onPress={handleSignOut}
            />
          ) : (
            <SettingsRow
              icon="log-in"
              label="로그인하기"
              onPress={handleSignIn}
            />
          )}
          {isAuthenticated ? (
            <SettingsRow
              icon="user-x"
              label="회원 탈퇴"
              destructive
              busy={isWithdrawing}
              onPress={handleWithdraw}
            />
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
};
