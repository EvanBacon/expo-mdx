import mdx from "@mdx-js/mdx";
import visit from "unist-util-visit";

const debug = require("debug")("bacons:mdx:transform") as typeof console.log;

const getTemplate = (rawMdxString) => {
  const replacedShortcodes = rawMdxString.replace(
    /= makeShortcode\(/g,
    "= makeExpoMetroProvided("
  );

  return `import { useMDXComponents } from "@bacons/mdx";
  ${makeExpoMetroProvidedTemplate}
  
  ${replacedShortcodes.replace(
    "return <MDXLayout",
    "const html = useMDXComponents();\n  const MDXLayout = html.Wrapper;\n  return <MDXLayout"
  )}`;
};

const makeExpoMetroProvidedTemplate = `
const makeExpoMetroProvided = name => function MDXExpoMetroComponent(props) {
  const html = useMDXComponents();
  if (html[name] == null) {
    console.warn("Component " + name + " was not imported, exported, or provided by MDXProvider as global scope")
    return <html.span {...props}/>
  }
  return html[name](props);
};
`;

export function createTransformer({
  match = (props) => !!props.filename.match(/\.mdx?$/),
}: {
  match?: (props: { filename: string; src: string }) => boolean;
} = {}) {
  const compiler = mdx.createCompiler({});

  return async function transformMdx(props: { filename: string; src: string }) {
    if (!match(props)) {
      return props;
    }

    // Append this final rule at the end of the compiler chain:
    compiler.use(() => {
      return (tree, _file) => {
        function walkForImages(node) {
          if (node.tagName === "img") {
            if (node.properties.src.startsWith(".")) {
              // Relative path should be turned into a require statement:
              node.properties.src = `[[_Expo_MemberProperty:require("${node.properties.src}")]]`;
              // delete node.properties.src;
            }
          }
          if (node.children) {
            node.children.forEach(walkForImages);
          }
        }

        tree.children.map(walkForImages);

        visit(tree, "element", (node) => {
          // Ensure we don't use react-dom elements
          // @ts-expect-error: incorrect types
          node.tagName = "html." + node.tagName;
        });
      };
    });
    let { contents } = await compiler.process({
      contents: props.src,
      path: props.filename,
    });

    // Support member expressions in require statements:
    contents = contents.replace(
      /"\[\[_Expo_MemberProperty:(.*)\]\]"/g,
      (match, p1) => {
        return p1.replace(/\\\\/g, "\\").replace(/\\"/g, '"');
      }
    );

    props.src = getTemplate(contents);

    debug("Compiled MDX file:", props.filename, "\n", props.src);

    return props;
  };
}

export const transform = createTransformer();
