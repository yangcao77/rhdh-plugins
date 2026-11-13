# Agentic chat backend

Package: `@red-hat-developer-hub/backstage-plugin-agentic-chat-backend`.
Directory: `workspaces/boost/plugins/agentic-chat-backend`.
Plugin ID: `agentic-chat`; Backstage base path: `/api/agentic-chat`.

The Boost development backend registers this plugin in `packages/backend`. For another Backstage backend with the Catalog service, register it with:

```ts
backend.add(
  import('@red-hat-developer-hub/backstage-plugin-agentic-chat-backend'),
);
```

```yaml
agentic-chat:
  servicePort: 8080
```

All routes use `agentic-chat.chat` with RBAC action `use`, following Intelligent Assistant's basic-permission pattern (Backstage has no `use` permission attribute):

```csv
p, role:default/agentic-chat-user, agentic-chat.chat, use, allow
g, group:default/APPROVED_GROUP, role:default/agentic-chat-user
```

- POST `/v1/agent/run`: `{ "query": "Hello", "provider": "openai", "model": "gpt-4o", "agentRef": "airesource:default/support", "conversation_id": "optional-session-id" }`. `agentRef`, `query`, `provider` and `model` are required nonblank strings. Missing or invalid selections return 400 without calling LCore. The requested agent is resolved through Catalog using the caller's credentials. Each request selects one accessible agent from any number of Catalog agents. Missing agents return 404; Catalog access denials prevent dispatch. Caller-supplied identity, definitions and capability overrides are rejected.
- GET `/v2/conversations`: proxy the authenticated caller's history request.
- GET `/v2/conversations/:conversationId`: proxy one conversation.
- DELETE `/v2/conversations/:conversationId`: proxy deletion and preserve the runtime's status/body, including no-content responses.

## Single-agent mapping

Catalog `metadata.name` becomes step `agent`; request `query` becomes `prompt`. Instructions, tools and object outputSchema map to `instructions`, `tools` and `output_schema`. The frontend request supplies `provider` → `inference_provider.name` and `model` → `inference_provider.model`, with the same selection sent as the run-level provider. Frontend selection takes precedence over Catalog model/provider values. Catalog `spec.model` is not used for execution. LCore validates provider/model authorization and resolves credentials; the browser cannot supply credentials or capabilities.

`executionMode` maps in-process → none, subprocess → local, sandbox → ephemeral. Omission stays absent, allowing the runtime default. The workflow contains one step named `agent`, with output key `result`. Nonempty handoffs and string-form outputSchema are rejected. SDK model settings are outside this slice. Tool identifiers pass through unchanged as requested; the runtime must resolve and enforce them.

## Runtime integration boundary

This first scaffold follows Intelligent Assistant's local sidecar pattern: `http://127.0.0.1:<servicePort>`, with `user_id` derived from trusted Backstage identity. Browser Authorization headers and user selectors are not forwarded. No redirects are followed. This is not a remote service-authentication configuration; deploy the sidecar within the same trusted pod/process boundary.

Run submits to LCore `/v1/agent/run` and preserves its actual acceptance response (typically 202 with a workflow ID). It does not claim that the answer or logical conversation history has been saved. The single-agent endpoint shares internal workflow submission logic, without an HTTP call to `/v1/workflows/run`. It does not yet connect these executions to `/v2/conversations` automatically. Streaming, continuation/context assembly, production service trust, runtime ownership enforcement, and workflow-to-chat-history integration remain separate work. A session_id groups workflows and does not itself provide recall.

The history proxy supplies trusted owner identity; the selected LCore authentication/history configuration must honor it and enforce ownership. Verify two-user isolation before production use. No chat content is stored in this plugin.

Run focused tests from `workspaces/boost`:

```sh
CI=true yarn test --watchAll=false --runInBand plugins/agentic-chat-backend plugins/agentic-chat-common
```

## Legal agent request example

The example request selects the supplied Legal agent, emitted by OGX as `airesource:default/ogx-agent-legal`. Its Catalog model remains `vertex/gemini`, shown in [legal-agent.json](examples/legal-agent.json). The frontend sends [legal-run-request.json](examples/legal-run-request.json), providing the Catalog `agentRef` and selecting provider `openai` and model `gpt-4o`. [legal-upstream-request.json](examples/legal-upstream-request.json) is the exact outbound JSON asserted by the HTTP capture test. The example query is `What is FantaCo's policy for software licenses?`.

RHDH accepts POST `/api/agentic-chat/v1/agent/run` and calls the local LCore `/v1/agent/run?user_id=<trusted Backstage user>`. No browser Authorization header is forwarded. The workflow step leaves spawn omitted because this agent has no executionMode. The runtime defaults to ephemeral execution and rejects the request with 403 if no spawner is configured. `enableRAG`, handoffDescription and Catalog ownership/display fields do not have an execution mapping in this scaffold.

The capture test verifies request mapping and forwarding with a recording upstream; it does not run inference. The selected provider/model still require operator-approved runtime configuration and credentials. Selecting a supported provider name does not configure Vertex routing or prove model availability.
