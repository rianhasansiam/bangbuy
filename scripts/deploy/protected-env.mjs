import { lstatSync, readFileSync, realpathSync, statSync } from "node:fs";
import { isAbsolute, relative, sep } from "node:path";
import { parse } from "dotenv";

/** Read configuration without logging values or putting secrets in PM2 metadata. */
export function readProtectedEnvironment(file, { releaseRoot } = {}) {
  if (!file || !isAbsolute(file)) throw new Error("An absolute protected environment file is required.");
  if (!lstatSync(file).isFile()) throw new Error("The protected environment must not be a symlink.");
  const path = realpathSync(file);
  const stat = statSync(path);
  if (!stat.isFile() || stat.size > 128 * 1024) throw new Error("The protected environment must be a bounded regular file.");
  if (stat.mode & 0o077) throw new Error("The protected environment file must have owner-only permissions.");
  if (typeof process.getuid === "function" && stat.uid !== process.getuid()) throw new Error("The service owner must own its environment file.");
  if (releaseRoot) {
    const within = relative(realpathSync(releaseRoot), path);
    const outside = within === ".." || within.startsWith(`..${sep}`) || isAbsolute(within);
    if (!outside) throw new Error("Keep the protected environment outside the release checkout.");
  }
  const values = parse(readFileSync(path));
  if (Object.keys(values).some(key => /^NEXT_PUBLIC_.*(?:TOKEN|SECRET|PASSWORD|PRIVATE)/i.test(key))) throw new Error("Server credentials must not use public environment names.");
  return values;
}

/** Protected configuration takes precedence over inherited process settings. */
export function loadApplicationEnvironment(file, { releaseRoot, inherited = process.env } = {}) {
  const supplied = readProtectedEnvironment(file, { releaseRoot });
  const safe = Object.fromEntries(Object.entries(inherited).filter(([key]) => !key.startsWith("DOTENV_")));
  return { ...safe, ...supplied, NODE_ENV: "production" };
}
