// No credentials or production writes: execute real handlers with in-memory dependencies.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
let user = null, role = null;
let rows = [
  { player_id: "gah-2", team_id: "gyeonggi-aviation-roster", hidden: true },
  { player_id: "custom-public", team_id: "ansan-technical-roster", hidden: false },
  { player_id: "custom-private", team_id: "gd-roster", hidden: false },
  { player_id: "gah-52", team_id: "gd-roster", hidden: false },
];
let settings = { visibleRegions: ["경기", "인천"], editingRegions: ["서울"] };
const db = {
  from(table) {
    assert.equal(table, "roster_players");
    let scopedRows = rows;
    return { select() { return this; }, order() { return this; },
      in(column, ids) { scopedRows = rows.filter((row) => ids.includes(row[column])); return this; },
      range() { return Promise.resolve({ data: scopedRows, error: null }); } };
  },
  storage: { from() { return { download: async () => ({ data: { text: async () => JSON.stringify(settings) }, error: null }) }; } },
};
const cache = new Map();
function load(file) {
  file = path.resolve(root, file);
  if (!path.extname(file)) file += ".ts";
  if (file.endsWith("api-auth.ts")) return { apiUser: async () => user, apiAdmin: async () => ({ user, role }),
    configuredAdminRole: () => role, validPlayerId: () => true, validTeamId: () => true };
  if (file.endsWith(path.join("supabase", "admin.ts"))) return { createSupabaseAdminClient: () => db };
  if (cache.has(file)) return cache.get(file).exports;
  if (file.endsWith(".json")) return JSON.parse(fs.readFileSync(file, "utf8"));
  const module = { exports: {} }; cache.set(file, module);
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true,
  } }).outputText;
  new Function("require", "module", "exports", code)((spec) => spec.startsWith(".")
    ? load(path.resolve(path.dirname(file), spec)) : require(spec), module, module.exports);
  return module.exports;
}
(async () => {
  // Ensure the server's legacy ID index cannot drift unnoticed.
  const legacy = {};
  for (const file of fs.readdirSync(path.join(root, "app")).filter((name) => name.endsWith("-roster.tsx"))) {
    for (const match of fs.readFileSync(path.join(root, "app", file), "utf8").matchAll(/\{ id: "([^"]+)", number:/g)) {
      legacy[match[1]] = file.slice(0, -4);
    }
  }
  assert.deepEqual(load("app/legacy-player-teams.json"), legacy);
  const access = await load("app/public-access.ts").publicAccess();
  assert.equal(access.team("gyeonggi-aviation-roster"), true);
  assert.equal(access.team("gd-roster"), false);
  assert.equal(access.player("gah-40"), true);
  assert.equal(access.player("gah-2"), false, "hidden player");
  assert.equal(access.player("gah-52"), false, "transferred to private region");
  assert.equal(access.player("custom-public"), true);
  assert.equal(access.player("custom-private"), false);
  assert.equal(access.player("unknown-id"), false);
  assert.equal(access.player("gd-roster--custom-public"), false, "forged team namespace");
  assert.equal(access.media("youtube/custom-public/pitching/abcdefghijk"), true);
  assert.equal(access.media("youtube/custom-private/pitching/abcdefghijk"), false);
  for (const id of ["gah-40", "gah-2", "gah-52", "custom-public", "custom-private", "unknown-id"]) {
    const scoped = await load("app/public-access.ts").publicAccess([id]);
    assert.equal(scoped.player(id), access.player(id), "scoped visibility: " + id);
    assert.equal(scoped.player(id === "gah-40" ? "custom-public" : "gah-40"), false, "deny outside scope");
  }
  assert.equal((await load("app/public-access.ts").publicAccess([])).player("gah-40"), false);
  settings = { visibleRegions: [], editingRegions: ["경기"] };
  assert.equal((await load("app/public-access.ts").publicAccess()).player("gah-40"), false);
  const protectedRoutes = [
    ["likes", "POST", 401], ["community/posts", "POST", 401],
    ["community/comments", "POST", 401], ["community/comments", "DELETE", 401],
    ["community/moderation", "POST", 401], ["community/notifications", "GET", 401],
    ["member-profile", "GET", 401], ["member-profile", "PATCH", 401],
    ["player-profiles", "PUT", 403], ["player-origins", "PUT", 403],
    ["media", "POST", 403], ["media", "DELETE", 403],
    ["roster-players", "POST", 403], ["roster-players", "PUT", 403],
    ["admin/members-export", "GET", 403],
  ];
  for (const [route, method, status] of protectedRoutes) {
    const response = await load("app/api/" + route + "/route.ts")[method](new Request("http://test/api/" + route, { method }));
    assert.equal(response.status, status, route + " " + method);
  }
  // An ordinary member must not gain admin privileges.
  user = { id: "member", email: "member@example.test" };
  for (const [route, method] of protectedRoutes.filter(([, , status]) => status === 403)) {
    const response = await load("app/api/" + route + "/route.ts")[method](new Request("http://test/api/" + route, { method }));
    assert.equal(response.status, 403, "member: " + route);
  }
  console.log("PASS: public visibility, hidden/transferred/unknown players, legacy index, guest write denial, member admin denial");
})().catch((error) => { console.error(error); process.exitCode = 1; });
