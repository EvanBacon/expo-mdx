import { RemoteMDX, useMDXFetch, MDXComponents, MDXStyles } from "@bacons/mdx";
import { useState, useCallback } from "react";
import {
  Platform,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  Pressable,
  RefreshControl,
} from "react-native";

export default function RemoteMDXPage() {
  const { content, loading, error, refetch } = useMDXFetch("/api/mdx");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <ScrollView
      contentContainerStyle={{ padding: 24 }}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl
          tintColor={"black"}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      <Text style={{ fontSize: 12, color: "#666", marginBottom: 16 }}>
        This content is fetched from /api/mdx and rendered using RemoteMDX
      </Text>

      {loading && (
        <View style={{ padding: 40, alignItems: "center" }}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 16, color: "#666" }}>Loading MDX...</Text>
        </View>
      )}

      {error && (
        <View style={{ padding: 20, backgroundColor: "#fee", borderRadius: 8 }}>
          <Text style={{ color: "#c00", fontWeight: "bold" }}>Error</Text>
          <Text style={{ color: "#c00", marginTop: 8 }}>{error.message}</Text>
          <Pressable
            onPress={refetch}
            style={{
              marginTop: 16,
              backgroundColor: "#c00",
              padding: 12,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: "white", textAlign: "center" }}>Retry</Text>
          </Pressable>
        </View>
      )}

      {content && (
        <MDXStyles
          h1={{ fontSize: 28, fontWeight: "bold", marginBottom: 16 }}
          h2={{
            fontSize: 22,
            fontWeight: "bold",
            marginTop: 24,
            marginBottom: 12,
          }}
          p={{
            fontSize: Platform.select({ web: "1rem", default: 16 }),
            marginBottom: 12,
            lineHeight: 24,
          }}
          code={{
            backgroundColor: "#f4f4f4",
            padding: 16,
            borderRadius: 8,
            fontSize: 14,
            overflow: "hidden",
          }}
          inlineCode={{
            backgroundColor: "#f4f4f4",
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
            fontSize: 14,
          }}
          blockquote={{
            borderLeftWidth: 4,
            borderLeftColor: "#007AFF",
            paddingLeft: 16,
            marginVertical: 16,
            fontStyle: "italic",
          }}
          li={{ marginBottom: 8 }}
          hr={{ marginVertical: 24, borderTopWidth: 1, borderTopColor: "#ddd" }}
          strong={{ fontWeight: "bold" }}
          em={{ fontStyle: "italic" }}
        >
          <MDXComponents
            components={{
              Highlight: ({ children, ...props }) => (
                <Text
                  {...props}
                  style={{
                    backgroundColor: "#FFEB3B",
                    paddingHorizontal: 4,
                    borderRadius: 2,
                  }}
                >
                  {children}
                </Text>
              ),
              Badge: ({ children, type, ...props }) => (
                <View
                  style={{
                    backgroundColor: type === "success" ? "#4CAF50" : "#2196F3",
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,

                    alignSelf: "flex-start",
                  }}
                >
                  <Text
                    style={{ color: "white", fontSize: 12, fontWeight: "bold" }}
                  >
                    {children}
                  </Text>
                </View>
              ),
            }}
          >
            <RemoteMDX source={content} />
          </MDXComponents>
        </MDXStyles>
      )}

      {content?.frontmatter && Object.keys(content.frontmatter).length > 0 && (
        <View
          style={{
            marginTop: 24,
            padding: 16,
            backgroundColor: "#f0f0f0",
            borderRadius: 8,
          }}
        >
          <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
            Frontmatter:
          </Text>
          <Text
            style={{
              fontFamily: Platform.select({
                ios: "Menlo",
                android: "monospace",
                default: "monospace",
              }),
            }}
          >
            {JSON.stringify(content.frontmatter, null, 2)}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
