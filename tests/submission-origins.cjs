/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const file = path.resolve(__dirname, "../app/submission-origins.ts");
const moduleRef = { exports: {} };
const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
new Function("module", "exports", code)(moduleRef, moduleRef.exports);
const { parseSubmittedOrigins, newOriginRows } = moduleRef.exports;

const origin = { region: "서울", school: "한강중", year: 2024, position: "투수" };
assert.deepEqual(parseSubmittedOrigins([{ ...origin, school: " 한강중 " }]), [origin]);
assert.equal(parseSubmittedOrigins([]), null);
assert.equal(parseSubmittedOrigins([{ ...origin, year: 1949 }]), null);
assert.equal(parseSubmittedOrigins([{ ...origin, school: "" }]), null);
assert.equal(parseSubmittedOrigins([{ ...origin, position: "" }]), null);
assert.equal(parseSubmittedOrigins([{ ...origin, school: "x".repeat(61) }]), null);
assert.equal(parseSubmittedOrigins(Array(11).fill(origin)), null);

const existing = [{ ...origin, sequence: 3 }];
assert.deepEqual(newOriginRows(existing, [origin]), []);
assert.deepEqual(newOriginRows(existing, [{ ...origin, school: "서강중" }]), [{ ...origin, school: "서강중", sequence: 4 }]);
assert.equal(newOriginRows(Array.from({ length: 10 }, (_, sequence) => ({ ...origin, school: `학교${sequence}`, sequence })), [origin]), null);
console.log("PASS: origin submission validation, duplicate handling, sequence, limit");
