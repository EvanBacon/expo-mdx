type DeepNotReadOnly<T> = {
  -readonly [P in keyof T]: DeepNotReadOnly<T[P]>;
};

/** @param config: Metro config loaded with `getDefaultConfig(__dirname);` */
export function withMdx(
  config: DeepNotReadOnly<import("@expo/metro-config").MetroConfig>
) {
  if (
    !config.transformer.babelTransformerPath ||
    // Overwrite the default expo value.
    config.transformer.babelTransformerPath.endsWith(
      "@expo/metro-config/build/babel-transformer.js"
    )
  ) {
    config.transformer.babelTransformerPath = require.resolve(
      "@bacons/mdx/default-metro-transformer.js"
    );
  } else {
    console.warn(
      `@bacons/mdx: Using custom babel transformer: ${config.transformer.babelTransformerPath}`
    );
    console.warn(`Ensure it includes the MDX transformer from @bacons/mdx`);
  }

  // Ensure md and mdx are supported
  config.resolver.sourceExts ??= [];

  if (!config.resolver.sourceExts.some((ext: string) => ext === "md")) {
    config.resolver.sourceExts.push("md", "mdx");
  }

  return config;
}
