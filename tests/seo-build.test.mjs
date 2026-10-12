import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const paths = [
  ["index.html", "https://getpathflow.com/acquisitions/"],
  ["how-it-works.html", "https://getpathflow.com/acquisitions/how-it-works"],
  ["pricing.html", "https://getpathflow.com/acquisitions/pricing"],
  ["contact.html", "https://getpathflow.com/acquisitions/contact"],
];

for (const [filename, canonical] of paths) {
  test(`prerendered ${filename} includes crawlable page copy and metadata`, async () => {
    const html = await readFile(new URL(`../dist/${filename}`, import.meta.url), "utf8");

    assert.match(html, /<main\b/);
    assert.match(html, /<h1\b/);
    assert.match(html, /<div id="root">[\s\S]+?<main\b/);
    assert.match(html, /<title>[^<]+<\/title>/);
    assert.match(html, /<meta name="description" content="[^"]+"\s*\/?>/);
    assert.ok(html.includes(`rel="canonical" href="${canonical}"`));
    assert.ok(html.includes(`property="og:url" content="${canonical}"`));
    assert.ok(html.includes('type="application/ld+json"'));
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
  });
}

test("all published routes appear in a valid XML sitemap", async () => {
  const xml = await readFile(new URL("../dist/sitemap.xml", import.meta.url), "utf8");
  assert.match(xml, /<urlset\b/);
  for (const [, canonical] of paths) {
    assert.ok(xml.includes(`<loc>${canonical}</loc>`), `Missing ${canonical}`);
  }
});

test("unknown marketing paths are excluded by Cloudflare route allowlist", async () => {
  const worker = await readFile(
    new URL("../workers/acquisitions-router/src/index.ts", import.meta.url),
    "utf8",
  );
  assert.match(worker, /publishedRoutes\.has\(path\)/);
  assert.match(worker, /status: 404/);
  assert.doesNotMatch(worker, /fallbackUrl/);
});
