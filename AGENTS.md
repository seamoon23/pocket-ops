# Pocket Ops development handoff

## Purpose

Maintain a small, attractive Korean-language offline utility pocket for an operator working with legacy Linux/Java/WAS and a Windows workstation. The delivered artifact must remain one `pocket-ops.html` file usable without a package manager, network, server, or account at runtime.

## Source layout

- `src/shell.html`: document, application containers, CSP placeholders.
- `src/styles.css`: responsive system-font UI, light/dark tokens, inline SVG styling.
- `src/data.js`: generated tool/catalog metadata (`window.PocketData`).
- `make_data.py`: human-editable source of the 121 catalog entries; run it to regenerate data.js after catalog edits.
- `src/core.js`: dependency-free pure transformations (`window.PocketCore`).
- `src/app.js`: routes, UI binding, safety prompts, import/export, in-memory views.
- `src/release.js`: immutable source recipe to offline ZIP; never serialize live inputs or configuration.
- `build.py`: combines sources, computes CSP script hash, writes self-contained HTML.
- `tests/`: Node core suite, offline Playwright browser suite, Python static suite, measured reports.
- `samples/`: non-sensitive encoding/log/config fixtures.

## Build

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

The core suite targets Node 22+. The browser suite requires the Python Playwright package and an approved Chromium installation only on the development machine. Set `CHROMIUM_PATH` if `/usr/bin/chromium` is not correct. On Windows PowerShell, set `$env:CHROMIUM_PATH` to the approved Chrome/Edge executable, then run the Python script. Never modify enterprise browser policy to run a test.

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

Add an entry in `make_data.py`; use a unique ID and stable IDs for compatibility with favorites. Include concise Korean title, group, tags, exact command, notes, risk (`read`, `load`, `change`), permission (`user`, `limited`), shell (`bash`, `powershell`, or static `sql` queries without interpolation), domain, prerequisite and explicit alternative IDs. Templates use `{{UPPER_CASE}}`; Docker's literal `{{.State.Status}}` is intentionally not a Pocket Ops placeholder.

PID/port/numeric fields must validate before interpolation; string and path fields must be shell-quoted. A quoted string is not automatically protected against option parsing: path values starting with `-` are rejected and should be entered with `./`. Avoid destructive examples; put reads before writes and leave real process IDs blank.

Do not infer installation absence from empty process/PATH/package/header output. In particular WebtoB/JEUS version and privileges vary across installations. Add alternative commands as explicit variants, not a script that executes everything.

## Adding a tool

Add metadata in the catalog generator, pure functions in `core.js`, a renderer and `bindPage` branch in `app.js`, and entries in `renderers`. Each tool needs sample input, copy/export where appropriate, visible scope/limits, error clearing, keyboard labels, responsive states and tests. Avoid silently keeping stale results after a failed run or after changing a calculation's source.

`views` caches detached nodes only in memory. Long-running async work must ignore out-of-date results and have cleanup behavior when inputs are cleared.

## Configuration format

Storage key `pocket-ops:v1`. Fields: version, theme, toolFavs, cmdFavs, customCommands. Validate imports, bound arrays and string lengths, reject duplicate custom IDs. Bump schema only with a migration strategy. Backups are plain JSON and may contain sensitive strings deliberately saved as commands; show the existing warning.

## Product direction for a later iteration

Start with feedback from actual authorized offline use, especially copied command shapes, Korean labels, keyboard search and restrictions. Candidate additions are an environment-specific command pack, checklist/runbook view and a manual log-redaction preview. They are not implemented in v0.1.0. Do not add cloud AI, background sync or user accounts to implement them.
