### LaTeX ###

Our primary goal is to produce a book in PDF format.  We use PDFLaTeX.

We will consider other targets, such as generating HTML, later.

#### Including material prepared in Markdown in LaTeX documents
We avoid the markdown package (https://www.overleaf.com/learn/how-to/Writing_Markdown_in_LaTeX_Documents) (it requires \write18 or lualatex) and instead generate .tex by pandoc.
