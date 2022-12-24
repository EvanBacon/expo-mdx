import mdx from "@mdx-js/mdx";
import visit from "unist-util-visit";

const getTemplate = (rawMdxString) => {
  return `import { useMDXComponents } from "@bacons/mdx";
  
  ${rawMdxString.replace(
    "return <MDXLayout",
    "const html = useMDXComponents();\n  const MDXLayout = html.Wrapper;\n  return <MDXLayout"
  )}`;
};

export async function transform(props: { filename: string; src: string }) {
  if (props.filename.endsWith(".md") || props.filename.endsWith(".mdx")) {
    const compiler = mdx.createCompiler({});
    // Append this final rule at the end of the compiler chain:
    compiler.use(() => {
      return (tree, _file) => {
        visit(tree, "element", (node) => {
          // Ensure we don't use react-dom elements
          // @ts-expect-error: incorrect types
          node.tagName = "html." + node.tagName;
        });
      };
    });
    const { contents } = await compiler.process({
      contents: props.src,
      path: props.filename,
    });

    props.src = getTemplate(contents);

    // console.log("\n-----\n");
    // console.log("Compiled MDX file:", props.filename, "\n", props.src);
    // console.log("\n-----\n");
  }
  return props;
}
