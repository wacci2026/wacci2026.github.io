"use client";

import { useEffect, useState } from "react";

const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";

/**
 * Keeps viewport-triggered animation out of mobile and tablet webviews, where
 * IntersectionObserver support can be unreliable. The first render is static
 * so content is never hidden before the browser has evaluated the media query.
 */
export function useDesktopMotion() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const update = () => setIsDesktop(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isDesktop;
}
