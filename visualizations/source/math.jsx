import React from "react";
import katex from "katex";

/* Tiny KaTeX wrapper.
   <Tex>x^2 + y^2 = 1</Tex>           — inline
   <Tex block>\sum_{i=1}^n a_i x_i</Tex> — display mode (centered, larger)
   The CSS is imported once in src/main.jsx. */

export function Tex({ children, block = false }) {
  const html = katex.renderToString(String(children ?? ""), {
    displayMode: block,
    throwOnError: false,
    errorColor: "#c8311c",
    strict: "ignore",
  });
  const Tag = block ? "div" : "span";
  return (
    <Tag
      style={block ? { margin: "8px 0", textAlign: "center" } : undefined}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
