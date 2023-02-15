# @bacons/mdx

[MDX](https://mdxjs.com) support for React Native projects.

## Add the package to your npm dependencies

```
yarn add @bacons/mdx
```

## Setup

Add support for importing `md` and `mdx` files in your `metro.config.js` file.

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
const upstreamTransformer = require("metro-react-native-babel-transformer");
const MdxTransformer = require("@bacons/mdx/metro-transformer");

module.exports.transform = async (props) => {
  // Then pass it to the upstream transformer.
  return upstreamTransformer.transform(
    // Transpile MDX first.
    await MdxTransformer.transform(props)
  );
};
```

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

## Custom components

Probably I didn't get the elements right, most React Native markdown packages don't. You can unblock yourself by overwriting certain elements:

```js
import { Text } from "react-native";
import { MDXComponents } from "@bacons/mdx";

export default function App() {
  // Pass any HTML element as a key to the MDXComponents component.
  return (
    <MDXComponents h1={(props) => <Text {...props} />}>
      <Demo />
    </MDXComponents>
  );
}
```

> Just be sure to pass the `style` prop down to the component you're using, this is how the styles are cascaded.

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
  function Component(props: any): JSX.Element;
  export default Component;
}
```

## Known Issues

- ol, li, ul are all buggy. PRs welcome.
- Native image ratios are weird.
