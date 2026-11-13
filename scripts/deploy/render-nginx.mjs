import { readFileSync, writeFileSync } from "node:fs";
import { isAbsolute } from "node:path";
import { pathToFileURL } from "node:url";

function httpsOrigin(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.origin !== value || url.username || url.password || url.port) throw new Error("Choose an exact HTTPS deployment origin on port 443.");
  if (!/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/.test(url.hostname)) throw new Error("The deployment hostname is invalid.");
  return url;
}
function safePath(value) {
  if (!value || !isAbsolute(value) || !/^\/[a-zA-Z0-9_./-]+$/.test(value) || value.split("/").includes("..")) throw new Error("Use a confirmed absolute Nginx filesystem path.");
  return value;
}
function escaped(hostname) { return hostname.replaceAll(".", "\\."); }

/** Produces review-only text. It never copies a file to /etc/nginx or reloads it. */
export function renderBangbuyNginx(config) {
  if (!config.storefrontOrigin) throw new Error("The fresh public storefront hostname has not been selected.");
  const storefront = httpsOrigin(config.storefrontOrigin), commerce = httpsOrigin(config.commerceOrigin);
  if (storefront.hostname === commerce.hostname) throw new Error("Catalog and commerce must use distinct hostnames.");
  const legacy = config.legacyCommerceOrigins.map(httpsOrigin);
  if (legacy.some(url => url.origin === storefront.origin)) throw new Error("Do not assign a known legacy commerce hostname to the public catalog.");
  const upstream = new URL(config.applicationUpstream);
  if (upstream.protocol !== "http:" || upstream.hostname !== "127.0.0.1" || !/^\d+$/.test(upstream.port) || upstream.pathname !== "/" || upstream.search || upstream.hash || upstream.username || upstream.password) throw new Error("Use only the confirmed loopback application listener.");
  for (const key of ["commerceCertificate", "commerceCertificateKey", "storefrontCertificate", "storefrontCertificateKey", "uploadsDirectory"]) safePath(config[key]);
  const aliases = legacy.filter(url => url.origin !== commerce.origin).map(url => url.hostname);
  const commonProxy = `proxy_set_header Host $host;\n        proxy_set_header X-Forwarded-Host $host;\n        proxy_set_header X-Forwarded-Proto https;\n        proxy_set_header X-Forwarded-For $remote_addr;\n        proxy_set_header Forwarded \"\";\n        proxy_pass ${upstream.origin};`;
  const hostGuard = host => `if ($host !~* ^${escaped(host)}$) { return 421; }`;
  const configuration = `# REVIEW ONLY. NOT INSTALLED. Re-confirm the actual BangBuy PM2/upstream/TLS configuration.\n# Blocker: retain legacy commerce hosts (${aliases.join(", ") || "none"}) until their per-host compatibility is proven.\n# This candidate does not configure or replace those compatibility vhosts.\n# Do not remove the current combined apex/www vhost or enable strict origins while this blocker remains.\n# Merge only into BangBuy configuration; no default_server or other application is changed.\n\nmap $uri $bangbuy_deployment_route_class {\n    default document;\n    ~^/(?:[a-z]{2,3}(?:-[A-Za-z0-9]+)?/)?orders(?:/|$) private_order;\n    ~^/api/payments/ payment_api;\n    ~^/api/ api;\n    ~^/_next/ static_asset;\n}\nlog_format bangbuy_deployment '$request_method $bangbuy_deployment_route_class $status';\n\nserver {\n    listen 80;\n    server_name ${storefront.hostname} ${commerce.hostname};\n    access_log /var/log/nginx/bangbuy-http.log bangbuy_deployment;\n    error_log /dev/null crit;\n    if ($host !~* ^(?:${escaped(storefront.hostname)}|${escaped(commerce.hostname)})$) { return 421; }\n    return 308 https://$host$request_uri;\n}\n\nserver {\n    listen 443 ssl;\n    server_name ${storefront.hostname};\n    ssl_certificate ${config.storefrontCertificate};\n    ssl_certificate_key ${config.storefrontCertificateKey};\n    ssl_protocols TLSv1.2 TLSv1.3;\n    ${hostGuard(storefront.hostname)}\n    client_max_body_size 6m;\n    access_log /var/log/nginx/bangbuy-storefront.log bangbuy_deployment;\n    error_log /dev/null crit;\n    add_header Referrer-Policy no-referrer always;\n\n    location ~ ^/api/(?:products(?:/[^/]+)?|categories(?:/[^/]+)?|brands(?:/[^/]+)?|manufacturers(?:/[^/]+)?|reviews|catalog/(?:search|facets))$ {\n        limit_except GET { deny all; }\n        ${commonProxy}\n    }\n    location ~ ^/api/public/language$ {\n        limit_except GET POST { deny all; }\n        ${commonProxy}\n    }\n    location /api/ { return 404; }\n    location / {\n        ${commonProxy}\n    }\n}\n\nserver {\n    listen 443 ssl;\n    server_name ${commerce.hostname};\n    ssl_certificate ${config.commerceCertificate};\n    ssl_certificate_key ${config.commerceCertificateKey};\n    ssl_protocols TLSv1.2 TLSv1.3;\n    ${hostGuard(commerce.hostname)}\n    client_max_body_size 6m;\n    access_log /var/log/nginx/bangbuy-commerce.log bangbuy_deployment;\n    error_log /dev/null crit;\n    add_header Referrer-Policy no-referrer always;\n    # Application proxy adds the private CSP and performs origin/CSRF checks.\n    # Never add credentialed CORS, rewrite Origin, or broaden cookie Domain.\n    location /uploads/ {\n        alias ${config.uploadsDirectory.replace(/\/$/, "")}/;\n        autoindex off;\n        expires 1y;\n        add_header X-Content-Type-Options nosniff always;\n    }\n    location / {\n        ${commonProxy}\n    }\n}\n`;
  return { configuration, warnings: ["Current SSH/service/TLS-path verification is required.", ...(aliases.length ? [`Legacy compatibility is unresolved for: ${aliases.join(", ")}. Do not cut over.`] : []), "No production install, reload, DNS change or deployment is performed."] };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const args = process.argv.slice(2); const value = name => { const index = args.indexOf(name); return index < 0 ? undefined : args[index + 1]; };
    const source = value("--config"), output = value("--output");
    if (!source || !output || !isAbsolute(output) || output.startsWith("/etc/")) throw new Error("Use a configuration file and an absolute task-workspace output path, never /etc.");
    const rendered = renderBangbuyNginx(JSON.parse(readFileSync(source, "utf8")));
    writeFileSync(output, rendered.configuration, { flag: "wx", mode: 0o600 });
    console.log(JSON.stringify({ status: "draft_only", output, warnings: rendered.warnings }, null, 2));
  } catch { console.error(JSON.stringify({ code: "NGINX_DRAFT_CONFIGURATION_REJECTED" })); process.exitCode = 1; }
}
