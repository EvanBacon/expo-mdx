import { MDXComponents, MDXStyles } from "@bacons/mdx";
import { Link } from "expo-router";
import { Platform, ScrollView, Text, View } from "react-native";

import Demo from "../tester.mdx";

export default function Index() {
  return (
    <ScrollView contentContainerStyle={{ padding: 24, gap: 8 }}>
      <Link
        href="/dom"
        style={{
          padding: 16,
          borderRadius: 8,
          backgroundColor: "#eee",
        }}
      >
        DOM Components
      </Link>
      <Link
        href="/remote"
        style={{
          padding: 16,
          borderRadius: 8,
          backgroundColor: "#eee",
        }}
      >
        Remote MDX
      </Link>

      <GitHubStyle>
        <MediumStyle>
          <Demo />
        </MediumStyle>
      </GitHubStyle>
    </ScrollView>
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
