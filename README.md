<div align="center">
  <img src="assets/katge-mark.png" width="56" height="56" alt="Katge" />
  <h1>Katge Infrastructure</h1>
  <p><strong>Extract selected intervals from supported video and audio.</strong></p>
  <p>Inspect a source, choose a time range and retrieve a clip<br />through browser extensions, REST API or MCP.</p>
</div>

<p align="center">
  <a href="https://katge.com">Website</a> ·
  <a href="docs/api.md">API</a> ·
  <a href="docs/mcp.md">MCP</a> ·
  <a href="docs/extension.md">Extensions</a> ·
  <a href="docs/architecture.md">How it works</a>
</p>

<picture>
  <source media="(prefers-reduced-motion: reduce) and (prefers-color-scheme: dark)" srcset="assets/product-flow-dark.svg" />
  <source media="(prefers-reduced-motion: reduce)" srcset="assets/product-flow.svg" />
  <source media="(prefers-color-scheme: dark)" srcset="assets/product-flow-dark.gif" />
  <img src="assets/product-flow.gif" width="1280" alt="Animated product flow: a public media source and chosen interval enter Katge; inspect, select and retrieve are highlighted, then results flow to extensions, REST API and MCP. Search is a development preview." />
</picture>

<p align="center"><sub><a href="assets/product-flow.svg">Static diagram</a> · <a href="assets/product-flow-dark.svg">Dark static diagram</a></sub></p>

## Media workflow

1. **Inspect:** submit a supported public media URL and check its metadata and formats.
2. **Select:** choose start/end times and request MP4 or MP3 when supported.
3. **Retrieve:** follow the job and retrieve the completed clip, or read its failure or cancellation state.

Available sources, formats and limits depend on the configured service.
Public, non-DRM media only. [Workflow details](docs/architecture.md).

## Interfaces

| Interface | Your workflow |
| --- | --- |
| **Extensions**<br />People | Preview a source, select an interval and save the file. [Browser workflow](docs/extension.md) |
| **REST API**<br />Applications | Submit clip requests and read job/result metadata. [Endpoints and example](docs/api.md) |
| **MCP**<br />Agents | Inspect media and create, follow or cancel clip requests. [Tools and connection requirements](docs/mcp.md) |
| **Website**<br />Everyone | Product information and documentation at [katge.com](https://katge.com). [Website preview](docs/website.md) |

## Availability

| Surface | Current status |
| --- | --- |
| Website | Product website at [katge.com](https://katge.com) |
| REST API and MCP | Integration previews for configured, authorized deployments |
| Backend-connected extension 1.1.0 | Audited candidate; public release and browser acceptance pending |
| Speech, visual and multimodal search | Development preview; disabled by default |

Speech, visual and multimodal search return timestamped candidates for a client
to review. [Search](docs/api.md#search-preview) remains disabled by default.
See [release status](docs/releases.md) before installing or connecting.

## About this repository

This repository contains public documentation, API examples, product diagrams
and release information. Implementation source and deployment configuration
are maintained separately. The diagram describes inputs, operations and client
interfaces without mapping internal components.

Questions and improvements to these docs are welcome through GitHub issues.
Use the [private security channel](SECURITY.md) for sensitive reports.

[Privacy](docs/privacy.md) · [Changelog](CHANGELOG.md) · [Local publication checks](docs/releases.md#review-this-repository)
