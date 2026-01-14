"use dom";

import { getDOMComponents } from "@bacons/mdx";
import { Try } from "expo-router/build/views/Try";
import { Platform, ScrollView, Text, Pressable, View } from "react-native";

const tests = require.context("../supported", true, /\.mdx$/);

export default function DOMEntry(_: { dom: import("expo/dom").DOMProps }) {
  return (
    <View style={{ gap: 12 }}>
      {tests.keys().map((key) => {
        const Test = tests(key).default;
        return (
          <View key={key} style={{ borderWidth: 1, padding: 8, gap: 8 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>{key}</Text>
            <View style={{ borderWidth: 1 }}>
              <Try
                catch={(props) => {
                  return (
                    <Text style={{ color: "red" }}>
                      Failed to render test "{key}": {props.error.message}
                    </Text>
                  );
                }}
              >
                <Test components={getDOMComponents()} />
              </Try>
            </View>
          </View>
        );
      })}
    </View>
  );
}
