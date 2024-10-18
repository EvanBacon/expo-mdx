declare module "*.mdx" {
  import React from "react";
  import { CustomComponentsProp } from "@bacons/mdx";
  const Component: React.FC<{
    components?: CustomComponentsProp;
  }>;
  export default Component;
}
