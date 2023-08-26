import mdx from "@mdx-js/mdx";
import { Processor } from "unified";
import { Parent } from "unist";
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
};`;

function isParent(node: any): node is Parent {
  return Array.isArray(node?.children);
}

export function createTransformer({
  matchFile = (props) => !!props.filename.match(/\.mdx?$/),
  matchLocalAsset = (props) => !!props.src.match(/^[.@]/),
  remarkPlugins = [],
}: {
  /**
   * @param props Metro transform props.
   * @returns true if the file should be transformed.
   * @default Function that matches if a file ends with `.mdx` or `.md`.
   */
  matchFile?: (props: { filename: string; src: string }) => boolean;
  /**
   * @returns true if the src reference should be converted to a local `require`.
   * @default Function that matches strings starting with `.` or `@`.
   */
  matchLocalAsset?: (props: { src: string }) => boolean;

  remarkPlugins?: any[];
} = {}) {
  const compiler = mdx.createCompiler({ remarkPlugins }) as Processor;

  // for (const plugin of remarkPlugins) {
  //   compiler.use(plugin);
  // }

  // Append this final rule at the end of the compiler chain:
  compiler.use(() => {
    return (tree, _file) => {
      if (isParent(tree)) {
        const walkForImages = (node: any) => {
          if (node.tagName === "img") {
            if (matchLocalAsset(node.properties)) {
              // Relative path should be turned into a require statement:
              node.properties.src = `[[_Expo_MemberProperty:require("${node.properties.src}")]]`;
              // delete node.properties.src;
            }
          }
          if (isParent(node)) {
            node.children.forEach(walkForImages);
          }
        };

        tree.children.map(walkForImages);
      }

      visit(tree, "element", (node) => {
        // Ensure we don't use react-dom elements
        // @ts-expect-error: incorrect types
        node.tagName = "html." + node.tagName;
      });
    };
  });

  async function transformMdx(props: { filename: string; src: string }) {
    if (!matchFile(props)) {
      return props;
    }

    let { contents } = await compiler.process({
      contents: props.src,
      path: props.filename,
    });

    if (typeof contents === "string") {
      // Support member expressions in require statements:
      contents = contents.replace(
        /"\[\[_Expo_MemberProperty:(.*)\]\]"/g,
        (match, p1) => {
          return p1.replace(/\\\\/g, "\\").replace(/\\"/g, '"');
        }
      );
    }

    props.src = getTemplate(contents);

    debug("Compiled MDX file:", props.filename, "\n", props.src);

    return props;
  }

  return { transform: transformMdx, compiler };
}

export const transform = createTransformer().transform;
