// Isolated browser regression: all API calls use in-memory test data, never production.
// Run: node tests/video-rankings.cjs (or set AMAON_PLAYWRIGHT_PATH to a bundled Playwright).
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const os = require("node:os");
const ts = require("typescript");
const { chromium } = require(process.env.AMAON_PLAYWRIGHT_PATH || "playwright");
const root = path.resolve(__dirname, "..");

// Bundle the real component and React using the project's existing TypeScript compiler.
const modules = [];
const ids = new Map();
function bundle(file) {
  if (ids.has(file)) return ids.get(file);
  const id = modules.length;
  ids.set(file, id);
  modules.push("");
  let source = fs.readFileSync(file, "utf8");
  if (/\.tsx?$/.test(file)) source = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  source = source.replace(/require\(["']([^"']+)["']\)/g, (_, spec) => {
    let resolved;
    if (spec.startsWith(".")) {
      const base = path.resolve(path.dirname(file), spec);
      resolved = [base, `${base}.ts`, `${base}.tsx`, `${base}.js`].find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
    }
    resolved ||= require.resolve(spec, { paths: [path.dirname(file), root] });
    return `require(${bundle(resolved)})`;
  });
  modules[id] = `function(module,exports,require){${source}\n}`;
  return id;
}
const entry = bundle(path.join(__dirname, "fixtures/video-rankings.tsx"));
const js = `const process={env:{NODE_ENV:'production'}};const modules=[${modules.join(",")}];const cache={};function require(id){if(cache[id])return cache[id].exports;const m=cache[id]={exports:{}};modules[id](m,m.exports,require);return m.exports;}require(${entry});`;
new (require("node:vm").Script)(js);
const items = [1, 2].map((number) => ({ key: `youtube/test-${number}/pitching/abcdefghij${number}`, playerId: `test-${number}`, category: "pitching", contentType: "video/youtube", uploadedAt: "2026-09-03", likeCount: 0, liked: false, source: "youtube", videoId: `abcdefghij${number}`, thumbnailUrl: "/pixel.svg", url: "" }));
let mode = "success", posts = 0;
const server = http.createServer(async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.url === "/bundle.js") { res.setHeader("Content-Type", "text/javascript; charset=utf-8"); return res.end(js); }
  if (req.url === "/theme.css") { res.setHeader("Content-Type", "text/css"); return res.end(fs.readFileSync(path.join(root, "app/theme.css"))); }
  if (req.url === "/pixel.svg") { res.setHeader("Content-Type", "image/svg+xml"); return res.end('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180"><rect width="300" height="180" fill="#333"/></svg>'); }
  if (req.url === "/api/video-rankings") { res.setHeader("Content-Type", "application/json"); return res.end(JSON.stringify({ items })); }
  if (req.url === "/api/likes" && req.method === "POST") {
    posts++;
    let body = ""; for await (const chunk of req) body += chunk;
    await new Promise((resolve) => setTimeout(resolve, 250));
    res.setHeader("Content-Type", "application/json");
    if (mode !== "success") { res.statusCode = mode === "unauthorized" ? 401 : 500; return res.end(JSON.stringify({ error: "test failure" })); }
    const item = items.find((item) => item.key === JSON.parse(body).key);
    item.liked = !item.liked; item.likeCount = item.liked ? 1 : 0;
    return res.end(JSON.stringify({ key: item.key, count: item.likeCount, liked: item.liked }));
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end('<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif}</style><link rel="stylesheet" href="/theme.css"></head><body><div id="root"></div><script src="/bundle.js"></script></body></html>');
});

(async () => {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ headless: true, ...(process.env.AMAON_TEST_BROWSER_CHANNEL ? { channel: process.env.AMAON_TEST_BROWSER_CHANNEL } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.route("**/*", (route) => route.request().url().startsWith(origin) ? route.continue() : route.fulfill({ status: 200, contentType: "text/html", body: "Test video" }));
    const errors = []; page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(origin);
    const card = page.locator(".video-ranking-card").first();
    const heart = card.locator(".video-ranking-like-button");
    await heart.waitFor({ timeout: 8000 }).catch(async (error) => { console.error({ errors, body: await page.locator('body').innerText() }); throw error; });
    assert.equal(await card.locator("button button").count(), 0, "No nested buttons");
    await heart.click();
    await page.waitForFunction(() => document.querySelector('.video-ranking-like-button').getAttribute('aria-pressed') === 'true');
    assert.equal(await page.getByRole("dialog").count(), 0, "Liking must not play video");
    assert.equal(await heart.locator("strong").innerText(), "1");
    await page.reload(); await heart.waitFor();
    assert.equal(await heart.getAttribute("aria-pressed"), "true", "Server state survives reload");
    await heart.click();
    await page.waitForFunction(() => document.querySelector('.video-ranking-like-button').getAttribute('aria-pressed') === 'false');
    await card.locator(".video-ranking-play-trigger").click({ position: { x: 20, y: 30 } });
    const dialog = page.getByRole("dialog"); await dialog.waitFor();
    const modalHeart = dialog.locator(".video-ranking-like-button");
    const before = posts;
    await modalHeart.evaluate((button) => { button.click(); button.click(); });
    await page.waitForFunction(() => document.querySelector('.in-player').getAttribute('aria-pressed') === 'true');
    assert.equal(posts, before + 1, "Rapid clicks send one request");
    assert.equal(await heart.getAttribute("aria-pressed"), "true", "Modal and card agree");
    await page.getByRole("button", { name: "영상 닫기", exact: true }).click();
    mode = "error"; await heart.click();
    await page.getByRole("status").filter({ hasText: "저장하지 못했습니다" }).waitFor();
    assert.equal(await heart.getAttribute("aria-pressed"), "true", "Failure must not fake success");
    mode = "unauthorized"; await heart.click();
    await page.getByRole("status").filter({ hasText: "로그인 후 좋아요" }).waitFor();
    mode = "success";
    await page.setViewportSize({ width: 390, height: 844 });
    await heart.click();
    await page.waitForFunction(() => document.querySelector('.video-ranking-like-button').getAttribute('aria-pressed') === 'false');
    assert.equal(await page.getByRole("dialog").count(), 0, "Mobile heart must not play video");
    const box = await heart.boundingBox(); assert.ok(box.width >= 44 && box.height >= 44, "Mobile touch target");
    await page.screenshot({ path: path.join(os.tmpdir(), "amaon-ranking-mobile.png"), fullPage: true });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({ path: path.join(os.tmpdir(), "amaon-ranking-desktop.png"), fullPage: true });
    assert.deepEqual(errors, []);
    console.log("PASS: like/unlike, persistence, click separation, modal sync, duplicate guard, 500/401 feedback, mobile, no runtime errors");
  } finally { await browser.close(); server.close(); }
})().catch((error) => { console.error(error); server.close(); process.exitCode = 1; });
