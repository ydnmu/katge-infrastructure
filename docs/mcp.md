# Katge MCP

Katge's Model Context Protocol tools let an assistant inspect media, request a
clip, follow its job and retrieve the result.

[Overview](../README.md) · [REST API](api.md) · [Release status](releases.md)

## Connect a compatible deployment

Use the MCP URL and OAuth onboarding supplied by your Katge deployment operator.
The implemented interface uses HTTP at `/mcp` and requires an authorized OAuth
access token. Configure the URL and authorization flow for your MCP host.

Choose a host that supports the deployment's HTTP transport and OAuth flow.
Keep credentials in the host's secret storage. A browser-session key or a REST
API key is not an MCP OAuth token.

## Media tools

| Tool | What the assistant provides | What it gets |
| --- | --- | --- |
| `katge.inspect_media` | A supported public media URL | Safe source metadata and available capabilities |
| `katge.create_clip` | URL, start/end seconds and requested output format | A job identifier and state |
| `katge.get_job` | The returned job identifier | Current progress, terminal state or stable error |
| `katge.get_clip` | The completed clip identifier | Result metadata and time-limited delivery access |
| `katge.cancel_job` | A job identifier | Cancellation state |

Example user task:

> Inspect this supported public video. If the interval is available, retrieve
> 00:12–00:20 as MP4 and give me the result. Tell me if the request cannot complete.

The assistant inspects first, submits the selected interval, follows the job,
then retrieves the completed result. Poll no faster than every two seconds and
respect retry guidance. Stop polling when a job fails or is cancelled; return
its state and error instead of a download URL.

Tools operate within the caller's permissions and limits. Processing requests
can consume quota. Review the assistant's proposed source and interval before
letting it submit work. Actual host tool-selection and live downloads still need
acceptance against the intended deployment.

## Search preview

Explicitly enabled search deployments can additionally expose
`katge.search_speech`, `katge.search_visual`, `katge.search_multimodal` and
`katge.get_result`. The tools return candidates with timestamps, coverage and
partial reasons. They do not automatically create clips or verify every event.

Search defaults to disabled. See the [public search contract](api.md#search-preview)
and [availability](releases.md) before advertising an agent integration.
