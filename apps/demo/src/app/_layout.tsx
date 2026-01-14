import { Stack } from "expo-router";

export const unstable_settings = {
  anchor: "index",
};

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        contentStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "MDX Demo" }} />
      <Stack.Screen name="remote" options={{ title: "Remote MDX" }} />
    </Stack>
  );
}
