interface Env {
  PAGES_ORIGIN: string;
  SITE_PREFIX?: string;
}

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

    const upstreamUrl = new URL(env.PAGES_ORIGIN);
    upstreamUrl.pathname = url.pathname.slice(prefix.length) || "/";
    upstreamUrl.search = url.search;

    const response = await fetch(new Request(upstreamUrl.toString(), request));

    if (response.status !== 404 || !isNavigationRequest(request)) {
      return response;
    }

    const fallbackUrl = new URL(env.PAGES_ORIGIN);
    fallbackUrl.pathname = "/index.html";
    return fetch(new Request(fallbackUrl.toString(), request));
  },
} satisfies ExportedHandler<Env>;

function normalizePrefix(prefix: string): string {
  const normalized = `/${prefix.replace(/^\/+|\/+$/g, "")}`;
  return normalized === "/" ? "/acquisitions" : normalized;
}

function isNavigationRequest(request: Request): boolean {
  const accept = request.headers.get("Accept") || "";
  return request.method === "GET" && accept.includes("text/html");
}
