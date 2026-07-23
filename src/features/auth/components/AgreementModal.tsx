import { AppText } from "@/components/AppText";
import { colors } from "@/constants/colors";
import { agreementLabels, type AgreementType } from "@/lib/api/agreements";
import { Entypo } from "@expo/vector-icons";
import { ActivityIndicator, Modal, Pressable, ScrollView, View } from "react-native";
import { useAgreement } from "../useAgreement";

type AgreementModalProps = {
  type?: AgreementType;
  onClose: () => void;
};

export const AgreementModal = ({ type, onClose }: AgreementModalProps) => {
  const { data, error, isLoading } = useAgreement(type);

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={type !== undefined}
    >
      <View className="flex-1 justify-end bg-black/60">
        <View className="h-[75%] rounded-t-3xl bg-surface px-5 pb-8 pt-5">
          <View className="mb-4 flex-row items-center justify-between">
            <AppText variant="subtitle">
              {data?.title ?? (type ? agreementLabels[type] : "")}
            </AppText>
            <Pressable
              accessibilityLabel="약관 닫기"
              accessibilityRole="button"
              className="h-9 w-9 items-center justify-center rounded-full bg-background"
              onPress={onClose}
            >
              <Entypo name="cross" size={18} color={colors.foreground} />
            </Pressable>
          </View>

          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null}

          {error ? (
            <View className="flex-1 items-center justify-center px-4">
              <AppText color="muted" style={{ textAlign: "center" }}>
                약관을 불러오지 못했어요.{"\n"}
                {error.message}
              </AppText>
            </View>
          ) : null}

          {data ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <AppText color="muted" style={{ lineHeight: 22 }}>
                {data.body}
              </AppText>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};
