import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

// lucide-react 1.83.0 removes five lab icons (bowl-chopsticks, burger,
// card-credit, football, pac-man-ghost). The dependency must be pinned to a
// release that carries the current icon set, and the app must not import any
// of the removed names.
const MIN_LUCIDE_VERSION = [1, 83, 0];

const REMOVED_ICON_EXPORTS = [
  "BowlChopsticks",
  "Burger",
  "CardCredit",
  "Football",
  "PacManGhost",
];

const LUCIDE_CONSUMERS = [
  "src/app/page.tsx",
  "src/app/interview/page.tsx",
  "src/app/report/page.tsx",
  "src/app/setup/page.tsx",
  "src/components/Navbar.tsx",
];

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseVersion(version) {
  return version.split(".").map((part) => Number.parseInt(part, 10));
}

function isAtLeast(actual, minimum) {
  for (let i = 0; i < minimum.length; i += 1) {
    if (actual[i] > minimum[i]) return true;
    if (actual[i] < minimum[i]) return false;
  }
  return true;
}

function declaredVersion(range) {
  // Strip semver operators (`^`, `~`, `>=`, ...) so `^1.83.0` -> `1.83.0`.
  return String(range).trim().replace(/^[~^>=<v\s]+/, "").split(/[\s|]/)[0];
}

function importedIconNames(source, file) {
  const match = source.match(/import\s*\{([\s\S]*?)\}\s*from\s*["']lucide-react["']/);
  assert.ok(match, `${file} must keep importing icon components from lucide-react`);
  return match[1]
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
}

test("lucide-react is pinned to the 1.83.0 icon set without removed lab icons", () => {
  const manifest = JSON.parse(
    readFileSync(path.join(projectRoot, "package.json"), "utf8"),
  );
  const range = manifest.dependencies?.["lucide-react"];
  assert.ok(range, "lucide-react must stay a direct dependency");

  const declared = declaredVersion(range);
  assert.match(declared, /^\d+\.\d+\.\d+$/, `unparseable lucide-react range: ${range}`);
  assert.ok(
    isAtLeast(parseVersion(declared), MIN_LUCIDE_VERSION),
    `expected lucide-react >= ${MIN_LUCIDE_VERSION.join(".")} (icon set update), found ${range}`,
  );

  const lockfile = JSON.parse(
    readFileSync(path.join(projectRoot, "package-lock.json"), "utf8"),
  );
  assert.equal(
    lockfile.packages?.[""]?.dependencies?.["lucide-react"],
    range,
    "package-lock.json must record the same lucide-react range as package.json",
  );

  const locked = lockfile.packages?.["node_modules/lucide-react"]?.version;
  assert.match(String(locked), /^\d+\.\d+\.\d+$/, `unparseable locked lucide-react version: ${locked}`);
  assert.ok(
    isAtLeast(parseVersion(locked), MIN_LUCIDE_VERSION),
    `expected locked lucide-react >= ${MIN_LUCIDE_VERSION.join(".")}, found ${locked}`,
  );

  const imported = new Set();
  for (const file of LUCIDE_CONSUMERS) {
    const source = readFileSync(path.join(projectRoot, file), "utf8");
    for (const name of importedIconNames(source, file)) imported.add(name);
  }

  assert.ok(imported.size > 0, "the app must import at least one lucide-react icon");
  for (const removed of REMOVED_ICON_EXPORTS) {
    assert.ok(
      !imported.has(removed),
      `${removed} was removed from lucide-react 1.83.0 but is still imported`,
    );
  }
});
