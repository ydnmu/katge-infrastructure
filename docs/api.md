# REST and MCP contract preview

The [OpenAPI 3.1 JSON](search-openapi.json) describes the optional search REST
contract generated from the application schemas. It does not cover every consumer
endpoint or the MCP protocol. A schema is not a claim of production availability.

Search defaults to disabled. The examples apply to an explicitly enabled,
accepted deployment with provisioned scopes and authorized source assets.

| REST request | Required scope |
| --- | --- |
| `POST /v1/assets/inspect` | `media:inspect` |
| `POST /v1/search/speech`, `/visual`, `/multimodal` | `search:create` |
| `GET /v1/jobs/{job_id}` | `jobs:read` |
| `GET /v1/jobs/{job_id}/result` for search | `jobs:read`, `search:read` |
| `POST /v1/clips` with asset intervals | `clips:create` |
| `POST /v1/jobs/{job_id}/cancel` | `jobs:cancel` |

REST accepts OAuth access tokens or scoped API keys. MCP uses OAuth. Tenant
identity and effective scope are verified by the service. Pending jobs require
polling; follow the returned `Retry-After` guidance.

Speech search currently matches literal transcript text. Visual results are
ranked frame candidates. Multimodal AND means temporal overlap; OR means a union
of candidates. Coverage and partial reasons describe limitations. `first` or
`all` does not prove the first or every real occurrence of an event.

Extraction uses the intervals the client chooses, expressed in milliseconds.
Search does not automatically create clips. Result access expires; expiry is
different from deletion of all job and operational records.

Turkish visual-query quality, long-audio checkpoints and several HLS paths remain
open acceptance work. No live search URL or production credential is provided.
