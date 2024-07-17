import { transform, createTransformer } from "../metro-transformer";

function getJsxContent(src: string) {
  const match = src.match(/<MDXLayout[^>]*>(.*)<\/MDXLayout>/s);
  if (!match) {
    throw new Error(`Could not find MDXContent in source`);
  }
  return match[1].trim();
}

describe(transform, () => {
  it(`should transform basic MDX`, async () => {
    const result = await transform({
      filename: "test.mdx",
      //   src: `- 123`,
      src: `
# Hello World

> Universe

- a
- b

![alt text](./foo/bar.png)`,
    });

    expect(result.src.includes(`"src": require("./foo/bar.png")`)).toEqual(
      true
    );
    expect(result.src).toMatchInlineSnapshot(`
      "import { useMDXComponents } from \\"@bacons/mdx\\";

      const makeExpoMetroProvided = name => function MDXExpoMetroComponent(props) {
        const html = useMDXComponents();
        if (html[name] == null) {
          console.warn(\\"Component \\" + name + \\" was not imported, exported, or provided by MDXProvider as global scope\\")
          return <html.span {...props}/>
        }
        return html[name](props);
      };



      const layoutProps = {
        
      };
      const MDXLayout = \\"wrapper\\"
      export default function MDXContent({
        components,
        ...props
      }) {
        const html = useMDXComponents();
        const MDXLayout = html.Wrapper;
        return <MDXLayout {...layoutProps} {...props} components={components} mdxType=\\"MDXLayout\\">
          <html.h1>{\`Hello World\`}</html.h1>
          <html.blockquote>
            <html.p parentName=\\"html.blockquote\\">{\`Universe\`}</html.p>
          </html.blockquote>
          <html.ul>
            <html.li parentName=\\"html.ul\\">{\`a\`}</html.li>
            <html.li parentName=\\"html.ul\\">{\`b\`}</html.li>
          </html.ul>
          <html.p><html.img parentName=\\"html.p\\" {...{
              \\"src\\": require(\\"./foo/bar.png\\"),
              \\"alt\\": \\"alt text\\"
            }}></html.img></html.p>
          </MDXLayout>;
      }
      ;
      MDXContent.isMDXComponent = true;"
    `);
  });

  it(`should transform MDX images`, async () => {
    const result = await transform({
      filename: "test.mdx",
      //   src: `- 123`,
      src: `![alt text](./foo/bar.png)`,
    });

    expect(result.src.includes(`"src": require("./foo/bar.png")`)).toEqual(
      true
    );
    expect(getJsxContent(result.src)).toMatchInlineSnapshot(`
      "<html.p><html.img parentName=\\"html.p\\" {...{
              \\"src\\": require(\\"./foo/bar.png\\"),
              \\"alt\\": \\"alt text\\"
            }}></html.img></html.p>"
    `);
  });

  it(`transforms code blocks`, async () => {
    const { transform } = createTransformer();
    const result = await transform({
      filename: "test.mdx",
      src: `
\`\`\`js title="hello"
console.log("hello")
\`\`\`
`,
    });

    expect(getJsxContent(result.src)).toMatchInlineSnapshot(`
      "<html.pre><html.code parentName=\\"html.pre\\" {...{
              \\"className\\": \\"language-js\\",
              \\"metastring\\": \\"title=\\\\\\"hello\\\\\\"\\",
              \\"title\\": \\"\\\\\\"hello\\\\\\"\\"
            }}>{\`console.log(\\"hello\\")
      \`}</html.code></html.pre>"
    `);
  });
 
  

  it(`should transform with code title`, async () => {
    const { transform } = createTransformer({
      remarkPlugins: [require("../plugins/remark-code-title")],
    });
    const result = await transform({
      filename: "test.mdx",
      src: `
\`\`\`js title="hello"
console.log("hello")
\`\`\`
`,
    });

    expect(getJsxContent(result.src)).toMatchInlineSnapshot(`
      "<html.pre><html.code parentName=\\"html.pre\\" {...{
              \\"className\\": \\"language-js\\",
              \\"metastring\\": \\"title=\\\\\\"hello\\\\\\"\\",
              \\"title\\": \\"\\\\\\"hello\\\\\\"\\"
            }}>{\`@@@title=\\"hello\\"@@@console.log(\\"hello\\")
      \`}</html.code></html.pre>"
    `);
  });

  it(`should transform frontmatter`, async () => {
    const { transform } = createTransformer({
      remarkPlugins: [
        require("remark-stringify"),
        [require("remark-frontmatter"), ["yaml"]],
        () => (tree) => {
          console.log(tree);
        },
        // {
        //   type: 'root',
        //   children: [
        //     { type: 'thematicBreak', position: [Position] },
        //     {
        //       type: 'heading',
        //       depth: 2,
        //       children: [Array],
        //       position: [Position]
        //     },
        //     {
        //       type: 'heading',
        //       depth: 1,
        //       children: [Array],
        //       position: [Position]
        //     }
        //   ],
        //   position: {
        //     start: { line: 1, column: 1, offset: 0 },
        //     end: { line: 7, column: 1, offset: 49 }
        //   }
        // }
        [
          require("remark-mdx-frontmatter").remarkMdxFrontmatter,
          { name: "meta" },
        ],
      ],
    });
    const result = await transform({
      filename: "test.mdx",
      //   src: `- 123`,
      src: `
---
title = "New Website"
---

# Other markdown
`,
    });

    // expect(result.src.includes(`"source": require("./foo/bar.png")`)).toEqual(
    //   true
    // );
    expect(getJsxContent(result.src)).toMatchInlineSnapshot(`
      "<html.hr></html.hr>
          <html.h2>{\`title = \\"New Website\\"\`}</html.h2>
          <html.h1>{\`Other markdown\`}</html.h1>"
    `);
  });
});
