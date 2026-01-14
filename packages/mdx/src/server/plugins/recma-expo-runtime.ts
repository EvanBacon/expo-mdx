import type {
  CallExpression,
  FunctionDeclaration,
  Program,
  VariableDeclaration,
} from "estree-jsx";

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
    });

    // Modify the `_createMdxContent` -> `const {Bacon, Foobar, html} = props.components || ({})` to:
    // `const components = { ...useMDXComponents(), ...props.components };` + `const {Bacon, Foobar, html} = components`;
    const createMdxContent = tree.body.find(
      (node) =>
        node.type === "FunctionDeclaration" &&
        node.id.type === "Identifier" &&
        node.id.name === "_createMdxContent"
    ) as FunctionDeclaration;
    if (createMdxContent) {
      const componentDestructure = createMdxContent.body.body.find(
        (node) => node.type === "VariableDeclaration"
      ) as VariableDeclaration; // todo check for `const {html}`

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
        if (componentDestructure.declarations[0].id.type === "ObjectPattern") {
          componentDestructure.declarations[0].id.properties =
            componentDestructure.declarations[0].id.properties.map((node) => {
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
            });
        }

        visit!(tree, (node) => {
          // Ensure all components have the `components={html}` property
          if (
            node.type === "CallExpression" &&
            node.callee.type === "Identifier" &&
            node.callee.name === "_jsx"
          ) {
            // JSX is endered as `_jsx(<component>, <props>)`
            // check the 2nd argument if it has `components: html`
            if (
              node.arguments[1].type === "ObjectExpression" &&
              !node.arguments[1].properties.some(
                (prop) =>
                  prop.type === "Property" &&
                  prop.key.type === "Identifier" &&
                  prop.key.name === "components"
              )
            ) {
              node.arguments[1].properties.push({
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
  const visit = (await import("estree-util-visit")).visit;
  return (...args) => recmaExpoRuntime({ ...args, visit });
}
