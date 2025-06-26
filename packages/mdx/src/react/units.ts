import { PixelRatio } from "react-native";

export function rem(value: number): number | string {
  if (process.env.EXPO_OS === "web") return `${value}rem`;
  return PixelRatio.getFontScale() * 16 * value;
}

export function em(value: number): number | string {
  if (process.env.EXPO_OS === "web") return `${value}em`;
  return rem(value);
}
