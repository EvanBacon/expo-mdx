import Demo from "./demo.mdx";
import { ScrollView, ActivityIndicator, SafeAreaView } from "react-native";
import { MDXStyles, MDXComponents } from "@bacons/mdx";
import { View } from "@bacons/react-views";
export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <GitHubStyle>
          <MediumStyle>
            <Demo />
          </MediumStyle>
        </GitHubStyle>
      </ScrollView>
    </SafeAreaView>
  );
}

function GitHubStyle({ children }) {
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

function MediumStyle({ children }) {
  return (
    <MDXStyles
      h1={{
        //   fontFamily: "Inter_900Black",
        fontSize: 32,
      }}
      h2={{
        //   fontFamily: "Inter_900Black",
        marginTop: 16,
        fontSize: 22,
        marginBottom: 0,
      }}
      code={{
        //   fontFamily: "SourceCodePro_400Regular",
        borderRadius: 2,
        backgroundColor: "#f2f2f2",
        padding: 20,
        fontSize: 16,
      }}
      inlineCode={{
        //   fontFamily: "SourceCodePro_400Regular",
        borderRadius: 2,
        fontSize: 15,
        backgroundColor: "#f2f2f2",
        paddingVertical: 2,
        paddingHorizontal: 4,
      }}
      p={{
        //   fontFamily: "Inter_400Regular",
        lineHeight: 30,
        fontSize: 20,
        marginBottom: 8,
      }}
      blockquote={{
        //   fontFamily: "Inter_400Regular",
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
        //   fontFamily: "Inter_400Regular",
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
