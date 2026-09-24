import { readFileSync } from "node:fs";

const checks = [
  {
    name: "Vite base path",
    passed: readFileSync("vite.config.ts", "utf8").includes('base: "/acquisitions/"'),
    message: 'vite.config.ts must keep base: "/acquisitions/" so this site never builds for getpathflow.com root.',
  },
  {
    name: "No GitHub Pages deploy script",
    passed: !Object.keys(JSON.parse(readFileSync("package.json", "utf8")).scripts || {}).includes("deploy"),
    message: "package.json must not include a generic deploy script that can republish this site to GitHub Pages.",
  },
  {
    name: "No gh-pages package",
    passed: !JSON.stringify(JSON.parse(readFileSync("package.json", "utf8"))).includes("gh-pages"),
    message: "gh-pages must not be installed for this repo.",
  },
  {
    name: "Worker CORS stays on getpathflow",
    passed: !/vladimirbelsch\.com|vbnovikov\.github\.io/.test(
      readFileSync("workers/contact/wrangler.toml", "utf8"),
    ),
    message: "Worker CORS must not allow the private domain or GitHub Pages origin.",
  },
  {
    name: "Router route is path-scoped",
    passed:
      readFileSync("workers/acquisitions-router/wrangler.toml", "utf8").includes(
        'pattern = "getpathflow.com/acquisitions*"',
      ) &&
      !readFileSync("workers/acquisitions-router/wrangler.toml", "utf8").includes(
        'pattern = "getpathflow.com/*"',
      ),
    message: "The acquisitions router must only run on getpathflow.com/acquisitions*, never the root site.",
  },
];

const failedChecks = checks.filter((check) => !check.passed);

if (failedChecks.length > 0) {
  console.error("Deployment target verification failed:");
  for (const check of failedChecks) {
    console.error(`- ${check.name}: ${check.message}`);
  }
  process.exit(1);
}

console.log("Deployment target verified for getpathflow.com/acquisitions.");
