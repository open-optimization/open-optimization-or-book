import React, { useState } from "react";
import { Copy, Download, Check } from "lucide-react";

/* ============================================================
   Copy code and download-as-Jupyter-notebook buttons
   used by code-stepper demos.
   ============================================================ */

export function CopyCodeButton({ code, label = "Copy code" }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        } catch (e) {
          // clipboard not available
          alert("Could not copy — your browser blocked clipboard access.");
        }
      }}
      style={btnSmall}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Copied!" : label}
    </button>
  );
}

export function DownloadNotebookButton({
  code,
  filename = "notebook.ipynb",
  title,
  description,
  label = "Download .ipynb",
}) {
  return (
    <button
      onClick={() => {
        const nb = buildNotebook({ code, title, description });
        const blob = new Blob([JSON.stringify(nb, null, 1)], { type: "application/x-ipynb+json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }}
      style={btnSmall}
    >
      <Download size={14} />
      {label}
    </button>
  );
}

function buildNotebook({ code, title, description }) {
  const cells = [];
  if (title || description) {
    const md = [];
    if (title) md.push(`# ${title}\n`);
    if (description) md.push("\n", description, "\n");
    cells.push({
      cell_type: "markdown",
      metadata: {},
      source: md,
    });
  }
  // Split code by lines but preserve as ipynb expects (array of strings, each ending with \n except last)
  const lines = code.split("\n");
  const source = lines.map((l, i) => (i < lines.length - 1 ? l + "\n" : l));
  cells.push({
    cell_type: "code",
    execution_count: null,
    metadata: {},
    outputs: [],
    source,
  });
  return {
    cells,
    metadata: {
      kernelspec: {
        display_name: "Python 3",
        language: "python",
        name: "python3",
      },
      language_info: {
        codemirror_mode: { name: "ipython", version: 3 },
        file_extension: ".py",
        mimetype: "text/x-python",
        name: "python",
        nbconvert_exporter: "python",
        pygments_lexer: "ipython3",
        version: "3.11",
      },
    },
    nbformat: 4,
    nbformat_minor: 5,
  };
}

const btnSmall = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "5px 10px",
  fontSize: 12,
  fontFamily: "inherit",
  fontWeight: 500,
  background: "#f7f7f7",
  border: "1px solid #ccc",
  borderRadius: 6,
  cursor: "pointer",
};
