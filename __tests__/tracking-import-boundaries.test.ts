import { readFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

function files(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? files(path) : /\.(?:ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}
function imports(path: string): string[] {
  const source = ts.createSourceFile(path, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true);
  const result: string[] = [];
  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node) && !node.importClause?.isTypeOnly && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.importClause?.namedBindings;
      if (clause && ts.isNamedImports(clause) && clause.elements.length > 0 && clause.elements.every(entry => entry.isTypeOnly) && !node.importClause?.name) return;
      const specifier = node.moduleSpecifier.text;
      const base = specifier.startsWith("@/") ? resolve(specifier.slice(2)) : specifier.startsWith(".") ? resolve(dirname(path), specifier) : null;
      if (base) {
        const target = [base + ".ts", base + ".tsx", resolve(base, "index.ts"), resolve(base, "index.tsx")].find(candidate => existsSync(candidate));
        if (target) result.push(target);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source); return result;
}
function reachable(entry: string, visited = new Set<string>()): Set<string> {
  const path = resolve(entry);
  if (visited.has(path)) return visited;
  visited.add(path);
  for (const dependency of imports(path)) reachable(dependency, visited);
  return visited;
}

describe("marketing dependency and root-document boundaries", () => {
  it("has genuine independent roots without a persistent parent layout", () => {
    expect(existsSync("app/layout.tsx")).toBe(false);
    for (const root of ["app/(shop)/layout.tsx", "app/(private-commerce)/layout.tsx"]) {
      expect(readFileSync(root, "utf8")).toContain("DocumentFrame");
    }
    const frame = readFileSync("components/layout/DocumentFrame.tsx", "utf8");
    expect(frame).toContain("<html"); expect(frame).toContain("<body");
  });

  it.each(files("app/(private-commerce)").filter(path => /(?:layout|page)\.tsx$/.test(path)))
    ("private entry %s cannot reach the browser SDK adapter", (entry) => {
      const graph = reachable(entry);
      expect(graph.has(resolve("lib/analytics/browser-pixel.ts"))).toBe(false);
      expect(graph.has(resolve("components/analytics/PublicTracking.tsx"))).toBe(false);
      for (const path of graph) {
        expect(readFileSync(path, "utf8"), path).not.toMatch(/connect\.facebook\.net\/en_US\/fbevents\.js|<noscript[^>]*>[\s\S]*facebook\.com\/tr/);
      }
    });

  it("keeps SDK code out of shared session and commerce bootstrap graphs", () => {
    for (const entry of ["app/providers.tsx", "components/layout/StoreHydrator.tsx", "features/cart/api.ts", "features/checkout/api.ts", "lib/analytics/meta-pixel.ts", "components/analytics/MarketingConsentControls.tsx"]) {
      expect(reachable(entry).has(resolve("lib/analytics/browser-pixel.ts")), entry).toBe(false);
    }
  });

  it("has one explicitly imported SDK transport and no global noscript fallback", () => {
    const applicationFiles = ["app", "components", "lib", "features"].flatMap(files).filter(path => !path.includes("/generated/") && !path.includes("/tests/"));
    const loaders = applicationFiles.filter(path => readFileSync(path, "utf8").includes("https://connect.facebook.net/en_US/fbevents.js"));
    expect(loaders).toEqual([resolve("lib/analytics/browser-pixel.ts")]);
    for (const root of ["app/(shop)/layout.tsx", "app/(private-commerce)/layout.tsx", "components/layout/DocumentFrame.tsx"]) {
      expect(readFileSync(root, "utf8")).not.toContain("<noscript");
    }
  });
});
