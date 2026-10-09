import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { usePageMeta } from "@/lib/seo";

/** Прокрутка наверх при смене маршрута. */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

/** Обёртка: задаёт title и meta description страницы. */
export function PageMeta({ title, description }: { title: string; description?: string }) {
  usePageMeta(title, description);
  return null;
}
