# Pocket Ops development handoff

## Purpose

Maintain a small, attractive Korean-language offline utility pocket for an operator working with legacy Linux/Java/WAS and a Windows workstation. The delivered artifact must remain one `pocket-ops.html` file usable without a package manager, network, server, or account at runtime.

## Source layout

- `src/shell.html`: document, application containers, CSP placeholders.
- `src/styles.css`: responsive system-font UI, light/dark tokens, inline SVG styling.
- `src/data.js`: generated tool/catalog metadata (`window.PocketData`).
- `make_data.py`: human-editable source of the 176 catalog entries, the parameter specs and the four DB profiles (`dbs`: label, client, prompt, transaction flow); run it to regenerate data.js after catalog edits. It writes LF bytes on every OS.
- `src/core.js`: dependency-free pure transformations (`window.PocketCore`).
- `src/app.js`: routes, UI binding, safety prompts, import/export, in-memory views.
- `src/release.js`: immutable source recipe to offline ZIP; never serialize live inputs or configuration.
- `build.py`: combines sources, computes CSP script hash, writes self-contained HTML.
- `build.py` also renders an escaped read-only catalog into the shell's `#script-fallback` placeholder. It is outside `<noscript>` on purpose: CSS hides it only after `app.js` adds `html.app-ready` at the end of a successful start, so a disabled, CSP-blocked, altered or failing script still leaves the reference visible (immediately without JavaScript, after 1.5 s otherwise). Keep all built-in commands, each command's paste target (`where`) and risk/placeholder warnings available there; never include personal configuration.
- `tests/`: Node core suite, offline Playwright browser suite, Python static suite, measured reports.
- `samples/`: non-sensitive encoding/log/config fixtures.

## Build

The offline field guide library and the public articles share `download-site/guides.json`. Build the HTML after editing an article. The escaped library in the read-only reference supplies the interactive home view as well. Keep command targets local, use the built-in command review dialog, and preserve draft checks on tool examples. Run `python tests/offline_field_guides.py` for file-open coverage of both distributed artifacts and the script-disabled reader.

The public site shares the catalog, UI and core with the offline release. `python build_site.py` builds `.test-artifacts/pocket-ops-web-site.zip` for Cloudflare dashboard → Workers & Pages → jjunybox-pocket-ops → Create deployment → Production → upload ZIP → Save and Deploy. Use the generated ZIP for the website. The root release ZIP is for offline users. Website deployment and GitHub release publication are independent. Rebuild and deploy the website after shared tool changes.

Keep the four marked platform bindings in `src/app.js` in sync with `platform_app` and `build_site.py`. The standalone artifact uses the default bindings byte-for-byte. Public tools use same-origin static assets, a CSP-hashed script and real paths under `/tools/`. Editorial content lives in `download-site/guides.json`. Future approved ads belong exclusively in guide articles. Review the guide-specific CSP, consent and isolation from the tools' origin storage before enabling any third-party code. Keep the tool CSP and the offline build independent. Run `python tests/web_site_test.py` to verify the public build locally, or pass the deployed HTTPS origin for a live check.

The public download site is maintained separately in `download-site/`. Deploy only that directory to the Pocket Ops Cloudflare Pages project. Its permanent HTML and checksum URLs use GitHub Releases' latest asset links. The ZIP route looks up the latest published tag and redirects to `pocket-ops-v<version>.zip` for that same tag. Publishing a new release with the existing naming convention updates the downloads without a site redeploy. Test with `node --test tests/download-site.test.mjs`.

On an approved development machine with Python 3:

```text
python make_data.py
python build.py
```

`make_data.py` is only needed after editing its catalog. Do not hand-edit `data.js` and then overwrite it accidentally. `build.py` requires no third-party packages. Node and Python are not used by the delivered HTML at runtime.

The output includes a SHA-256 CSP hash of the exact script text, including surrounding newlines. **Do not manually edit the embedded script in the built HTML without rebuilding the hash.** Keep the literal `</script` replacement in the builder.

The builder also writes `pocket-ops-v<version>.zip` and `SHA256SUMS.txt`. Update README_KO.md, START_HERE.txt and CHANGELOG.md before building: they are embedded in the immutable release recipe. The browser button packages the currently opened version, without online updates or working data. Runtime ZIP uses the stored method for dependency-free compatibility.

## Test

```text
node tests/core.test.cjs
python tests/static_test.py
python tests/browser_test.py
```

Optional usage evidence: `python tests/evidence_walkthrough.py [--os-clipboard]` opens the built HTML as `file://`, uses every menu with fake data, checks results against Python oracles and writes screenshots plus `index.html`/`README.md`/`evidence.json` to `evidence/v<version>/`. `--os-clipboard` briefly opens a visible Chromium window to compare copy buttons with `Get-Clipboard` and restores the previous clipboard text (skipped when the clipboard holds non-text data). Headless Chromium's clipboard does not reach the OS clipboard, and Chromium on Windows stores multi-line clipboard text with CRLF.

The core suite targets Node 22+. The browser suite requires the Python Playwright package and an approved Chromium installation only on the development machine. Set `CHROMIUM_PATH` if `/usr/bin/chromium` is not correct. On Windows PowerShell, set `$env:CHROMIUM_PATH` to the approved Chrome/Edge executable, then run the Python script. Never modify enterprise browser policy to run a test.

GitHub → Actions → Verify offline release runs these checks on a Windows runner for pushes and pull requests. It first regenerates the catalog/HTML/ZIP and rejects differences from the committed artifacts. Official actions use pinned commits and read-only repository permission; no secrets or automatic release publishing are needed.

The browser suite uses `page.set_content` in an offline context and a separate `file://` smoke test. A policy block is recorded without changing policy. Read the current report for local file-open, save/reopen and storage-reload results. Storage and clipboard test doubles are explicitly labeled; do not report them as verified OS integration. Do an additional manual file-open/copy/save/reopen check on the target authorized PC.

Node's ICU EUC-KR decoder in the tested runtime did not map some Windows-949 extension bytes the same way as Chromium. Therefore common EUC-KR is tested in Node and extended CP949 is checked with real Chromium TextDecoder plus file read/export fixtures. Preserve that distinction.

## Non-negotiable invariants

1. No external API, remote library/font, telemetry, login, analytics or runtime fetch. No eval, Function constructor, executing input HTML, or remote shell execution.
2. Render untrusted text via `textContent`, `.value`, or HTML escaping. Do not concatenate unescaped backup, log, filename or command data into markup.
3. Persist only explicitly selected configuration. Working inputs, files, results and history must not be written automatically to localStorage/IndexedDB.
4. Treat imported/custom commands as untrusted and require acknowledgment. Do not trust risk/permission metadata supplied in a backup.
5. Preserve losslessness: formatting JSON must not reserialize parsed JavaScript Numbers. Keep original numeric lexemes, negative zero, duplicate keys and key ordering.
6. Encoding repair returns a candidate, not proof of recovered original. Show loss/ambiguity warnings. Export UTF-8 only until a separately reviewed encoder exists.
7. RegExp execution stays in a disposable Worker with hard timeout and size limits. Never silently fall back to the main thread.
8. Respect missing clipboard, storage, Crypto and Worker capability. Provide clear limitations instead of removing security controls.
9. Keep input size limits and distinguish preview truncation from actual data loss.
10. Do not run catalog shell commands against live environments during tests. Syntax checking, template unit tests and harmless test fixtures suffice for development tests; version/permissions remain environment-specific.

## Adding a command

Add an entry in `make_data.py`; use a unique ID and stable IDs for compatibility with favorites. Include concise Korean title, group, tags, exact command, notes, risk (`read`, `load`, `change`), permission (`user`, `limited`), shell (`bash`, `powershell`, or static client input without interpolation: `sql` statements, `csql` session commands, `sqlplus`, `psql` meta commands, `mariadb` client commands), domain, prerequisite and explicit alternative IDs. DB entries also set `db` (`cubrid`, `mariadb`, `oracle`, `postgresql`) and, when they belong to the SQL workbench flow, `step` (`connect`, `check`, `begin`, `finish`). The generator derives `where` (the paste target shown on cards, dialogs, search and the read-only reference); never hand-write it. Templates use `{{UPPER_CASE}}`; Docker's literal `{{.State.Status}}` is intentionally not a Pocket Ops placeholder.

PID/port/numeric fields must validate before interpolation; string and path fields must be shell-quoted. A quoted string is not automatically protected against option parsing: path values starting with `-` are rejected and should be entered with `./`. Avoid destructive examples; put reads before writes and leave real process IDs blank.

Do not infer installation absence from empty process/PATH/package/header output. In particular WebtoB/JEUS version and privileges vary across installations. Add alternative commands as explicit variants, not a script that executes everything.

For the four built-in CRUD presets (portable SQL for all four DBs), `editorSql` holds the editable example; the catalog generator comments every line of a change preset's `command` for direct reference/copy. Classify the current SQL through `prepareSql(source, dialect)` for formatter copy/save; it returns `{sql, verb, checks, review}` and never rewrites text beyond whitespace. Deliver only when `review` is false, otherwise after the exact output is reviewed; a `danger` check (UPDATE/DELETE without top-level WHERE, SELECT … INTO) additionally requires the explicit acknowledgment checkbox. An edit or a DB change invalidates the review and the previous result. Subquery row locks and client substitutions on SELECT also require review. The command-list workbench shortcut carries the selected DB filter. Dialect rules model the paste target, not the server: Oracle SQL*Plus blank/`/`/`.` lines are rejected and `&` warned, psql `:name` warned, MariaDB `/*! */` (all DBs) and `--x` rejected, `//` comments only for CUBRID. Cancelling a preset replacement must change neither the draft nor the selected DB. Never trust imported commands as editor presets.

## Adding a tool

Add metadata in the catalog generator, pure functions in `core.js`, a renderer and `bindPage` branch in `app.js`, and entries in `renderers`. Each tool needs sample input, copy/export where appropriate, visible scope/limits, error clearing, keyboard labels, responsive states and tests. Avoid silently keeping stale results after a failed run or after changing a calculation's source.

Every route also needs an entry in `guides` in `make_data.py` (when, steps, cautions, optional example). The title row shows a "사용 예시" button and `?` opens it. An example with `fill`/`click` is run through the screen's own element IDs and buttons, so keep `output` (or `expect` for `result`) identical to what the tool shows: the core suite recomputes pure examples and the browser suite runs every example. Examples come only from the catalog, never from imported data, and must warn before replacing text the user typed.

Alternatives opened from a command dialog carry same-name values (and FILE/PATH/LOG/DIR as one location) and offer a way back; keep that behavior when adding alternatives. The home route is a dashboard (search, environment cards, favorite commands/tools, folded full tool grid); keep it short on phones.

`views` caches detached nodes only in memory. Long-running async work must ignore out-of-date results and have cleanup behavior when inputs are cleared.

## Configuration format

Storage key `pocket-ops:v1`. Fields: version, theme, toolFavs, cmdFavs, customCommands. The SQL workbench DB choice and the command list DB filter are in-memory only. Validate imports, bound arrays and string lengths, reject duplicate custom IDs. Bump schema only with a migration strategy. Backups are plain JSON and may contain sensitive strings deliberately saved as commands; show the existing warning.

## Product direction for a later iteration

Start with feedback from actual authorized offline use, especially copied command shapes, Korean labels, keyboard search and restrictions. Candidate additions are an environment-specific command pack, checklist/runbook view, a manual log-redaction preview, an in-app confirmation dialog replacing `window.confirm` for HTML viewers that suppress native dialogs, and an explicitly saved default DB. They are not implemented in v0.6.0. Do not add cloud AI, background sync or user accounts to implement them.

Keep the delivered artifact a single file. Reviewed in v0.6.0: splitting pages into linked HTML/JS files would break the Galaxy path (Android file managers open HTML through `content://`, where relative links and scripts usually cannot resolve), would replace the single CSP script hash with origin-based rules that `file://` handles inconsistently, and Workers/modules are restricted on `file://`. Size (≈1 MB including the release recipe) is not a bottleneck. Maintainability comes from the split `src/` files and the build step; add further source files to the build list in `build.py` instead of shipping several files.
