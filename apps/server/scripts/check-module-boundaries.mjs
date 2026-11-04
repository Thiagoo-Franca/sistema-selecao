import fs from "node:fs";
import path from "node:path";
import { globSync } from "glob";

const modulesRoot = path.resolve("src/modules");
const violations = [];

for (const file of globSync("src/modules/**/*.ts")) {
  const sourcePath = path.resolve(file);
  const sourceModule = path.relative(modulesRoot, sourcePath).split(path.sep)[0];
  const source = fs.readFileSync(sourcePath, "utf8");

  for (const match of source.matchAll(/from\s+["'](\.\.[^"']+)["']/g)) {
    const importPath = match[1];
    const targetPath = path.resolve(path.dirname(sourcePath), importPath);
    const relativeTarget = path.relative(modulesRoot, targetPath);
    const targetModule = relativeTarget.split(path.sep)[0];

    if (
      !targetModule ||
      targetModule === ".." ||
      targetModule === sourceModule ||
      targetModule === "." ||
      path.basename(targetPath) === "index.js"
    ) {
      continue;
    }

    violations.push(`${file} imports ${importPath}; use ../${targetModule}/index.js`);
  }
}

if (violations.length > 0) {
  console.error("Module boundary violations:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log("Module boundaries are valid.");
}
