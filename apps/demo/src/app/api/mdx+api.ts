import { compileMDX } from "@bacons/mdx/server";

const sampleMDX = `
# Remote MDX Example

This content was **compiled on the server** and rendered on the client.

## Features

- Server-side compilation to JSON
- Client-side rendering with components
- Works on iOS, Android, and Web

## Custom Components

Here's a custom component: <Highlight>This text is highlighted!</Highlight>

And another one: <Badge type="success">Success</Badge>

## Code Example

\`\`\`javascript
const greeting = "Hello from remote MDX!";
console.log(greeting);
\`\`\`

## Inline Styling

Some \`inline code\` and **bold text** with *italics*.

> This is a blockquote from remote MDX content.

---

That's it! Remote MDX is working.
`;

export async function GET(request: Request) {
  try {
    const compiled = await compileMDX(sampleMDX);
    return Response.json(compiled);
  } catch (error: any) {
    return Response.json(
      { error: error.message || "Failed to compile MDX" },
      { status: 500 }
    );
  }
}
