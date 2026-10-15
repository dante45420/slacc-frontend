import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const SITE = "SLACC";

/**
 * Sets document.title to "<title> · SLACC" (or just "SLACC" when empty).
 * Re-applies after a language switch, when App resets the section title.
 */
export default function useDocumentTitle(title) {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  useEffect(() => {
    if (title === undefined || title === null) return;
    document.title = title ? `${title} · ${SITE}` : SITE;
  }, [title, lang]);
}
