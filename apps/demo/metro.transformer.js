const upstreamTransformer = require("@expo/metro-config/babel-transformer");
const MdxTransformer = require("@bacons/mdx/metro-transformer");

module.exports.transform = async (props) => {
  // Async load ESM code in CJS contexts
  const remarkMdxFrontmatter = (await import("remark-mdx-frontmatter")).default;
  const remarkGfm = (await import("remark-gfm")).default;
  const remarkMath = (await import("remark-math")).default;

  const mdxTransformer = MdxTransformer.createTransformer({
    remarkPlugins: [
      remarkGfm,
      remarkMath,
      [remarkMdxFrontmatter, { name: "meta" }],
    ],
  });

  // Then pass it to the upstream transformer.
  return upstreamTransformer.transform(
    // Transpile MDX first.
    await mdxTransformer.transform(props)
  );
};
