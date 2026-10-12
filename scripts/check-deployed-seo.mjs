// Read-only post-deploy smoke checks. Pages is deployed before the routing Worker.
// URLs on the Pages origin intentionally omit /acquisitions; canonical tags do not.
const mode = process.argv[2];
if (!["--pages-origin", "--production"].includes(mode)) {
  console.error("Usage: node scripts/check-deployed-seo.mjs --pages-origin|--production");
  process.exit(2);
}

const isProduction = mode === "--production";
const origin = isProduction
  ? "https://getpathflow.com"
  : "https://pathflow-acquisitions-website.pages.dev";
const base = isProduction ? "/acquisitions" : "";

const pages = [
  {
    path: "/",
    canonical: "https://getpathflow.com/acquisitions/",
    title: "AI Lead Follow-Up & Appointment Booking | Pathflow Acquisitions",
    h1: "Interest",
  },
  {
    path: "/how-it-works",
    canonical: "https://getpathflow.com/acquisitions/how-it-works",
    title: "AI Lead Follow-Up: How It Works | Pathflow",
    h1: "Your leads keep moving.",
  },
  {
    path: "/pricing",
    canonical: "https://getpathflow.com/acquisitions/pricing",
    title: "AI Lead Follow-Up & Booking Pricing | Pathflow",
    h1: "Simple pricing",
  },
  {
    path: "/contact",
    canonical: "https://getpathflow.com/acquisitions/contact",
    title: "Contact & Book a Demo | Pathflow Acquisitions",
    h1: "Let's talk.",
  },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function request(path, retries = 4) {
  const url = new URL(base + path, origin).toString();
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: { Accept: "text/html,application/xml;q=0.9,*/*;q=0.8" },
        redirect: "follow",
        signal: AbortSignal.timeout(12000),
      });
      return { url, response, body: await response.text() };
    } catch (error) {
      lastError = error;
      if (i < retries - 1) await sleep(2000);
    }
  }
  throw new Error(`Could not fetch ${url}: ${lastError}`);
}

const failures = [];
function check(condition, label) {
  if (!condition) failures.push(label);
}

for (const page of pages) {
  const { url, response, body } = await request(page.path);
  console.log(`[${response.status}] ${url}`);
  check(response.status === 200, `${url}: expected HTTP 200`);
  check(body.includes(`<title>${page.title.replaceAll("&", "&amp;")}</title>`), `${url}: wrong title`);
  check(body.includes(`rel="canonical" href="${page.canonical}"`), `${url}: wrong canonical`);
  check(body.includes("<main") && body.includes("<h1"), `${url}: no prerendered main/H1`);
  check(body.includes(page.h1), `${url}: missing page-specific content`);
  check(body.includes('name="description"'), `${url}: missing description`);
  check(body.includes('property="og:title"'), `${url}: missing Open Graph metadata`);
  check(body.includes('type="application/ld+json"'), `${url}: missing structured data`);
}

const sitemap = await request("/sitemap.xml");
console.log(`[${sitemap.response.status}] ${sitemap.url}`);
check(sitemap.response.status === 200, "sitemap: expected HTTP 200");
check(sitemap.body.includes("<urlset"), "sitemap: not XML");
for (const page of pages) {
  check(
    sitemap.body.includes(`<loc>${page.canonical}</loc>`),
    `sitemap: missing ${page.canonical}`,
  );
}

const missing = await request("/seo-smoke-test-route-that-does-not-exist");
console.log(`[${missing.response.status}] ${missing.url}`);
check(missing.response.status === 404, "missing route: expected HTTP 404");

if (failures.length > 0) {
  for (const failure of failures) console.error(`::error::${failure}`);
  process.exit(1);
}

console.log(`Acquisitions ${isProduction ? "production" : "Pages-origin"} smoke checks passed.`);
