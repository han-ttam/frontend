import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-3xl font-bold text-slate-900">Handdam</Text>
        <Text className="mt-2 text-center text-base text-slate-500">
          Start building your app in src/app.
        </Text>
      </View>
    </SafeAreaView>
  );
}
