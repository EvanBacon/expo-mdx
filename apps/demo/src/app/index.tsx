import { Link } from "expo-router";
import { ScrollView } from "react-native";

export default function Index() {
  return (
    <ScrollView
      contentContainerStyle={{ padding: 24, gap: 8 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Link
        href="/local"
        style={{
          padding: 16,
          paddingRight: 40,
          borderRadius: 12,
          backgroundColor: "#0f3460",
          color: "#fff",
          fontWeight: "600",
          fontSize: 16,
          shadowColor: "#0f3460",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        Local MDX →
      </Link>
      <Link
        href="/dom"
        style={{
          padding: 16,
          paddingRight: 40,
          borderRadius: 12,
          backgroundColor: "#1a1a2e",
          color: "#fff",
          fontWeight: "600",
          fontSize: 16,
          shadowColor: "#1a1a2e",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        DOM Components →
      </Link>
      <Link
        href="/remote"
        style={{
          padding: 16,
          paddingRight: 40,
          borderRadius: 12,
          backgroundColor: "#16213e",
          color: "#fff",
          fontWeight: "600",
          fontSize: 16,
          shadowColor: "#16213e",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        Remote MDX →
      </Link>
    </ScrollView>
  );
}
