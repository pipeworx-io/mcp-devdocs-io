interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * DevDocs.io MCP.
 */


const ROOT = 'https://devdocs.io';
const DOCS = 'https://documents.devdocs.io';
const UA = 'pipeworx-mcp-devdocs-io/1.0 (+https://pipeworx.io)';

type DocsEntry = { name: string; slug: string; type: string; release?: string; version?: string };
type DocsListing = DocsEntry[];
type DocIndex = { entries: Array<{ name: string; path: string; type: string }>; types: Array<{ name: string; count: number; slug: string }> };

const tools: McpToolExport['tools'] = [
  { name: 'docs', description: 'Full docs index.', inputSchema: { type: 'object', properties: {} } },
  { name: 'search_docs', description: 'Filter docs index by substring.', inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } },
  { name: 'index', description: 'Index of entries inside a doc.', inputSchema: { type: 'object', properties: { slug: { type: 'string' } }, required: ['slug'] } },
  {
    name: 'search_index',
    description: 'Substring-search entries inside a doc.',
    inputSchema: { type: 'object', properties: { slug: { type: 'string' }, query: { type: 'string' }, limit: { type: 'number' } }, required: ['slug', 'query'] },
  },
  { name: 'db', description: 'Content database for a doc (large).', inputSchema: { type: 'object', properties: { slug: { type: 'string' } }, required: ['slug'] } },
  { name: 'entry', description: 'Single entry HTML.', inputSchema: { type: 'object', properties: { slug: { type: 'string' }, path: { type: 'string' } }, required: ['slug', 'path'] } },
  { name: 'types', description: 'List categories inside a doc.', inputSchema: { type: 'object', properties: { slug: { type: 'string' } }, required: ['slug'] } },
];

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`devdocs.io: ${res.status} ${url}`);
  return (await res.json()) as T;
}

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const reqStr = (k: string, ex: string) => {
    const v = args[k];
    if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${k}" is missing. Pass a string like ${ex}.`);
    return v;
  };
  switch (name) {
    case 'docs':
      return getJson<DocsListing>(`${ROOT}/docs.json`);
    case 'search_docs': {
      const all = await getJson<DocsListing>(`${ROOT}/docs.json`);
      const q = reqStr('query', '"javascript"').toLowerCase();
      const has = (s: string | undefined | null) => typeof s === 'string' && s.toLowerCase().includes(q);
      return all.filter((d) => has(d.name) || has(d.slug) || has(d.type));
    }
    case 'index':
      return getJson<DocIndex>(`${DOCS}/${encodeURIComponent(reqStr('slug', '"javascript"'))}/index.json`);
    case 'search_index': {
      const idx = await getJson<DocIndex>(`${DOCS}/${encodeURIComponent(reqStr('slug', '"javascript"'))}/index.json`);
      const q = reqStr('query', '"Array.prototype"').toLowerCase();
      const limit = Number(args.limit ?? 25);
      const has = (s: string | undefined | null) => typeof s === 'string' && s.toLowerCase().includes(q);
      const out = idx.entries.filter((e) => has(e.name) || has(e.path)).slice(0, limit);
      return { count: out.length, entries: out };
    }
    case 'db':
      return getJson<Record<string, string>>(`${DOCS}/${encodeURIComponent(reqStr('slug', '"javascript"'))}/db.json`);
    case 'entry': {
      const slug = encodeURIComponent(reqStr('slug', '"javascript"'));
      const path = reqStr('path', '"global_objects/array"');
      const db = await getJson<Record<string, string>>(`${DOCS}/${slug}/db.json`);
      const key = path in db ? path : Object.keys(db).find((k) => k.toLowerCase() === path.toLowerCase());
      if (!key) throw new Error(`devdocs.io: entry "${path}" not found in "${args.slug}".`);
      return { slug: args.slug, path: key, html: db[key] };
    }
    case 'types': {
      const idx = await getJson<DocIndex>(`${DOCS}/${encodeURIComponent(reqStr('slug', '"javascript"'))}/index.json`);
      return idx.types;
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
