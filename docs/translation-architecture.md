# Multilingual architecture

This implementation uses the official LibreTranslate Python package in a dedicated native virtual environment as the only automatic translation engine. The application renders stored translations independently of the native service.

## Project inspection and preserved infrastructure

The inspected runtime uses Node.js 26.8.1 and npm 11.19.0. The application uses Next.js 16.2.12 App Router and `proxy.ts`, React 19.2.4, next-intl 4.14.9, Prisma 7.9.1/PostgreSQL, Auth.js v5 credentials/Google OAuth, Redux cart/wishlist state, Zod validation, Tailwind 4, SSLCommerz and Airwallex. Relevant installed Next.js guides were read before changes. There is an existing protected admin panel and additive translation schema/workflow.

The existing implementation separates internationalization (`lib/i18n`, structured message catalogs, locale navigation and preferences) from automatic translation (`lib/translations/provider.ts`). Its former engine was Google Cloud Advanced v3 via `google-auth-library`; no other automatic translator SDK or scraper was found. Google OAuth and unrelated Google services remain intact. Existing working English/Bengali translations, preferences, SEO prefixes and database records were preserved.

The native implementation plan retains the existing server adapter, i18n and data. It inspects the actual platform and available ports, resolves a pinned official Python package in an isolated Python 3.11 venv, installs only English/Bengali models for initially published languages, binds the native service to loopback, then verifies real directed pairs and existing stored jobs/routes/SEO/business behavior. Native scripts and a future VPS runbook replace the previous incompatible infrastructure. No unrelated feature is rebuilt.

## Runtime and generation paths

`lib/i18n/registry.ts` centralizes BCP 47 codes, English/native names, direction, provider mappings and bundled catalog publication. Locale database rows add catalog completeness, review/publication status and actual outgoing provider pairs. English is the default; browser language, IP, country and geolocation never choose another language. An explicit locale URL takes precedence over the saved HttpOnly cookie/account preference. Manual switching preserves equivalent path, query and fragment; existing tab-local safe-draft recovery and submission guards remain. Sensitive or unsupported unsaved fields require the existing explicit leave decision rather than being silently stored.

Existing canonical prefixes remain: `/products` selects English and redirects to `/en/products` for a first visitor. `/bn/products` explicitly selects Bengali. Unsupported/disabled locales redirect to the equivalent English URL. English stays selectable and cannot be disabled. `skipProxyUrlNormalize` and raw-request-origin rewrites prevent Next.js loopback hostname normalization from turning internal locale rewrites into external self-requests.

Rendering uses only bundled or persisted reviewed catalogs and stored content. It never requests LibreTranslate. Publication and active catalogs have bounded server caches; source/context hashes invalidate stored content. Missing content is explicitly labelled with its actual source language and an availability notice. Pages without complete translated primary content do not advertise that language as ready for SEO.

Static generation runs through explicit CLI commands. ICU literal spans are translated while placeholders, branch structure, rich tags, brand/model/SKU terms, URLs, numbers and protected terminology stay local. Output is structurally validated and remains an unpublished draft until human review/import/publication. The protected-span strategy was verified after a real Argos model changed opaque placeholder markers. It may reduce sentence context around protected terms; linguistic review remains necessary.

Dynamic translation uses only approved public product/category/brand/manufacturer/banner fields. Private customer/authentication data and financial fields are excluded. Unique revision/context/source/target job keys deduplicate queue writes. Controlled workers apply bounded concurrency, timeouts, renewed ownership leases, backoff, explicit failed-job recovery, failure tracking and source checks before and after translation. Originals remain untouched. Admin review checks the current source and translation versions to reject approval from an obsolete editor snapshot. Explicitly approved/manual wording is protected; stale unreviewed machine drafts can regenerate. The protected admin interface manages registry publication, coverage, catalog import/export, manual edits, approval, batches and failed jobs through existing administrator authorization and origin/body limits.

## Native runtime and actual language availability

The inspected machine is macOS 26.6.2 / Darwin 25.6.0, ARM64, ten CPU cores and 16 GiB RAM. System Python `/usr/bin/python3` is 3.9.6 and remains unchanged. Native installation selects the separate Homebrew Python 3.11.17 interpreter and official LibreTranslate 1.9.6 package. Its platform-specific fully pinned dependency manifest is `tools/libretranslate/requirements-macos-arm64-py311.lock`; all Python packages live in the dedicated venv, with separate persistent Argos and MiniSBD cache paths beneath ignored local state.

Port 5000 is occupied by macOS Control Center/AirPlay. That unrelated system service is retained. Native scripts use `http://127.0.0.1:5001` and reject occupied ports. The TypeScript provider and native scripts now share the port-5001 default. Native app/worker/CLI commands still explicitly set `LIBRETRANSLATE_URL=http://127.0.0.1:5001` to override legacy environment values. The scripts always bind to `127.0.0.1` and never expose the translator over the local network.

The installed models are English↔Bengali, matching existing published interface catalogs. Both Argos archives are version 1.9 and SHA256-pinned in `models.lock.json`; MiniSBD sentence files `en` and `hi` have their own hashes. The official Bengali segmentation mapping uses `hi`; that does not install Hindi translation. Actual native `/languages` returned source `en` with targets `bn,en`, and source `bn` with targets `bn,en`. English→Bengali sample `Hello world!` returned `হ্যালো বিশ্ব!`. Only exact outgoing targets establish enabled pairs; an installed catalog does not imply an installed model.

Additional languages require a complete newly prepared catalog and human review before publication. A catalog does not imply an installed model. Model candidates and absent official pairs are distinguished in [the local guide](translation-local-setup.md).

Regional/script identity is preserved: Portuguese/Portugal/Brazil and Chinese Simplified/Traditional remain distinct visitor locales. Provider aliases describe model reuse, never human review or publication. The requested Macedonian, Georgian, Armenian and Azerbaijani entries already exist in the central registry; Azerbaijani has an official English-pair download candidate, while the other three do not appear in the inspected official model guide. Manual catalog import remains available for valid unsupported locales. [Official model guide](https://docs.libretranslate.com/guides/supported_languages/).

## Database changes

The preserved `20261012000000_multilingual` migration adds `User.preferredLocale`, `LocaleLanguage`, `ContentTranslation` and `TranslationJob`, without altering canonical content or financial records. The new `20261012001000_libretranslate_pairs` migration adds nullable `LocaleLanguage.providerTargets` JSONB. Legacy provider rows with unknown pairs fail closed for machine generation until refreshed. Stored translations are retained.

Apply pending migrations only to an explicitly selected target. The project's existing loopback port 15432 reaches a production SSH tunnel and must never be used as an isolated development database.

For an existing dedicated local database:

```sh
export DATABASE_URL='postgresql://LOCAL_USER:LOCAL_PASSWORD@127.0.0.1:5432/bangbuy_translation_local'
export DIRECT_URL="$DATABASE_URL"
npx prisma migrate deploy
npx prisma generate
```

Do not copy those placeholder credentials literally. Use a dedicated local instance containing only synthetic data.

## Changed and created files

| Files | Preserved translation work and native conversion |
| --- | --- |
| `lib/translations/provider.ts` | Replaced Google adapter with the official LibreTranslate server adapter, exact pairs, health, sanitized errors, bounded requests/cache |
| `lib/translations/service.ts`, `languages.ts` | Transactional capability snapshots, pair validation, protected approvals, bounded regeneration/retries and language dashboard |
| `lib/translations/content.ts`, `protection.ts`, `catalog-generation.ts`, `validation.ts` | Protected local text spans, long-text batching, ICU/catalog/structured-content safety |
| `lib/i18n/registry.ts` | European language/native-name registry and explicit regional mappings without publishing incomplete locales |
| `prisma/schema.prisma`, new pair migration | Persist exact outgoing provider targets additively |
| `scripts/translations.ts` | LibreTranslate generation, live `probe`, bounded queue worker and existing operator workflows |
| `app/(private-commerce)/admin/translations/TranslationsManager.tsx`, management catalogs | Provider/setup, directed availability and retry workflow labels |
| `proxy.ts`, `next.config.ts` | Preserve loopback rewrite origin while retaining locale routing |
| `components/layout/Navbar.tsx` | RTL positioning/direction and translated desktop search |
| `package.json`, `package-lock.json` | Removed translation-only Google authentication dependency; next-intl retained |
| `scripts/translation/*.sh`, `tools/libretranslate/native.py` | Native install/model/start/stop/verify/update lifecycle; platform and occupied-port checks; managed process identity |
| `tools/libretranslate/requirements.in`, `requirements-macos-arm64-py311.lock`, `models.lock.json`, `.env.example` | Reviewed inputs, hash-pinned 62-package Python environment, model/sentence pins and native local defaults |
| `.gitignore`, `eslint.config.mjs` | Local venv/model/state ignored by Git and excluded from application lint |
| Previous `infra/translation/*` and VPS deployment runbook | Incompatible setup removed and replaced by native scripts and `docs/translation-vps-setup.md`; useful translation data retained |
| `docs/i18n.md`, `docs/translation-*.md`, `README.md` | Updated architecture, removal record, local commands, future deployment prerequisites and verification |

The native lifecycle, dependency/model locks and runtime exclusions support the translation implementation while keeping the provider on loopback port 5001 with explicitly selected models.

## Removed integrations

- `GoogleTranslationProvider`, its Advanced v3 API request/authentication/glossary code and defaults.
- `google-auth-library` direct dependency and its now-unused transitive dependency entries, using npm to update the lockfile.
- Active translation references to `GOOGLE_CLOUD_PROJECT`, `GOOGLE_TRANSLATION_LOCATION`, `GOOGLE_TRANSLATION_GLOSSARY` and `GOOGLE_APPLICATION_CREDENTIALS`.
- Superseded Google setup messages, CLI constructors and documentation requirements for billing/IAM/service-account translation credentials.

There was no standalone Google translation route to remove. Unrelated OAuth, fonts, maps and payments retain their own integrations.

## Local commands and environment

From the repository root, use the separately installed Python 3.11 interpreter:

```sh
scripts/translation/install-local.sh --python "$(brew --prefix python@3.11)/bin/python3.11"
scripts/translation/start-local.sh --port 5001
scripts/translation/verify-local.sh
export LIBRETRANSLATE_URL=http://127.0.0.1:5001
npm run i18n:translations -- probe --source en --target bn --text 'Add to cart'
# Export dedicated local DATABASE_URL and DIRECT_URL before database commands:
npm run i18n:translations -- sync-provider
npm run i18n:translations -- status
npm run i18n:translations -- worker --reviewer local-operator --limit 5 --interval 5000
# Stop only the managed native translator, retaining packages and models:
scripts/translation/stop-local.sh
```

The worker is a separate background process; Ctrl-C stops it gracefully. `--cycles 1` performs one bounded polling cycle. Exact prerequisites, local PostgreSQL setup, catalog/import/batch commands, model management and safe updates are in [translation-local-setup.md](translation-local-setup.md). Real credentials and interpreter/state paths belong only in ignored local state/environment files.

| Application variable | Default/purpose |
| --- | --- |
| `LIBRETRANSLATE_URL` | `http://127.0.0.1:5001`, shared native/provider default; still export explicitly |
| `LIBRETRANSLATE_API_KEY` | Optional server-only key for separately configured enforcement |
| `LIBRETRANSLATE_TIMEOUT_MS` | `60000`, maximum `120000` per HTTP request |
| `LIBRETRANSLATE_MAX_CHARACTERS` | `5000` characters per HTTP request |
| `LIBRETRANSLATE_BATCH_SIZE` | `20` strings per HTTP request |
| `TRANSLATION_BATCH_LIMIT` | `25` jobs per controlled workload, maximum 100 |
| `TRANSLATION_CHARACTER_LIMIT` | `50000` source characters per workload, maximum 250000 |
| `TRANSLATION_CONCURRENCY` | `1` globally permitted running job, maximum 5 |
| `TRANSLATION_PROTECTED_TERMS` | Pipe-separated protected terminology, including BangBuy |
| `DATABASE_URL`, `DIRECT_URL` | Existing app/Prisma settings; dedicated local values in this phase |

`LT_PYTHON`, `LT_PORT`, `LT_LANGUAGES` and `LT_START_TIMEOUT` configure the repository's native lifecycle scripts. They are not claims that every such variable is an upstream LibreTranslate option. Native scripts invoke only flags inspected in the pinned release, keep XDG data/cache/config paths local, and restrict Argos to CPU execution. Python environment and model pins are separate: retain model version manifests and both caches for rollback. Native Argos is configured for one inter-thread and two intra-threads. Start validates pinned installed files and refuses network-driven model changes. The helper directs MiniSBD explicitly to its local cache because its macOS default ignores XDG paths.

## Translation caching strategy

Public rendering performs no translation HTTP requests. Valid reviewed database translations are stored once and batch-read using source/context hashes; canonical source changes invalidate obsolete results. Job uniqueness includes source revision, locale pair and protected-term context, preventing duplicate generation. Missing/stale drafts fall back to labelled original content. Approved/manual overrides require explicit human review rather than automatic overwrite.

Server caches hold publication/language metadata and only active catalogs: 30-second expiry, a maximum of eight active catalogs and explicit invalidation after management writes. A separate one-minute provider-capability cache coalesces `/languages` fetches. Transient metadata failures retain a last verified publication snapshot; a cold unknown failure exposes English only. This preserves administrator disables rather than guessing publication. A real local probe read the stored en/bn metadata twice with one PostgreSQL query, no HTTP call, and the same cached snapshot. The translation provider is independent from ordinary page availability.

## Validation and remaining limits

Run `npm run lint`, `npm run typecheck`, `npm run i18n:validate` and `npm run build` for the current artifact. Use `scripts/translation/verify-local.sh` and the translation CLI probe to confirm the actual native service, outgoing pairs and sample output. Record the interpreter/package versions and configuration revision without credentials or private source text.

With synthetic data in an isolated database, manually verify job/review/staleness behavior, protected manual wording, administrator authorization and stored-content reads while the native service is unavailable. Check English/Bengali selection, explicit locale precedence, refresh and cart/auth retention. Verify `lang`/`dir`, equivalent URLs, canonical/hreflang/sitemap output and desktop/mobile RTL layout for any language being prepared. Previous local results do not establish the current environment's health.

Human linguistic/legal review cannot be established by structural validation or machine generation. New catalogs remain unpublished until reviewed. Legal/contract pages retain English and non-English variants remain unindexed until reviewed translations exist. Existing PDFs retain explicit English because the current fonts do not support complex-script shaping. External EmailJS templates are managed outside this repository. Search uses canonical catalog text rather than a separate translated index. Translation must preserve prices, tax, order totals, payment rules and private customer data.

The future VPS phase needs a supported Python 3.11 interpreter, a validated Linux/architecture dependency lock, capacity alongside existing applications, unprivileged supervision, loopback-only API access, controlled model downloads, persistent Argos/MiniSBD data, database backups and reversible environment/model updates. Follow [translation-vps-setup.md](translation-vps-setup.md) for that separately operated deployment. No local command automatically publishes a language or deploys the VPS.
