import Demo from "./demo.mdx";
import { ScrollView, SafeAreaView } from "react-native";

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <Demo />
      </ScrollView>
    </SafeAreaView>
  );
}
