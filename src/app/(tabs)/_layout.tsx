import { colors } from "@/constants/colors";
import { Entypo, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        sceneStyle: {
          backgroundColor: colors.background,
        },
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelPosition: "below-icon",
        tabBarStyle: {
          height: 80,
          paddingTop: 10,
          backgroundColor: colors.surface,
          borderTopWidth: 0,
        },

        tabBarLabelStyle: {
          fontSize: 14,
        },
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: "지도",
          tabBarIcon: ({ color }) => (
            <Entypo name="map" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: "도감",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="book-open-blank-variant-outline"
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="photo"
        options={{
          title: "인증",
          tabBarIcon: ({ color }) => (
            <Entypo name="camera" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: "내 정보",
          tabBarIcon: ({ color }) => (
            <Feather name="smile" size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
