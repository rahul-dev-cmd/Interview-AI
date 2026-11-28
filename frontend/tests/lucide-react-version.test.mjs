import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

// Guard the dependency pin that carries the breaking `getClassNames` change
// (lucide-react returns `string[]` instead of a spread-prone string as of 1.75.0).
const MIN_LUCIDE_VERSION = [1, 75, 0];

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
  // Strip semver operators (`^`, `~`, `>=`, ...) so `^1.75.0` -> `1.75.0`.
  return String(range).trim().replace(/^[~^>=<v\s]+/, "").split(/[\s|]/)[0];
}

test("lucide-react is pinned to the version with the string[] getClassNames API", () => {
  const manifest = JSON.parse(
    readFileSync(path.join(projectRoot, "package.json"), "utf8"),
  );
  const range = manifest.dependencies?.["lucide-react"];
  assert.ok(range, "lucide-react must stay a direct dependency");

  const declared = declaredVersion(range);
  assert.match(declared, /^\d+\.\d+\.\d+$/, `unparseable lucide-react range: ${range}`);
  assert.ok(
    isAtLeast(parseVersion(declared), MIN_LUCIDE_VERSION),
    `expected lucide-react >= ${MIN_LUCIDE_VERSION.join(".")} (getClassNames returns string[]), found ${range}`,
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
});
