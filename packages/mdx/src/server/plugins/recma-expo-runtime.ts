import type {
  FunctionDeclaration,
  Program,
  VariableDeclaration,
  Node,
  ObjectPattern,
  Property,
  ObjectExpression,
} from "estree";

interface RecmaExpoRuntimeOptions {
  componentLibrary?: string;
  /** The object variable name used to store all components for MDX (defaults to `html`) */
  componentObject?: string;

  visit?: typeof import("estree-util-visit").visit;
}

/**
 * Modify the MDX JSX serialization to run in Expo environments.
 * These modifications include:
 *   - Wrapping the MDX component lookup with potential missing imports in development
 *   - Injecting the default MDX components from `@bacons/mdx`
 *   - Passing the default MDX components to custom components
 */
export function recmaExpoRuntime({
  visit,
  componentLibrary = "@bacons/mdx",
  componentObject = "html",
}: RecmaExpoRuntimeOptions = {}) {
  return (tree: Program) => {
    // Ensure the import to `@bacons/mdx` is imported as root import
    // `import {useMDXComponents} from "<componentLibrary>"`
    tree.body.unshift({
      type: "ImportDeclaration",
      source: {
        type: "Literal",
        value: componentLibrary,
      },
      specifiers: [
        {
          type: "ImportSpecifier",
          imported: {
            type: "Identifier",
            name: "useMDXComponents",
          },
          local: {
            type: "Identifier",
            name: "useMDXComponents",
          },
        },
      ],
      attributes: [],
    } as any);

    // Modify the `_createMdxContent` -> `const {Bacon, Foobar, html} = props.components || ({})` to:
    // `const components = { ...useMDXComponents(), ...props.components };` + `const {Bacon, Foobar, html} = components`;
    const createMdxContent = tree.body.find(
      (node): node is FunctionDeclaration =>
        node.type === "FunctionDeclaration" &&
        node.id?.type === "Identifier" &&
        node.id.name === "_createMdxContent"
    );
    if (createMdxContent) {
      const componentDestructure = createMdxContent.body.body.find(
        (node): node is VariableDeclaration =>
          node.type === "VariableDeclaration"
      ); // todo check for `const {html}`

      if (componentDestructure) {
        // insert `const components = { ...useMDXComponents(), ...props.components };`
        createMdxContent.body.body.unshift({
          type: "VariableDeclaration",
          kind: "const",
          declarations: [
            {
              type: "VariableDeclarator",
              id: {
                type: "Identifier",
                name: "components",
              },
              init: {
                type: "ObjectExpression",
                properties: [
                  {
                    type: "SpreadElement",
                    argument: {
                      type: "CallExpression",
                      callee: {
                        type: "Identifier",
                        name: "useMDXComponents",
                      },
                      arguments: [],
                      optional: false,
                    },
                  },
                  {
                    type: "SpreadElement",
                    argument: {
                      type: "MemberExpression",
                      object: {
                        type: "Identifier",
                        name: "props",
                      },
                      property: {
                        type: "Identifier",
                        name: "components",
                      },
                      computed: false,
                      optional: false,
                    },
                  },
                ],
              },
            },
          ],
        });

        // modify component destructure from `const {Bacon, Foobar, html} = props.components || ({});`
        // to `const {Bacon, Foobar, html} = components;
        componentDestructure.declarations[0].init = {
          type: "Identifier",
          name: "components",
        };
        // modify to `const {Bacon, Foobar, ...html} = components`
        const declarationId = componentDestructure.declarations[0].id;
        if (declarationId.type === "ObjectPattern") {
          (declarationId as ObjectPattern).properties = declarationId.properties.map(
            (node) => {
              if (
                node.type === "Property" &&
                node.key.type === "Identifier" &&
                node.key.name === "html"
              ) {
                return {
                  type: "RestElement",
                  argument: {
                    type: "Identifier",
                    name: "html",
                  },
                };
              }

              return node;
            }
          );
        }

        visit!(tree, (node: Node) => {
          // Convert string literals like 'require("./foo.png")' to actual require() calls
          // This handles local image sources set by rehype-expo-local-images
          // We look for Property nodes with Literal values matching the pattern
          if (
            node.type === "Property" &&
            (node as Property).value.type === "Literal"
          ) {
            const literal = (node as Property).value as { type: "Literal"; value: unknown };
            if (
              typeof literal.value === "string" &&
              literal.value.startsWith("require(")
            ) {
              const match = literal.value.match(/^require\(["'](.+)["']\)$/);
              if (match) {
                // Replace the literal value with a CallExpression
                (node as Property).value = {
                  type: "CallExpression",
                  callee: { type: "Identifier", name: "require" },
                  arguments: [{ type: "Literal", value: match[1] }],
                  optional: false,
                } as any;
              }
            }
          }

          // Ensure all components have the `components={html}` property
          if (
            node.type === "CallExpression" &&
            node.callee.type === "Identifier" &&
            node.callee.name === "_jsx"
          ) {
            // JSX is rendered as `_jsx(<component>, <props>)`
            // check the 2nd argument if it has `components: html`
            const secondArg = node.arguments[1];
            if (
              secondArg &&
              secondArg.type === "ObjectExpression" &&
              !(secondArg as ObjectExpression).properties.some(
                (prop) =>
                  prop.type === "Property" &&
                  (prop as Property).key.type === "Identifier" &&
                  ((prop as Property).key as { name: string }).name ===
                    "components"
              )
            ) {
              (secondArg as ObjectExpression).properties.push({
                type: "Property",
                key: {
                  type: "Identifier",
                  name: "components",
                },
                value: {
                  type: "Identifier",
                  name: "html",
                },
                kind: "init",
                computed: false,
                shorthand: false,
                method: false,
              });
            }
          }
        });
      }
    }
  };
}

export async function createPlugin() {
  const { visit } = await import("estree-util-visit");
  return (...args: Parameters<typeof recmaExpoRuntime>) =>
    recmaExpoRuntime({ ...args[0], visit });
}
