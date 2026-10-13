# Future native VPS setup

This is preparation for a separately authorized deployment phase. No VPS connection, installation, restart, database migration or production configuration change was performed. Complete the local checks in [translation-local-setup.md](translation-local-setup.md) before using this runbook.

## Prerequisites and compatibility gate

Use a maintained Linux distribution with systemd, a non-root service account, an installed CPython 3.11 interpreter, Python venv support, Node.js compatible with Next.js 16.2.12, and the existing application's PostgreSQL access. Inspect the actual server architecture, available disk, CPU and memory before selecting packages. Reserve capacity for the app, database, selected models and backups; the example service caps translation at two CPUs and 2 GiB, subject to representative workload measurements.

The verified local combination is Python 3.11.17, official LibreTranslate 1.9.6 and 62 pinned distributions in `tools/libretranslate/requirements-macos-arm64-py311.lock`. That lock includes official PyPI artifact hashes, but **Linux wheel/native-library compatibility has not been verified**. In a disposable Linux Python 3.11 venv, validate the candidate lock on the server's exact architecture, including CTranslate2, ONNX Runtime, NumPy and SentencePiece. Retain the compatible build-tool pins (`packaging==23.1`, `wheel==0.45.1`) and `chardet==5.2.0`. Produce a reviewed `requirements-linux-arm64-py311.lock` or `requirements-linux-x86_64-py311.lock` with exact versions, hashes, pip, setuptools and wheel before installation. Do not remove hash checks or install into system Python. [Official release](https://pypi.org/project/libretranslate/1.9.6/), [pinned package dependencies](https://github.com/LibreTranslate/LibreTranslate/blob/v1.9.6/pyproject.toml).

Keep a stable checkout path. Replace `/srv/bangbuy`, `bangbuy-translate`, `python3.11` and the lock filename below with reviewed deployment values. The non-root account needs read/execute access to the repository and write access to the dedicated `tools/libretranslate` working directory during installation, updates and model bootstrap. At service runtime only its `state/` directory needs writes. Keep `runtime.json`, environments, caches, logs, credentials and machine-specific configuration outside Git.

## Prepare dependencies and persistent models

Run these later, from the deployment checkout as its non-root installation account, while the supervised translation service is stopped:

```sh
scripts/translation/install-local.sh --python python3.11 --lock tools/libretranslate/requirements-linux-x86_64-py311.lock --skip-models
scripts/translation/install-models.sh --languages en,bn
scripts/translation/start-local.sh --port 5001
scripts/translation/verify-local.sh --port 5001
scripts/translation/stop-local.sh
```

Only English/Bengali models are initially required because those interface catalogs are published. `models.lock.json` pins both Argos 1.9 archives and MiniSBD English/Hindi sentence files with four SHA256 hashes; the official Bengali sentence splitter uses Hindi. The installer verifies hashes and the service verifies installed model files before reuse. Extend the reviewed model lock only after confirming real source-to-target availability and model quality; unsupported languages accept manually reviewed catalogs.

Preserve all of `tools/libretranslate/state/data/`, `state/cache/` and `state/config/`, plus `runtime.json` and the active/previous venv paths. The controller supplies private XDG directories and overrides MiniSBD's cache after importing Argos. Model downloads happen during the explicit bootstrap step; serving uses already validated local files. Bootstrap needs temporary outbound HTTPS access to official package/model sources. Redis and external storage services are not required: the selected service uses the upstream in-memory defaults.

## Supervise the API on loopback

Adapt this template to `/etc/systemd/system/bangbuy-libretranslate.service`; paths and account names are placeholders, not installed configuration:

```ini
[Unit]
Description=BangBuy native LibreTranslate
After=network.target
StartLimitIntervalSec=120
StartLimitBurst=3

[Service]
Type=simple
User=bangbuy-translate
Group=bangbuy-translate
WorkingDirectory=/srv/bangbuy
ExecStart=/srv/bangbuy/scripts/translation/start-local.sh --foreground --port 5001 --languages en,bn
Restart=on-failure
RestartSec=5
TimeoutStopSec=45
KillSignal=SIGTERM
UMask=0077
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/srv/bangbuy/tools/libretranslate/state
PrivateTmp=true
RestrictAddressFamilies=AF_UNIX AF_INET AF_INET6
IPAddressDeny=any
IPAddressAllow=localhost
CPUQuota=200%
MemoryMax=2G
TasksMax=128
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Verify this unit against the target systemd/kernel, including cgroup resource and IP filtering support, before enabling it. `state/` must already exist and be writable by the service user. The foreground controller records process ownership, checks port availability and binds strictly to `127.0.0.1`; it serves through the official Waitress entry point with one HTTP worker, 5,000-character/20-item limits and bounded Argos CPU threads. Input-text INFO logs are suppressed; warnings/errors remain. [Pinned server entry point](https://github.com/LibreTranslate/LibreTranslate/blob/v1.9.6/libretranslate/main.py), [systemd execution controls](https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html).

Keep inbound port 5001 blocked at the host/provider firewall. Do not add a public reverse-proxy route or browser access to the API. On a host running the Next.js server and worker natively, both use `LIBRETRANSLATE_URL=http://127.0.0.1:5001`. An optional server-only API key does not enable upstream key enforcement on its own. Apply any separately required authentication policy before broader local-host access.

After the separate phase is authorized and configuration verified, the operator can use `systemctl daemon-reload`, `systemctl enable --now bangbuy-libretranslate`, `systemctl status bangbuy-libretranslate` and `journalctl -u bangbuy-libretranslate --since '10 minutes ago'`. Use `systemctl stop` before installation/model changes; calling the local stop wrapper under an enabled restart policy can trigger a supervisor restart.

## Application, database and publication gates

Back up the database and verify restoration through the established deployment process before applying the additive multilingual migrations. Use a migration role and a deployment-specific `DIRECT_URL`; give the application/worker only their required runtime database permissions. Supply secrets through private server configuration rather than committed files. Existing root `.env` settings and the development SSH tunnel must not become the deployment's database configuration.

```sh
npx prisma migrate deploy
npx prisma generate
npm run lint
npm run typecheck
npm test
npm run i18n:validate
npm run build
npm run i18n:translations -- probe --source en --target bn --text 'Hello world!'
npm run i18n:translations -- sync-provider
npm run i18n:translations -- status
```

Run those later in the normal app deployment environment. Set provider timeout 60,000 ms, character limit 5,000, batch size 20, `TRANSLATION_CONCURRENCY=1`, `TRANSLATION_BATCH_LIMIT=25` and `TRANSLATION_CHARACTER_LIMIT=50000`. Supervise a separate bounded job command, for example `npm run i18n:translations -- worker --reviewer operator-id --limit 5 --interval 5000`, with the actual approved reviewer identifier. Serving the translation API alone does not run database jobs.

Validate admin RBAC, English default, explicit-locale precedence, preference/auth/cart/checkout persistence, metadata and sitemap behavior before rollout. Capability refresh does not publish a language. Only complete reviewed catalogs and approved public-content translations may become public; retain existing English/Bengali content, preferences and manual approvals. Public pages read stored translations with source-English fallback when the engine is offline, without translation HTTP calls during rendering.

## Updates, backup and rollback

Pause job scheduling and let active jobs finish. Stop the supervised API before a consistent archive of native state, runtime metadata and the active/previous environments; retain the database backup and reviewed source checkout. Store archives privately outside Git. A dependency update stages a new venv and verifies models and a real translation before changing the active runtime pointer:

```sh
scripts/translation/update-local.sh --python python3.11 --lock tools/libretranslate/requirements-linux-x86_64-py311.lock
scripts/translation/update-local.sh --rollback
```

The rollback command selects the retained previous verified environment. Stop/start the systemd service to activate either change, then verify health, directed language pairs, a real translation and the app before refreshing capabilities or resuming jobs. Never move a venv: its executable paths are tied to its original location. Model upgrades require a separately reviewed lock and an archived known-good model/cache snapshot; do not mutate the only retained copy. Restore a matching previous checkout, environment pointer and model snapshot together if validation fails. Additive database rollback follows the existing backup/restore procedure; do not reset or delete translation records to roll back a translator.

Monitor service health, RSS/CPU, restart limits, timeouts, exhausted job retries and publication reviews. This file prepares operations only; server compatibility, firewall policy, backups and production rollout remain future verification gates.
