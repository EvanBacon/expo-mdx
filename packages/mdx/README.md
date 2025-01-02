# @bacons/mdx

Build-time [MDX](https://mdxjs.com) for Expo apps and websites.

## Add the package to your npm dependencies

```
yarn add @bacons/mdx
```

## Setup

Add support for importing `md` and `mdx` files in your `metro.config.js` file.

`metro.config.js`

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withMdx } = require("@bacons/mdx/metro");

const config = withMdx(getDefaultConfig(__dirname));

module.exports = config;
```

<details>
  <summary>Manual setup</summary>

If you need to customize the `babelTransformerPath` more, than use this manual setup:

`metro.config.js`

```js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push("md", "mdx");

config.transformer.babelTransformerPath = require.resolve("./transformer.js");

module.exports = config;
```

Create a custom metro transformer. This is used to transform MDX files into JS + React Native before transpiling with Babel.

`./transformer.js`

```js
const upstreamTransformer = require("@expo/metro-config/babel-transformer");
const MdxTransformer = require("@bacons/mdx/metro-transformer");

module.exports.transform = async (props) => {
  // Then pass it to the upstream transformer.
  return upstreamTransformer.transform(
    // Transpile MDX first.
    await MdxTransformer.transform(props)
  );
};
```

</details>

## Usage

Create a markdown file:

`./demo.mdx`

```md
import { CustomComponent } from './my-custom-component';

# Hello World

I **am** a _markdown_ file!

<CustomComponent />
```

This file can be imported and treated as a React component:

`./App.js`

```js
import Demo from "./demo.mdx";

export default function App() {
  return <Demo />;
}
```

## Custom components

By default, this package uses an incomplete set of universal React Native components for DOM elements. You may wish to improve the components, add more, or swap them out for your own.

```js
import { Text } from "react-native";
import { MDXComponents } from "@bacons/mdx";

export default function App() {
  return (
    <Demo
      components={{
        h1: (props) => <h1 {...props} />,
        // Add custom components which can be used as JSX elements.
        RedText: (props) => <Text {...props} style={{ color: "red" }} />,
        // This can be used as `<RedText />` without the need to import it.
      }}
    />
  );
}
```

Now inside of your markdown file, you can use the custom components:

```md
# Hello World

<RedText />
```

You can set the components for all children using the `MDXComponents` React context component.

```js
import { Text } from "react-native";
import { MDXComponents } from "@bacons/mdx";

export default function App() {
  // Pass any HTML element as a key to the MDXComponents component.
  return (
    <MDXComponents
      components={{
        h1: (props) => <Text {...props} />,
        // Add custom components which can be used as JSX elements.
        RedText: (props) => <Text {...props} style={{ color: "red" }} />,
        // This can be used as `<RedText />` without the need to import it.
      }}
    >
      <Demo />
    </MDXComponents>
  );
}
```

> Be sure to pass the `style` prop down to the component you're using, this is how the styles are cascaded.

## Custom styles

This package works similarly to most docs sites. You create high-level styles for the entire site. This can be cascaded down to reduce the scope of a style.

```js
import { MDXStyles } from "@bacons/mdx";

export default function App() {
  // Pass any HTML element as a key to the MDXStyles component.
  return (
    <MDXStyles
      h1={{
        fontSize: 32,
        fontWeight: "bold",
        color: "red",
      }}
    >
      <Demo />
    </MDXStyles>
  );
}
```

The `<MDXStyles>` components can be stacked in different levels, think of these like CSS classes.

## Typescript

You can add support for importing `.mdx` files in your `tsconfig.json` file.

`tsconfig.json`

```json
{
  "compilerOptions": {
    "typeRoots": ["./global.d.ts"]
  },
  "extends": "expo/tsconfig.base"
}
```

Now create a file that declares the module.

`./global.d.ts`

```ts
declare module "*.mdx" {
  import React from "react";
  import { CustomComponentsProp } from "@bacons/mdx";
  const Component: React.FC<{
    components?: CustomComponentsProp;
  }>;
  export default Component;
}
```

## Experimental native errors

> Optional native-only step, not required for MDX to work.

React Native has suboptimal error messages for when you use React DOM components on native or render strings outside of `<Text />` elements. This can make migration and code sharing very painful. This package has an experimental dev-only feature to print out optimized errors when you render react-dom built-in's such as div, p, h1, etc. on native.

Simply add the following to your `babel.config.js`, and clear the transform cache `npx expo start --clear`:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "@bacons/mdx/jsx" }]],
  };
};
```

Now when you render a div, p, h1, etc. on native, you will get a helpful error message.

```js
export default function App() {
  return <div>Hey</div>;
}
```

```log
ERROR  Unsupported DOM <p /> at: /Users/evanbacon/Documents/GitHub/bacons/mdx/apps/demo/src/App.tsx:1:11
This will break in production.
```

## Web-only components

It's possible to parse MDX to DOM elements instead of universal components. This can be useful when building for web-only or migrating from web-only. To do this, pull in the `getDOMComponents` function and pass it to the `components` prop of the MDX component.

```js
import { getDOMComponents } from "@bacons/mdx";

import Demo from "./readme.md";

export default function App() {
  return <Demo components={getDOMComponents()} />;
}
```

This will render the following MDX as DOM elements:

```md
# Hello World

I **am** a _markdown_ file!
```

And the DOM:

```html
<h1>Hello World</h1>
<p>I <strong>am</strong> a <em>markdown</em> file!</p>
```

## Next.js Usage

1. Follow the steps detailed here: [https://nextjs.org/docs/advanced-features/using-mdx](https://nextjs.org/docs/advanced-features/using-mdx)
2. Add the following packages to `transpile-modules` within your `next.config.js`:
   ```js
   '@bacons/mdx',
   '@bacons/react-views',
   '@expo/html-elements',
   ```

## Known Issues

- ol, li, ul are all buggy. PRs welcome.
- Native image ratios are weird.

## About this project

This is a universal MDX implementation for Expo (React & Metro). It aims to be a general-purpose MDX implementation for Expo projects that leverage universal Metro (Expo CLI).

- Test in the `apps/demo` project.

This library powers my (Evan Bacon) [personal blog](https://evanbacon.dev/blog), the source can be found here: [Evan Bacon portfolio](https://github.com/EvanBacon/evanbacon.dev).
