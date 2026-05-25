import { useLocation } from "react-router-dom";
import { PageSeo } from "@/components/PageSeo";
import { getRouteSeoDefinition } from "@/lib/publicSeo";

function normalizePathname(pathname: string) {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.replace(/\/+$/, "") || "/";
}

export function RouteSeoManager() {
  const location = useLocation();
  const pathname = normalizePathname(location.pathname);
  const definition = getRouteSeoDefinition(pathname);

  if (!definition || definition.injectInSpa === false) {
    return null;
  }

  return (
    <PageSeo
      title={definition.title}
      description={definition.description}
      path={pathname}
      robots={definition.robots}
      type={definition.type}
      image={definition.image}
      imageAlt={definition.imageAlt}
      twitterCard={definition.twitterCard}
      jsonLd={definition.jsonLd}
    />
  );
}
