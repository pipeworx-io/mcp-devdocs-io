# @pipeworx/devdocs-io

[DevDocs.io](https://devdocs.io/) MCP — keyless metadata + search of the docs index that powers devdocs.io (Angular, MDN, Node, Python, Rust stdlib, etc.).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Devdocs Io data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
