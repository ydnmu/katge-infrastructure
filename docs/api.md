# Katge REST API

Build media selection into an application: inspect a supported source, request
an interval, follow the job and retrieve its result. The API exposes inputs,
status and results; it does not expose the processing implementation.

[Overview](../README.md) · [MCP](mcp.md) · [Release status](releases.md)

## Request lifecycle

| Step | Request | Public result |
| --- | --- | --- |
| Inspect | `POST /v1/media/inspect` | Source metadata and available capabilities |
| Select | `POST /v1/clips` | Accepted job with an identifier and state |
| Follow | `GET /v1/jobs/{job_id}` | Progress, completion, cancellation or stable error |
| Retrieve | `GET /v1/clips/{clip_id}` | Result metadata and time-limited delivery access |
| Cancel | `POST /v1/jobs/{job_id}/cancel` | Cancellation state |

Use the base URL and credentials provided by your deployment operator. REST
accepts authorized OAuth access tokens or scoped API keys through `X-Api-Key`.
The contract examples below require a configured, compatible deployment; this
repository does not announce a live production gateway.

For a supported source, an illustrative `POST /v1/clips` JSON body is:

```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "start_seconds": 12,
  "end_seconds": 20,
  "format": "mp4",
  "idempotency_key": "example-interval-12-20"
}
```

Inspect first to confirm source availability, duration and format support.
Core clip timestamps are in seconds. End must exceed start and fit the source
and caller's limits. Requested formats are `mp4` or `mp3` when supported.

Creation is asynchronous. Retain the returned job ID and poll according to the
response's retry guidance, no faster than every two seconds. Retrieve a clip
only after the job reports completion and a clip ID. Treat cancellation and
failure as terminal outcomes; do not construct result URLs yourself.

For retries of the same request, reuse its idempotency key without changing the
arguments. Handle stable errors and permission/quota limits in the application.
Delivery access expires; request fresh access while the result remains within
retention. Expiry of a link does not imply deletion of every operational record.

## Search preview

Speech, visual and multimodal search can return timestamped candidates for an
inspected asset. Search is disabled by default and requires an explicitly enabled,
accepted deployment with appropriate permissions. A client reviews candidates
and chooses the intervals to extract; search does not automatically make clips.

| REST request | Required scope |
| --- | --- |
| `POST /v1/assets/inspect` | `media:inspect` |
| `POST /v1/search/speech`, `/visual`, `/multimodal` | `search:create` |
| `GET /v1/jobs/{job_id}` | `jobs:read` |
| `GET /v1/jobs/{job_id}/result` for search | `jobs:read`, `search:read` |
| `POST /v1/clips` with asset intervals | `clips:create` |
| `POST /v1/jobs/{job_id}/cancel` | `jobs:cancel` |

The [OpenAPI 3.1 JSON](search-openapi.json) documents these eight conditional
search routes. It is not the complete media API or the MCP protocol.
Search extraction intervals use milliseconds; core clip requests above use seconds.

Speech search currently matches literal transcript text. Visual results are
ranked frame candidates. Multimodal AND means temporal overlap; OR means a union
of candidates. Coverage and partial reasons describe what was examined. `first`
or `all` does not prove the first or every occurrence of an event.

Turkish visual-query quality, long-audio checkpoints and several HLS paths remain
acceptance work. See [Availability](releases.md) before advertising search support.

## Responsible integration

Use only supported public, non-DRM sources. Keep credentials, signed delivery
URLs and raw source observations out of logs and public issues. Report a stable
error code and the affected interface; use the [private channel](../SECURITY.md)
for sensitive evidence. See [Privacy and data flow](privacy.md).
