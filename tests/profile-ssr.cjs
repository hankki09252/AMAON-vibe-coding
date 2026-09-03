// Real Next server + local Supabase HTTP fixture. No production credentials or writes.
const assert = require("node:assert/strict");
const http = require("node:http");
const path = require("node:path");
const os = require("node:os");
const { spawn } = require("node:child_process");
const { chromium } = require(process.env.AMAON_PLAYWRIGHT_PATH || "playwright");
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const root = path.resolve(__dirname, "..");
const origin = "http://127.0.0.1:3197";
let privateRegion = false, databaseFailed = false, signRequests = 0;
const row = { player_id: "custom-ssr", origin_team_id: "ansan-technical-roster", team_id: "ansan-technical-roster", hidden: false, created: true, jersey_number: "41", name: "서버테스트선수", roster_year: 2026, position: "투수", grade: "2학년", height: 180, weight: 80, bats_throws: "우투우타", updated_at: "2026-09-03T00:00:00Z", updated_by: "private-operator@example.test" };
const hidden = { ...row, player_id: "custom-hidden", hidden: true, name: "비공개이름비밀" };
const database = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:3198");
  let result = [], status = 200;
  if (url.pathname.includes("region-visibility.json")) result = { visibleRegions: privateRegion ? [] : ["경기", "인천"], editingRegions: [] };
  else if (url.pathname === "/rest/v1/roster_players") {
    const id = url.searchParams.get("player_id")?.replace(/^eq\.|^in\.\(|\)$/g, "");
    result = [row, hidden].filter((item) => !id || item.player_id === id);
  } else if (url.pathname === "/rest/v1/player_profile_overrides") result = [];
  else if (url.pathname === "/rest/v1/media_items") {
    const id = url.searchParams.get("player_id")?.slice(3);
    result = [{ storage_key: `youtube/${id}/pitching/abcdefghijk`, player_id: id, category: "pitching", content_type: "video/youtube;orientation=portrait", uploaded_at: row.updated_at }];
    if (id === "custom-hidden") result.push({ ...result[0], storage_key: `gd/${id}/photo/private.jpg`, category: "photo", content_type: "image/jpeg" });
  } else if (url.pathname.includes("/object/sign/")) { signRequests++; result = { signedURL: "/private-file" }; }
  else if (url.pathname.startsWith("/auth/")) { status = 401; result = { message: "Not signed in" }; }
  if (databaseFailed && url.pathname.startsWith("/rest/")) { status = 503; result = { message: "Fixture unavailable" }; }
  await pause(80);
  res.writeHead(status, { "content-type": "application/json" }); res.end(JSON.stringify(result));
});
(async () => {
  await new Promise((resolve) => database.listen(3198, "127.0.0.1", resolve));
  const server = spawn(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), "start", "-p", "3197"], { cwd: root, windowsHide: true, env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:3198", NEXT_PUBLIC_SUPABASE_ANON_KEY: "fixture-anon", SUPABASE_SERVICE_ROLE_KEY: "fixture-server" }, stdio: ["ignore", "pipe", "pipe"] });
  let log = ""; server.stdout.on("data", d => log += d); server.stderr.on("data", d => log += d);
  let browser;
  try {
    for (let i = 0; i < 40; i++) { if (await fetch(origin).then(r => r.ok).catch(() => false)) break; await pause(250); }
    browser = await chromium.launch({ headless: true, channel: "msedge" });
    for (const width of [1440, 390]) {
      for (const [team, player, name] of [["ansan-technical-roster", "custom-ssr", row.name], ["gyeonggi-aviation-roster", "gah-40", "김동윤"]]) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        const errors = [], criticalRequests = [];
        page.on("pageerror", e => errors.push(e.message));
        await page.route("**/api/**", async route => {
          const url = new URL(route.request().url());
          if (["/api/media", "/api/player-profiles", "/api/roster-players"].includes(url.pathname) && url.searchParams.has("playerId")) criticalRequests.push(url.pathname);
          const data = url.pathname === "/api/region-visibility" ? { visibleRegions: ["경기", "인천"] } : url.pathname.startsWith("/api/team-") ? { items: {} } : { items: [] };
          await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(data) });
        });
        await page.addInitScript(() => { window.framesSeen = []; function sample() { if (document.querySelector(".member-home")) { const state = document.querySelector(".profile-entry-gate") ? "loading" : document.querySelector(".gd-modal") ? "profile" : "home"; if (window.framesSeen.at(-1) !== state) window.framesSeen.push(state); } requestAnimationFrame(sample); } requestAnimationFrame(sample); });
        const response = await page.goto(`${origin}/?team=${team}&player=${player}#${team}`, { waitUntil: "domcontentloaded" });
        const html = await response.text();
        assert.ok(html.includes(`aria-label="${name} 선수 프로필"`), "actual profile must be in server HTML");
        assert.ok(!html.includes('class="profile-entry-gate"'), "no preparation gate on ready SSR path");
        assert.ok(!html.includes(row.updated_by), "operator email must not be serialized");
        await page.getByRole("dialog", { name: `${name} 선수 프로필`, exact: true }).waitFor();
        await page.waitForTimeout(400);
        assert.deepEqual(await page.evaluate(() => window.framesSeen), ["profile"]);
        assert.deepEqual(criticalRequests, [], "no duplicate browser profile requests");
        assert.deepEqual(errors, [], "no hydration errors");
        await page.screenshot({ path: path.join(os.tmpdir(), `amaon-profile-ssr-${width}.png`) });
        await page.close();
      }
      console.log("PASS", width, "profile in first HTML, no loading scene, no duplicate fetch, no hydration errors");
    }
    const noJs = await browser.newPage({ javaScriptEnabled: false });
    await noJs.goto(`${origin}/?team=ansan-technical-roster&player=custom-ssr`, { waitUntil: "domcontentloaded" });
    await noJs.getByRole("dialog", { name: `${row.name} 선수 프로필`, exact: true }).waitFor();
    await noJs.close();
    const hiddenHtml = await fetch(`${origin}/?team=ansan-technical-roster&player=custom-hidden`).then(r => r.text());
    assert.ok(!hiddenHtml.includes(hidden.name)); assert.equal(signRequests, 0, "hidden photos never signed");
    const forged = await fetch(`${origin}/?team=gyeonggi-aviation-roster&player=custom-ssr`).then(r => r.text());
    assert.ok(!forged.includes(`aria-label="${row.name} 선수 프로필"`));
    privateRegion = true;
    const privateHtml = await fetch(`${origin}/?team=ansan-technical-roster&player=custom-ssr`).then(r => r.text());
    assert.ok(!privateHtml.includes(row.name), "visibility must not be cached");
    privateRegion = false; databaseFailed = true;
    const failure = await fetch(`${origin}/?team=ansan-technical-roster&player=custom-ssr`).then(r => r.text());
    assert.ok(!failure.includes(row.name), "data failure falls back without exposing partial data");
    console.log("PASS no-JS first render; hidden/wrong-team/private/failure fail closed; no private metadata");
  } catch (e) { console.error(log.slice(-1500)); throw e; }
  finally { if (browser) await browser.close(); server.kill(); database.closeAllConnections(); await new Promise(resolve => database.close(resolve)); }
})().catch(e => { console.error(e); process.exitCode = 1; });
