// Production-safe smoke: anonymous reads only; never submits a member/admin mutation.
const assert = require("node:assert/strict");
const path = require("node:path");
const os = require("node:os");
const { chromium } = require(process.env.AMAON_PLAYWRIGHT_PATH || "playwright");
const base = process.env.AMAON_BASE_URL || "https://www.amaon.kr";
(async () => {
  const browser = await chromium.launch({ headless: true, channel: process.env.AMAON_TEST_BROWSER_CHANNEL || "msedge" });
  try {
    const context = await browser.newContext();
    const api = context.request;
    for (const endpoint of ["/api/region-visibility", "/api/roster-players",
      "/api/player-profiles?teamId=gyeonggi-aviation-roster",
      "/api/player-origins?teamId=gyeonggi-aviation-roster",
      "/api/media?playerId=custom-77304915-e13b-4199-9700-d14d8bc67fcc",
      "/api/likes", "/api/video-rankings", "/api/community/posts", "/api/member-stats",
      "/api/team-banners?teamId=gyeonggi-aviation-roster",
      "/api/team-emblems?teamId=gyeonggi-aviation-roster"]) {
      const response = await api.get(base + endpoint);
      assert.equal(response.status(), 200, endpoint);
      const data = await response.json();
      assert.ok(!JSON.stringify(data).includes("updated_by"));
      if (endpoint === "/api/community/posts") {
        assert.equal(data.userId, null);
        assert.equal(data.isAdmin, false);
        for (const post of data.items) {
          assert.ok(!post.author_id && !post.author?.email && !post.author?.user_id);
        }
      }
      if (endpoint === "/api/roster-players") {
        for (const row of data.items) {
          assert.ok(!row.updatedBy);
          if (row.hidden) assert.ok(!row.player, "private roster details must not be returned");
        }
      }
      console.log("PASS public GET", endpoint);
    }
    for (const endpoint of ["/api/member-profile", "/api/community/notifications", "/api/admin/members-export"]) {
      const response = await api.get(base + endpoint);
      assert.ok([401, 403].includes(response.status()), endpoint);
      console.log("PASS protected GET", endpoint);
    }
    const page = await context.newPage();
    const errors = []; page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base, { waitUntil: "domcontentloaded" });
    await page.locator(".topbar a[href='/login']").waitFor();
    await page.locator(".topbar a[href='/login?mode=signup']").waitFor();
    assert.ok(!page.url().includes("/login"));
    await page.locator(".community-post").first().waitFor({ timeout: 30000 });
    assert.equal(await page.locator(".community-compose").count(), 0);
    assert.equal(await page.locator(".community-comments input").count(), 0);
    await page.locator(".video-ranking-card").first().waitFor({ timeout: 30000 });
    await page.locator("#community").scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(os.tmpdir(), "amaon-public-desktop.png") });
    await page.goto(base + "/?team=ansan-technical-roster&player=custom-77304915-e13b-4199-9700-d14d8bc67fcc#ansan-technical-roster");
    await page.getByRole("dialog", { name: "윤지환 선수 프로필", exact: true }).waitFor({ timeout: 30000 });
    assert.ok(!page.url().includes("/login"));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base);
    await page.getByRole("button", { name: "전체 메뉴 열기" }).click();
    await page.locator(".mobile-logout-link").filter({ hasText: "회원가입" }).waitFor();
    await page.locator(".mobile-member-card").filter({ hasText: "로그인" }).waitFor();
    await page.waitForTimeout(500); // Let the drawer transition settle for visual QA.
    await page.screenshot({ path: path.join(os.tmpdir(), "amaon-public-mobile.png") });
    assert.deepEqual(errors, []);
    console.log("PASS: anonymous home/profile/board/rankings; desktop/mobile login/signup; no JS errors");
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
