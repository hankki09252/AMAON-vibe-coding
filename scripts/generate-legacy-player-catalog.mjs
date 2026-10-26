import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = path.resolve(import.meta.dirname, "..");
const app = path.join(root, "app");
const catalog = {};

for (const file of fs.readdirSync(app).filter((name) => name.endsWith("-roster.tsx")).sort()) {
  const source = ts.createSourceFile(file, fs.readFileSync(path.join(app, file), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const teamId = file.slice(0, -4);
  const roster = source.statements
    .filter(ts.isVariableStatement)
    .flatMap((statement) => [...statement.declarationList.declarations])
    .find((declaration) => ["players", "gdPlayers"].includes(declaration.name.getText(source)))?.initializer;
  if (!roster || !ts.isArrayLiteralExpression(roster)) continue;
  for (const node of roster.elements) {
    if (!ts.isObjectLiteralExpression(node)) continue;
    const values = Object.fromEntries(node.properties.filter(ts.isPropertyAssignment).map((property) => {
      const value = property.initializer;
      return [property.name.getText(source), ts.isStringLiteral(value) || ts.isNumericLiteral(value) ? value.text : null];
    }));
    if (!values.id || !values.name || catalog[values.id]) throw new Error(`Duplicate or incomplete player in ${file}: ${values.id}`);
    catalog[values.id] = {
      teamId,
      name: values.name,
      number: values.number,
      year: Number(values.year || 2026),
      position: values.position,
      grade: values.grade,
      height: Number(values.height),
      weight: Number(values.weight),
      batsThrows: values.batsThrows,
    };
  }
}

const output = path.join(app, "legacy-player-catalog.json");
const content = JSON.stringify(catalog, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (!fs.existsSync(output) || fs.readFileSync(output, "utf8") !== content) {
    console.error("Legacy player catalog is out of date. Run: node scripts/generate-legacy-player-catalog.mjs");
    process.exitCode = 1;
  }
} else {
  fs.writeFileSync(output, content);
  console.log(`Generated ${Object.keys(catalog).length} players`);
}
