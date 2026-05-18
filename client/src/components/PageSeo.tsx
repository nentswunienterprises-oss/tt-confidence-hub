import { useEffect } from "react";

type JsonLdValue = Record<string, unknown> | Array<Record<string, unknown>>;

type PageSeoProps = {
  title: string;
  description: string;
  path: string;
  robots?: string;
  type?: string;
  jsonLd?: JsonLdValue;
};

const SITE_ORIGIN = "https://responseintegrity.co.za";
const SITE_NAME = "Response Integrity";
const TWITTER_CARD = "summary";

export function PageSeo({
  title,
  description,
  path,
  robots = "index, follow",
  type = "website",
  jsonLd,
}: PageSeoProps) {
  useEffect(() => {
    const canonicalUrl = new URL(path, SITE_ORIGIN).toString();
    const previousTitle = document.title;
    const cleanups: Array<() => void> = [];

    const restoreAttr = (
      element: Element,
      attrName: string,
      existed: boolean,
      previousValue: string | null
    ) => {
      cleanups.push(() => {
        if (!existed) {
          element.remove();
          return;
        }

        if (previousValue === null) {
          element.removeAttribute(attrName);
          return;
        }

        element.setAttribute(attrName, previousValue);
      });
    };

    const upsertMeta = (
      selector: string,
      keyAttr: "name" | "property",
      keyValue: string,
      content: string
    ) => {
      let element = document.head.querySelector(selector) as HTMLMetaElement | null;
      const existed = Boolean(element);
      const previousValue = element?.getAttribute("content") ?? null;

      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(keyAttr, keyValue);
        document.head.appendChild(element);
      }

      element.setAttribute("content", content);
      restoreAttr(element, "content", existed, previousValue);
    };

    const upsertLink = (selector: string, rel: string, href: string) => {
      let element = document.head.querySelector(selector) as HTMLLinkElement | null;
      const existed = Boolean(element);
      const previousValue = element?.getAttribute("href") ?? null;

      if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", rel);
        document.head.appendChild(element);
      }

      element.setAttribute("href", href);
      restoreAttr(element, "href", existed, previousValue);
    };

    const upsertJsonLd = (value: JsonLdValue) => {
      const selector = 'script[data-ri-seo="json-ld"]';
      let element = document.head.querySelector(selector) as HTMLScriptElement | null;
      const existed = Boolean(element);
      const previousText = element?.textContent ?? null;

      if (!element) {
        element = document.createElement("script");
        element.type = "application/ld+json";
        element.setAttribute("data-ri-seo", "json-ld");
        document.head.appendChild(element);
      }

      element.textContent = JSON.stringify(value);
      cleanups.push(() => {
        if (!existed) {
          element?.remove();
          return;
        }

        element.textContent = previousText;
      });
    };

    document.title = title;

    upsertMeta('meta[name="description"]', "name", "description", description);
    upsertMeta('meta[name="robots"]', "name", "robots", robots);
    upsertMeta('meta[property="og:title"]', "property", "og:title", title);
    upsertMeta('meta[property="og:description"]', "property", "og:description", description);
    upsertMeta('meta[property="og:type"]', "property", "og:type", type);
    upsertMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    upsertMeta('meta[property="og:site_name"]', "property", "og:site_name", SITE_NAME);
    upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", TWITTER_CARD);
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    upsertLink('link[rel="canonical"]', "canonical", canonicalUrl);

    if (jsonLd) {
      upsertJsonLd(jsonLd);
    }

    return () => {
      document.title = previousTitle;
      for (let index = cleanups.length - 1; index >= 0; index -= 1) {
        cleanups[index]();
      }
    };
  }, [description, jsonLd, path, robots, title, type]);

  return null;
}

export { SITE_NAME, SITE_ORIGIN };
