/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const rows = new Map();
let publicPlayer = true;
let lookupError = null;
const db = {
  from(table) {
    assert.equal(table, "roster_players");
    let playerId = "";
    return {
      select() { return this; },
      eq(column, value) { assert.equal(column, "player_id"); playerId = value; return this; },
      async maybeSingle() { return { data: rows.get(playerId) || null, error: lookupError }; },
      async upsert(row, options) {
        assert.equal(options.onConflict, "player_id");
        assert.equal(options.ignoreDuplicates, true);
        if (!rows.has(row.player_id)) rows.set(row.player_id, row);
        return { error: null };
      },
    };
  },
};
function load(file) {
  file = path.resolve(root, file);
  if (!path.extname(file)) file += ".ts";
  if (file.endsWith("public-access.ts")) return { publicAccess: async () => ({ player: () => publicPlayer }) };
  if (file.endsWith(path.join("supabase", "admin.ts"))) return { createSupabaseAdminClient: () => db };
  if (file.endsWith(".json")) return JSON.parse(fs.readFileSync(file, "utf8"));
  const loadedModule = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true,
  } }).outputText;
  new Function("require", "module", "exports", code)((spec) => spec.startsWith(".")
    ? load(path.resolve(path.dirname(file), spec)) : require(spec), loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

(async () => {
  const { resolveSubmissionPlayer, ensureProfileRosterPlayer } = load("app/submission-player.ts");
  assert.deepEqual(await resolveSubmissionPlayer(db, "gangneung-roster", "gl-7"), { name: "김다원" });
  assert.equal(await resolveSubmissionPlayer(db, "gyeonggi-roster", "gl-7"), null);
  assert.equal(await resolveSubmissionPlayer(db, "gangneung-roster", "unknown"), null);
  publicPlayer = false;
  assert.equal(await resolveSubmissionPlayer(db, "gangneung-roster", "gl-7"), null);
  publicPlayer = true;
  rows.set("gl-7", { player_id: "gl-7", team_id: "gangneung-roster", name: "김다원", hidden: true });
  assert.equal(await resolveSubmissionPlayer(db, "gangneung-roster", "gl-7"), null);
  rows.set("gl-7", { player_id: "gl-7", team_id: "other-roster", name: "김다원", hidden: false });
  assert.equal(await resolveSubmissionPlayer(db, "gangneung-roster", "gl-7"), null);
  assert.deepEqual(await resolveSubmissionPlayer(db, "other-roster", "gl-7"), { name: "김다원" });
  rows.delete("gl-7");
  lookupError = new Error("database unavailable");
  await assert.rejects(resolveSubmissionPlayer(db, "gangneung-roster", "gl-7"));
  lookupError = null;
  assert.equal(await ensureProfileRosterPlayer(db, "gangneung-roster", "gl-7", "operator"), true);
  assert.equal(rows.get("gl-7").created, false);
  assert.equal(rows.get("gl-7").name, "김다원");
  rows.get("gl-7").hidden = true;
  assert.equal(await ensureProfileRosterPlayer(db, "gangneung-roster", "gl-7", "operator"), false);
  console.log("PASS: static roster submissions, access controls, managed overrides, approval materialization");
})().catch((error) => { console.error(error); process.exitCode = 1; });
