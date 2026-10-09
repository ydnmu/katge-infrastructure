# Availability and releases

Status reviewed 9 October 2026. This is the public product and integration hub;
source implementation and production rollout are maintained separately.

[Overview](../README.md) · [Changelog](../CHANGELOG.md)

| Surface | Current state | What remains |
| --- | --- | --- |
| Product website | Available at [katge.com](https://katge.com) | Website changes have a separate release process |
| REST API and MCP | Implemented contracts and integration previews | A configured, authorized deployment and live acceptance |
| Backend-connected extension 1.1.0 | Audited Chromium, Firefox and Opera candidates | Compatible service, actual-browser acceptance and approved publication |
| Search | Speech, visual and multimodal development previews | Explicit enablement and acceptance; disabled by default |

## Browser candidate acceptance

Local and CI builds validate package boundaries and archive contents. Builds are
not store approvals or live provider acceptance. No candidate ZIP is linked as
a public release here. Older store versions have separate behavior and must be
reviewed by version.

The 9 October protocol probe received HTTP 404 for the production session,
inspection, planning and observation-spec routes needed by the new extension.
Publication remains blocked until a compatible deployment is available and
authenticated live flows pass.

Each candidate still needs installation, permissions, authentication, completed
downloads, cancellation, restart and simultaneous-plan acceptance in its target
browser. The browser client requires the Katge service.

## Search preview

Search returns timestamped candidates with coverage and partial status. A result
is not proof of a detected event or complete source coverage. Turkish visual
queries and several long-audio/HLS paths remain acceptance work. Do not announce
public search availability from an OpenAPI schema or a package build.

## Review this repository

With Node.js 24 and Git, run:

```sh
node --test scripts/history.test.mjs
node scripts/check-publication.mjs
```

The guard checks approved files, documentation links, static SVG assets and
reachable Git history, including removed content. Its reviewed isolated root
does not inherit the private source repositories' history.

After committing a reviewed tree, `node scripts/export.mjs` creates an
exact-commit ZIP and SHA-256 record in the ignored `.data` directory. This export
contains presentation material, not a deployable service or extension installer.
