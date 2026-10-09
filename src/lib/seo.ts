import { useEffect } from "react";

const SITE = "Python Academy";

function setMeta(name: string, content: string, attr: "name" | "property" = "name"): void {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

/**
 * SEO-хук: title, description и Open Graph для каждой страницы.
 * При статической публикации HTML один, поэтому мета-теги обновляются на клиенте,
 * а основной description задан в index.html.
 */
export function usePageMeta(title: string, description?: string): void {
  useEffect(() => {
    document.title = title ? `${title} — ${SITE}` : SITE;
    if (description) {
      setMeta("description", description);
      setMeta("og:title", description ? `${title} — ${SITE}` : SITE, "property");
      setMeta("og:description", description, "property");
      setMeta("og:type", "website", "property");
      setMeta("og:url", window.location.href, "property");
    }
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = window.location.href;
    else {
      const link = document.createElement("link");
      link.rel = "canonical";
      link.href = window.location.href;
      document.head.appendChild(link);
    }
  }, [title, description]);
}
