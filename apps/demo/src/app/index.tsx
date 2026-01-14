import { MDXComponents, getDOMComponents, MDXStyles } from "@bacons/mdx";
import { Link } from "expo-router";
import { Try } from "expo-router/build/views/Try";
import { Platform, ScrollView, Text, Pressable, View } from "react-native";

import Demo from "../tester.mdx";

const tests = require.context("../supported", true, /\.mdx$/);

export default function Index() {
  return (
    <ScrollView contentContainerStyle={{ padding: 24 }}>
      <Link href="/remote" asChild>
        <Pressable
          style={{
            backgroundColor: "#007AFF",
            padding: 16,
            borderRadius: 8,
            marginBottom: 24,
          }}
        >
          <Text
            style={{ color: "white", fontWeight: "bold", textAlign: "center" }}
          >
            Test Remote MDX
          </Text>
        </Pressable>
      </Link>

      <RenderTests />

      <GitHubStyle>
        <MediumStyle>
          <Demo />
        </MediumStyle>
      </GitHubStyle>
    </ScrollView>
  );
}

function RenderTests() {
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

function GitHubStyle({ children }: { children: React.ReactNode }) {
  return (
    <MDXStyles
      th={{
        paddingVertical: 6,
        paddingHorizontal: 13,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "#30363d",
      }}
    >
      {children}
    </MDXStyles>
  );
}

function MediumStyle({ children }: { children: React.ReactNode }) {
  return (
    <MDXStyles
      h1={{
        fontSize: 32,
      }}
      h2={{
        marginTop: 16,
        fontSize: 22,
        marginBottom: 0,
      }}
      code={{
        borderRadius: 2,
        backgroundColor: "#f2f2f2",
        padding: 20,
        fontSize: 16,
      }}
      inlineCode={{
        borderRadius: 2,
        fontSize: 15,
        backgroundColor: "#f2f2f2",
        paddingVertical: 2,
        paddingHorizontal: 4,
      }}
      p={{
        fontSize: Platform.select({
          web: "1rem",
          default: 16,
        }),
        marginBottom: Platform.select({
          web: "1.25em",
          default: 16,
        }),
      }}
      blockquote={{
        borderLeftWidth: 3,
        fontSize: 21,
        borderLeftColor: "#292929",
        paddingLeft: 23,
      }}
      img={{
        width: "100%",
        minWidth: "100%",
        height: 180,
      }}
      a={{
        textDecorationLine: "underline",
      }}
      hr={{
        paddingBottom: 10,
        marginBottom: 14,
        marginTop: 32,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 24,
      }}
    >
      <MDXComponents
        components={{
          Bacon: (props) => <Text {...props} style={{ color: "blue" }} />,
        }}
        hr={({ style }) => (
          <View style={style}>
            {["", "", ""].map((v, i) => (
              <View
                key={String(i)}
                style={{
                  marginRight: i !== 2 ? 20 : 0,
                  width: 3,
                  height: 3,
                  borderRadius: 1.5,
                  backgroundColor: "black",
                }}
              />
            ))}
          </View>
        )}
      >
        {children}
      </MDXComponents>
    </MDXStyles>
  );
}
