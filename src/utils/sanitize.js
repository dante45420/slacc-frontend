import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param {string} dirty - Raw HTML string
 * @returns {string} Sanitized HTML string
 */
export function sanitizeHtml(dirty) {
  if (!dirty) return "";

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "br",
      "hr",
      "strong",
      "em",
      "u",
      "s",
      "sub",
      "sup",
      "ul",
      "ol",
      "li",
      "a",
      "img",
      "blockquote",
      "pre",
      "code",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "div",
      "span",
    ],
    ALLOWED_ATTR: [
      "href",
      "target",
      "rel",
      "src",
      "alt",
      "width",
      "height",
      "class",
      "id",
    ],
    ALLOW_DATA_ATTR: false,
  });
}
