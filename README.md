# @pipeworx/devdocs-io

[DevDocs.io](https://devdocs.io/) MCP — keyless metadata + search of the docs index that powers devdocs.io (Angular, MDN, Node, Python, Rust stdlib, etc.).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1558+ live data sources.

## Tools

- `docs()` — full docs index (each entry has slug, type, release, attribution, db_size)
- `search_docs(query)` — filter the docs index by name/slug substring
- `index(slug)` — index of all entries inside a single doc (e.g. `slug="javascript"`)
- `search_index(slug, query, limit?)` — substring-search entries inside a doc; returns name + path + type
- `db(slug)` — content database for a doc (HTML snippets keyed by path; may be large)
- `entry(slug, path)` — single entry's content (HTML) from a doc
- `types(slug)` — list categories ("types") inside a doc

## Data source

`https://devdocs.io/docs.json`, `https://documents.devdocs.io/<slug>/index.json`, `https://documents.devdocs.io/<slug>/db.json`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "devdocs-io": {
      "url": "https://gateway.pipeworx.io/devdocs-io/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/devdocs-io/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1558+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Standalone (no gateway account)

This package also runs as a local stdio MCP server — no Pipeworx account, no
gateway round-trip:

```json
{
  "mcpServers": {
    "devdocs-io": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-devdocs-io"]
    }
  }
}
```

Or run it directly to confirm it starts:

```bash
npx -y @pipeworx/mcp-devdocs-io
```

It speaks MCP over stdin/stdout and answers `initialize`/`tools/list`/`tools/call`
for **only** this pack's tools — none of the shared meta-tools the gateway
connection above adds. Same source, same tools, no ask_pipeworx routing.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Devdocs Io data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
