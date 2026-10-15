// Official SLACC statutes, shown at /nosotros/estatutos.
//
// PDF: place the approved file at public/docs/estatutos-slacc.pdf. The page
// checks for it on load and only then shows the download button.
export const STATUTES_PDF_PATH = "/docs/estatutos-slacc.pdf";

// Full text (optional): when this list has content the page renders the
// statutes as a readable document with a table of contents. Text is published
// as provided by the board (usually Spanish only). Shape:
//
// [
//   {
//     title: "Capítulo I. Nombre, domicilio y objeto",
//     articles: [
//       { title: "Artículo 1", paragraphs: ["…", "…"] },
//     ],
//   },
// ]
export const STATUTES_CHAPTERS = [];
