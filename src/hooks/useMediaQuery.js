import { useEffect, useState } from "react";

export default function useMediaQuery(query) {
  const getMatches = () => {
    if (globalThis.window === undefined || !globalThis.matchMedia) {
      return false;
    }
    return globalThis.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    if (globalThis.window === undefined || !globalThis.matchMedia) {
      return undefined;
    }

    const mediaQuery = globalThis.matchMedia(query);
    const onChange = event => setMatches(event.matches);

    setMatches(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener !== "function") {
      return undefined;
    }

    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
