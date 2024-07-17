import { createElement as originalCreateElement } from "react";
import ReactJSXRuntime from "react/jsx-runtime";
import withJitBuiltIns from "./jit-builtins";

export { Fragment } from "react";
export const jsxs = withJitBuiltIns((ReactJSXRuntime as any).jsxs);
export const jsx = withJitBuiltIns((ReactJSXRuntime as any).jsx);
export const jsxDEV = withJitBuiltIns((ReactJSXRuntime as any).jsxDEV);
export const createInteropElement = withJitBuiltIns(
  originalCreateElement as any
);
export const createElement = originalCreateElement;
