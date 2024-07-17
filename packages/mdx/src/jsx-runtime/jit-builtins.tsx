import "react/jsx-runtime";
import { createMissingView } from "./MissingDomView";
/**
 * A map that caches registered native components.
 */
const nativeComponentsCache = new Map<string, any>();

export type JSXFunction = (
  type: React.ComponentType,
  props: Record<string, any> | undefined | null,
  key?: React.Key,
  isStaticChildren?: boolean,
  __source?: unknown,
  __self?: unknown
) => React.ElementType;

/**
 * A JSX creator which replaces lowercase string components with the MissingDomView component.
 * This is intended for development native builds where a user might accidentally pull in a built-in component from the web which doesn't exist on native.
 * The replacement is designed to make it easy to spot the issue and provide a helpful error message.
 */
export default function withJitBuiltIns(jsx: JSXFunction): JSXFunction {
  return function (type, props, ...rest) {
    if (typeof type === "string" && /^[a-z]/.test(type)) {
      const [, , __source] = rest;
      // @ts-expect-error: Add the source to the props for improving the error message.
      props.$$source = __source;

      if (nativeComponentsCache.has(type)) {
        type = nativeComponentsCache.get(type);
      } else {
        // TODO: Add some system to detect if a component exists on the native side, if it doesn't then use a helpful error message.
        const domView = createMissingView(type);

        nativeComponentsCache.set(type, domView);
        type = domView;
      }
    }

    // Call the original jsx function with the new type
    return jsx.call(jsx, type, props, ...rest);
  };
}
