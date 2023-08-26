import { transform, createTransformer } from "../metro-transformer";

describe(transform, () => {
  it(`should transform MDX images`, async () => {
    const result = await transform({
      filename: "test.mdx",
      //   src: `- 123`,
      src: `![alt text](./foo/bar.png)`,
    });

    // expect(result.src.includes(`"source": require("./foo/bar.png")`)).toEqual(
    //   true
    // );
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
  it(`should transform frontmatter`, async () => {
    const { transform } = createTransformer({
      // remarkPlugins: [[require("remark-mdx-frontmatter"), { name: "meta" }]],
    });
    const result = await transform({
      filename: "test.mdx",
      //   src: `- 123`,
      src: `
+++
title = "New Websitfe"
+++

# Other markdown
`,
    });

    // expect(result.src.includes(`"source": require("./foo/bar.png")`)).toEqual(
    //   true
    // );
    expect(result.src).toMatchInlineSnapshot(`
      "import { useMDXComponents } from \\"@bacons/mdx\\";
        
        


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
          <html.p><html.img parentName=\\"html.p\\" {...{
              \\"alt\\": \\"alt text\\",
              \\"source\\": require(\\"./foo/bar.png\\")
            }}></html.img></html.p>
          </MDXLayout>;
      }
      ;
      MDXContent.isMDXComponent = true;"
    `);
  });
});
