import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import { Entypo } from "@expo/vector-icons";
import { Modal, Pressable, View } from "react-native";

type TravelProofConsentModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const TravelProofConsentModal = ({
  visible,
  onClose,
  onConfirm,
}: TravelProofConsentModalProps) => {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/70">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="동의서 닫기"
          className="flex-1"
          onPress={onClose}
        />

        <View className="gap-5 rounded-t-[28px] border border-foreground/10 bg-background px-5 pb-8 pt-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1 gap-1">
              <AppText variant="title">여행 인증 전 확인해주세요</AppText>
              <AppText color="muted">
                위치와 사진을 기반으로 여행 기록을 남기기 위한 안내입니다.
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="동의서 닫기"
              className="h-10 w-10 items-center justify-center rounded-full bg-surface"
              onPress={onClose}
            >
              <Entypo name="cross" size={22} color={colors.foreground} />
            </Pressable>
          </View>

          <View className="gap-3">
            <View className="flex-row gap-3 rounded-lg bg-surface p-3">
              <Entypo name="location-pin" size={22} color={colors.primary} />
              <View className="flex-1 gap-1">
                <AppText className="font-bold">위치 정보 사용</AppText>
                <AppText color="muted">
                  현재 위치가 선택한 여행지 근처인지 확인하는 데 사용됩니다.
                </AppText>
              </View>
            </View>

            <View className="flex-row gap-3 rounded-lg bg-surface p-3">
              <Entypo name="camera" size={22} color={colors.primary} />
              <View className="flex-1 gap-1">
                <AppText className="font-bold">사진 인증 저장</AppText>
                <AppText color="muted">
                  촬영한 사진은 여행 인증과 수집 현황 표시에 사용됩니다.
                </AppText>
              </View>
            </View>

            <View className="flex-row gap-3 rounded-lg bg-surface p-3">
              <Entypo name="lock" size={22} color={colors.primary} />
              <View className="flex-1 gap-1">
                <AppText className="font-bold">개인정보 보호</AppText>
                <AppText color="muted">
                  인증 정보는 동의한 목적 외에는 사용하지 않는다는 내용을
                  고지합니다.
                </AppText>
              </View>
            </View>
          </View>

          <View className="flex-row gap-3">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="나중에 하기"
              className="h-14 flex-1 items-center justify-center rounded-xl border border-foreground/10 bg-surface"
              onPress={onClose}
            >
              <AppText color="muted" className="font-bold">
                나중에
              </AppText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="동의하고 계속하기"
              className="h-14 flex-[1.4] items-center justify-center rounded-xl bg-primary"
              onPress={onConfirm}
            >
              <AppText className="font-bold">동의하고 계속</AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
