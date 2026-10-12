import { readFile, writeFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const origin = "https://getpathflow.com";
const dist = resolve("dist");
const serverDir = resolve(".prerender/server");
const template = await readFile(resolve(dist, "index.html"), "utf8");
const { render } = await import(pathToFileURL(resolve(serverDir, "entry-server.js")).href);

const pages = [
  {
    route: "/acquisitions/",
    output: "index.html",
    title: "AI Lead Follow-Up & Appointment Booking | Pathflow Acquisitions",
    description:
      "Convert inbound leads into booked appointments. Pathflow Acquisitions responds by SMS and voice, qualifies prospects, and automates follow-up.",
    schemaType: "SoftwareApplication",
  },
  {
    route: "/acquisitions/how-it-works",
    output: "how-it-works.html",
    title: "AI Lead Follow-Up: How It Works | Pathflow",
    description:
      "See how Pathflow Acquisitions automatically responds to leads, follows up by SMS and voice, qualifies prospects, and books appointments in your CRM.",
    schemaType: "WebPage",
  },
  {
    route: "/acquisitions/pricing",
    output: "pricing.html",
    title: "AI Lead Follow-Up & Booking Pricing | Pathflow",
    description:
      "Explore Pathflow Acquisitions pricing for AI lead response, qualification, persistent follow-up, and appointment booking. Usage is billed separately.",
    schemaType: "WebPage",
  },
  {
    route: "/acquisitions/contact",
    output: "contact.html",
    title: "Contact & Book a Demo | Pathflow Acquisitions",
    description:
      "Talk with Pathflow about automating lead follow-up, qualification, and booking for your business. Discuss integrations, setup, and tailored deployments.",
    schemaType: "WebPage",
  },
];

const escapeHtml = (value) =>
  value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

if (!template.includes('<div id="root"></div>')) {
  throw new Error("Prerender expected an empty #root in the Vite HTML template.");
}

for (const page of pages) {
  const canonical = origin + page.route;
  const schema =
    page.schemaType === "SoftwareApplication"
      ? {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Pathflow Acquisitions",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url: canonical,
          description: page.description,
          provider: { "@type": "Organization", name: "Pathflow", url: origin },
          featureList: [
            "Automated lead response",
            "AI lead qualification",
            "SMS and voice follow-up",
            "Appointment booking",
            "CRM integration",
          ],
        }
      : {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: page.title,
          description: page.description,
          url: canonical,
          isPartOf: { "@type": "WebSite", name: "Pathflow", url: origin },
        };

  const meta = [
    '<meta name="robots" content="index,follow" />',
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta property="og:title" content="${escapeHtml(page.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(page.description)}" />`,
    '<meta property="og:type" content="website" />',
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    '<meta property="og:image" content="https://getpathflow.com/acquisitions/images/acquisitions.png" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeHtml(page.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`,
    '<meta name="twitter:image" content="https://getpathflow.com/acquisitions/images/acquisitions.png" />',
    `<script type="application/ld+json">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script>`,
  ].join("\n    ");

  const content = render(page.route);
  if (!content.includes("<main") || !content.includes("<h1")) {
    throw new Error(`Expected prerendered marketing content at ${page.route}`);
  }

  const html = template
    .replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(page.title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/i,
      `<meta name="description" content="${escapeHtml(page.description)}" />`,
    )
    .replace("</head>", `    ${meta}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${content}</div>`);

  if (!html.includes('<meta name="description"') || !html.includes('rel="canonical"')) {
    throw new Error(`Failed to inject SEO metadata at ${page.route}`);
  }

  await writeFile(resolve(dist, page.output), html, "utf8");
  console.log(`Prerendered ${page.route} -> dist/${page.output}`);
}

await rm(resolve(".prerender"), { recursive: true, force: true });
