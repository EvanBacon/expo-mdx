const path = require("path");

module.exports = {
  testEnvironment: "node",
  testRegex: "/__tests__/.*(test|spec)\\.[jt]sx?$",
  clearMocks: true,
  rootDir: path.resolve(__dirname),
  displayName: require("./package").name,
  roots: ["src"],
  transformIgnorePatterns: [
    // Transform all ESM packages from the unified/MDX ecosystem
    "/node_modules/(?!(@mdx-js|estree-util-.*|unist-util-.*|remark-.*|recma-.*|mdast-util-.*|micromark.*|unified|bail|trough|vfile.*|zwitch|hast-util-.*|property-information|space-separated-tokens|comma-separated-tokens|ccount|escape-string-regexp|devlop|is-plain-obj|decode-named-character-reference|character-entities|trim-lines|longest-streak|stringify-entities|character-entities-html4|character-entities-legacy|markdown-table|rehype-.*|periscopic|estree-walker|acorn.*|astring|source-map)/)",
  ],
  // Handle Node.js subpath imports and node: prefix (used by modern packages)
  moduleNameMapper: {
    // vfile subpath imports
    "^#minurl$": "<rootDir>/../../node_modules/vfile/lib/minurl.js",
    "^#minpath$": "<rootDir>/../../node_modules/vfile/lib/minpath.js",
    "^#minproc$": "<rootDir>/../../node_modules/vfile/lib/minproc.js",
    // node: prefix imports (required for modern ESM packages)
    "^node:(.*)$": "$1",
  },
};
