import { Image, ImageProps } from "@bacons/react-views";
import React from "react";
import { Image as UpstreamImage } from "react-native";

export function AutoImage(props: ImageProps) {
  const [imgSize, setImageSize] = React.useState<{
    width?: number;
    height?: number;
  }>({});
  const [imageHeight, setImageHeight] = React.useState(100);

  React.useEffect(() => {
    // @ts-expect-error
    UpstreamImage.getSize(props.source.uri, (w, h) => {
      setImageSize({ width: w, height: h });
    });
  }, [props.source]);

  const [layoutWidth, setLayoutWidth] = React.useState(0);

  React.useEffect(() => {
    if (layoutWidth === 0 || imgSize.width == null || imgSize.height == null)
      return;

    const ratio = imgSize.width / imgSize.height;
    const newHeight = layoutWidth / ratio;
    if (isNaN(newHeight)) return;
    setImageHeight(newHeight);
  }, [imgSize, layoutWidth]);

  return (
    <Image
      style={[props.style, { height: imageHeight }]}
      onLayout={(e) => {
        if (layoutWidth === e.nativeEvent.layout.width) return;
        setLayoutWidth(e.nativeEvent.layout.width);
      }}
      source={props.source}
    />
  );
}
