interface Env {
  PAGES_ORIGIN: string;
  SITE_PREFIX?: string;
}

const publishedRoutes = new Set([
  "/",
  "/how-it-works",
  "/pricing",
  "/contact",
]);

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const prefix = normalizePrefix(env.SITE_PREFIX || "/acquisitions");

    if (url.pathname === prefix) {
      url.pathname = `${prefix}/`;
      return Response.redirect(url.toString(), 308);
    }

    if (!url.pathname.startsWith(`${prefix}/`)) {
      return new Response("Not found", { status: 404 });
    }

    const path = url.pathname.slice(prefix.length);

    // Keep canonical route spelling consistent with the prerendered pages.
    if (path !== "/" && path.endsWith("/") && publishedRoutes.has(path.slice(0, -1))) {
      url.pathname = `${prefix}${path.slice(0, -1)}`;
      return Response.redirect(url.toString(), 308);
    }

    const isPublishedPage = publishedRoutes.has(path);
    const isStaticAsset =
      path === "/sitemap.xml" ||
      path === "/favicon.ico" ||
      path.startsWith("/assets/") ||
      path.startsWith("/images/");

    // Do not send an HTTP 200 SPA homepage for missing product paths.
    if (!isPublishedPage && !isStaticAsset) {
      return new Response("Not found", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const upstreamUrl = new URL(env.PAGES_ORIGIN);
    // Cloudflare Pages resolves extensionless routes to matching .html files.
    upstreamUrl.pathname = path;
    upstreamUrl.search = url.search;

    return fetch(new Request(upstreamUrl.toString(), request));
  },
} satisfies ExportedHandler<Env>;

function normalizePrefix(prefix: string): string {
  const normalized = `/${prefix.replace(/^\\/+|\\/+$/g, "")}`;
  return normalized === "/" ? "/acquisitions" : normalized;
}
