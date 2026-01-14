import { recmaExpoRuntime } from "./plugins/recma-expo-runtime";
import {
  rehypeExpoLocalImages,
  type RehypeExpoLocalImagesOptions,
} from "./plugins/rehype-expo-local-images";
import { rehypePrefixTagNames } from "./plugins/rehype-prefix-tag-names";

const debug = require("debug")("bacons:mdx:transform") as typeof console.log;

/** The singleton MDX compiler instance */
let _compiler: ReturnType<typeof import("@mdx-js/mdx").createProcessor> | null =
  null;

/** Key to identify compiler configuration (for testing) */
let _compilerKey: string | null = null;

/**
 * Reset the singleton compiler (useful for tests).
 */
export function resetCompiler() {
  _compiler = null;
  _compilerKey = null;
}

/**
 * Create and return the singleton MDX compiler instance.
 * This is done asynchronously to use ESM code inside CJS contexts.
 */
export async function createSingletonCompiler(
  options: import("@mdx-js/mdx").ProcessorOptions,
  key?: string
) {
  // Reset compiler if key changed (different configuration)
  if (key && _compilerKey !== key) {
    _compiler = null;
    _compilerKey = key;
  }

  if (!_compiler) {
    _compiler = (await import("@mdx-js/mdx")).createProcessor(options);
    if (key) _compilerKey = key;
  }

  return _compiler;
}

/** Counter for generating unique compiler keys */
let _transformerCounter = 0;

export function createTransformer({
  matchLocalAsset,
  matchFile = (props) => !!props.filename.match(/\.mdx?$/),
  remarkPlugins = [],
}: RehypeExpoLocalImagesOptions & {
  /**
   * @param props Metro transform props.
   * @returns true if the file should be transformed.
   * @default Function that matches if a file ends with `.mdx` or `.md`.
   */
  matchFile?: (props: { filename: string; src: string }) => boolean;

  remarkPlugins?: any[];
} = {}) {
  // Generate a unique key for this transformer configuration
  const compilerKey = `transformer-${++_transformerCounter}`;

  async function transformMdx(props: { filename: string; src: string }) {
    if (!matchFile(props)) {
      return props;
    }

    const { visit: estreeVisit } = await import("estree-util-visit");
    const compiler = await createSingletonCompiler(
      {
        remarkPlugins,
        rehypePlugins: [
          [rehypeExpoLocalImages, { matchLocalAsset }],
          [rehypePrefixTagNames, { prefix: "html." }],
        ],
        recmaPlugins: [[recmaExpoRuntime, { visit: estreeVisit }]],
      },
      compilerKey
    );

    let contents: string;

    try {
      let { value } = await compiler.process({
        value: props.src,
        path: props.filename,
      });

      contents = value.toString();
    } catch (error: any) {
      const errMsg = `Failed to process MDX for ${props.filename}: ${error?.message || error}`;
      const newError = new Error(errMsg);
      (newError as any).cause = error;
      throw newError;
    }

    // if (typeof contents === "string") {
    //   // Support member expressions in require statements:
    //   contents = contents.replace(
    //     /"\[\[_Expo_MemberProperty:(.*)\]\]"/g,
    //     (match, p1) => {
    //       return p1.replace(/\\\\/g, "\\").replace(/\\"/g, '"');
    //     }
    //   );
    // }

    // props.src = getTemplate(contents);
    props.src = contents;

    debug("Compiled MDX file:", props.filename, "\n", props.src);

    return props;
  }

  return { transform: transformMdx };
}

export const transform = createTransformer().transform;
