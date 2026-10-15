// Official SLACC contact channels. Single source of truth for pages that show
// them (Contact, international landings). Footer and InstagramFeed can import
// these too instead of keeping their own copies.
export const CONTACT_EMAIL = "Slacc@cadera.cl";
export const INSTAGRAM_HANDLE = "@slacc_cadera";
export const INSTAGRAM_URL = "https://www.instagram.com/slacc_cadera/";

/** mailto: URL with correctly encoded subject/body (RFC 6068: CRLF line breaks). */
export function buildMailto({ to = CONTACT_EMAIL, subject = "", body = "" } = {}) {
  const params = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) {
    const crlf = String(body).replace(/\r?\n/g, "\r\n");
    params.push(`body=${encodeURIComponent(crlf)}`);
  }
  return `mailto:${to}${params.length ? `?${params.join("&")}` : ""}`;
}
