// Uses a local production build and mocked browser APIs. No production data writes.
const assert = require("node:assert/strict");
const path = require("node:path");
const os = require("node:os");
const { spawn } = require("node:child_process");
const { chromium } = require(process.env.AMAON_PLAYWRIGHT_PATH || "playwright");
const root = path.resolve(__dirname, "..");
const origin = "http://127.0.0.1:3197";
const server = spawn(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), "start", "-p", "3197"], {
  cwd: root, windowsHide: true, env: { ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:9", NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-only",
  }, stdio: ["ignore", "pipe", "pipe"],
});
let log = ""; server.stdout.on("data", (data) => log += data); server.stderr.on("data", (data) => log += data);
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
(async () => {
  let browser;
  try {
    for (let i = 0; i < 40; i++) {
      if (await fetch(origin).then((r) => r.ok).catch(() => false)) break;
      await pause(250);
    }
    browser = await chromium.launch({ headless: true, channel: "msedge" });
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = []; page.on("pageerror", (error) => errors.push(error.message));
      let mode = "valid", mediaRequests = 0, rosterFinished = false, mediaParallel = false;
      let targetedRequests = [], earlyFullRoster = false, optionalFinished = false;
      await page.route("**/api/**", async (route) => {
        const url = new URL(route.request().url());
        let data = { items: [] }, status = 200;
        if (url.pathname === "/api/region-visibility") data = { visibleRegions: ["경기", "인천"] };
        if (url.pathname === "/api/admin") { data = { isAdmin: false }; status = 401; }
        if (url.pathname === "/api/roster-players") {
          if (!url.searchParams.has("playerId") && await page.locator(".profile-entry-gate").count()) earlyFullRoster = true;
          if (url.searchParams.has("playerId")) targetedRequests.push(url.pathname);
          await pause(200);
          rosterFinished = true;
          data = { items: [{ playerId: "custom-test", teamId: "ansan-technical-roster", originTeamId: "ansan-technical-roster",
            hidden: false, player: { id: "custom-test", name: "테스트선수", number: "41", year: 2026, grade: "2학년", position: "투수", height: 180, weight: 80, batsThrows: "우투우타" } }] };
          if (mode === "failed") status = 503;
          if (url.searchParams.has("playerId")) data.items = data.items.filter((item) => item.playerId === url.searchParams.get("playerId"));
        }
        if (url.pathname === "/api/player-profiles" && url.searchParams.has("playerId")) targetedRequests.push(url.pathname);
        if (url.pathname === "/api/media") {
          mediaRequests++; mediaParallel = !rosterFinished;
          assert.ok(url.searchParams.has("playerId"), "shared link fetches only selected player's media");
          await pause(1200);
        }
        if (url.pathname.startsWith("/api/team-")) {
          data = { items: {}, banner: null, emblem: null };
          await pause(3000); optionalFinished = true;
        }
        await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(data) });
      });
      await page.addInitScript(() => {
        window.entryFrames = [];
        function sample() {
          const main = document.querySelector(".member-home");
          if (main) {
            const gate = document.querySelector(".profile-entry-gate");
            const profile = document.querySelector(".gd-modal");
            const visibleProfile = profile && getComputedStyle(profile).visibility === "visible";
            const frame = gate ? "gate" : visibleProfile ? "profile" : "home";
            if (window.entryFrames.at(-1) !== frame) window.entryFrames.push(frame);
          }
          requestAnimationFrame(sample);
        }
        requestAnimationFrame(sample);
      });
      for (const [team, player, name] of [
        ["gyeonggi-aviation-roster", "gah-40", "김동윤"],
        ["ansan-technical-roster", "custom-test", "테스트선수"],
      ]) {
        mediaRequests = 0;
        rosterFinished = false; mediaParallel = false; targetedRequests = []; earlyFullRoster = false; optionalFinished = false;
        const response = await page.goto(origin + "/?team=" + team + "&player=" + player + "#" + team);
        assert.equal(response.status(), 200, log);
        assert.ok((await response.text()).includes("profile-entry-pending"), "gate must exist in server HTML");
        await page.getByRole("dialog", { name: name + " 선수 프로필", exact: true }).waitFor({ timeout: 15000 });
        assert.deepEqual(await page.evaluate(() => window.entryFrames), ["gate", "profile"], "no intermediate home/team scene");
        assert.equal(mediaRequests, 1, "no duplicate team media load");
        assert.equal(mediaParallel, true, "media starts before roster response");
        assert.equal(earlyFullRoster, false, "no full directory load while profile pending");
        assert.equal(optionalFinished, false, "profile does not wait for optional decoration");
        assert.ok(targetedRequests.includes("/api/roster-players") && targetedRequests.includes("/api/player-profiles"));
        assert.equal(await page.locator(".profile-entry-gate").count(), 0);
        await page.screenshot({ path: path.join(os.tmpdir(), "amaon-profile-entry-" + width + ".png") });
      }
      await page.goto(origin + "/?team=ansan-technical-roster&player=missing#ansan-technical-roster");
      await page.getByRole("alert").filter({ hasText: "찾을 수 없습니다" }).waitFor({ timeout: 15000 });
      assert.ok(!(await page.evaluate(() => window.entryFrames)).includes("home"));
      await page.goto(origin + "/?team=gd-roster&player=13#gd-roster");
      await page.getByRole("alert").filter({ hasText: "찾을 수 없습니다" }).waitFor();
      mode = "failed";
      await page.goto(origin + "/?team=ansan-technical-roster&player=custom-test#ansan-technical-roster");
      await page.getByRole("alert").waitFor();
      assert.deepEqual(errors, [], "no client or hydration errors");
      console.log("PASS", width, "SSR gate, delayed static/custom profiles, single reveal, one media request, missing/private/failed links");
      await page.close();
    }
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
})().catch((error) => { console.error(error, log.slice(-1500)); process.exitCode = 1; });
