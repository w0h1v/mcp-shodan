# Connect a client

mcp-shodan speaks MCP over stdio by default. Every client needs the same two things: how to start the server (`npx -y @burtthecoder/mcp-shodan`) and the `SHODAN_API_KEY` environment variable ([get a key](https://account.shodan.io/)).

## Requirements

- Node.js 20 or newer.
- A Shodan API key. Host lookups and DNS work on a free account; search filters need a membership or paid API plan. The CVE tools use the free CVEDB and don't spend credits.

## Claude Code

```sh
claude mcp add --transport stdio --env SHODAN_API_KEY=your-key shodan -- npx -y @burtthecoder/mcp-shodan
claude mcp get shodan      # should show: Connected
```

## Codex CLI

```sh
codex mcp add shodan --env SHODAN_API_KEY=your-key -- npx -y @burtthecoder/mcp-shodan
```

## Gemini CLI

```sh
gemini mcp add -e SHODAN_API_KEY=your-key shodan npx -y @burtthecoder/mcp-shodan
```

## Claude Desktop

Edit the config file, then restart the app.

| OS | Path |
|---|---|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |

```json
{
  "mcpServers": {
    "shodan": {
      "command": "npx",
      "args": ["-y", "@burtthecoder/mcp-shodan"],
      "env": { "SHODAN_API_KEY": "your-shodan-api-key" }
    }
  }
}
```

## VS Code (GitHub Copilot)

Create `.vscode/mcp.json` in your workspace, or add the server to your user configuration with **MCP: Add Server**, then reload VS Code.

```json
{
  "servers": {
    "shodan": {
      "command": "npx",
      "args": ["-y", "@burtthecoder/mcp-shodan"],
      "env": { "SHODAN_API_KEY": "your-shodan-api-key" }
    }
  }
}
```

## From source

```sh
git clone https://github.com/w0h1v/mcp-shodan && cd mcp-shodan
npm ci && npm run build
```

Use command `node` with the argument `/absolute/path/to/mcp-shodan/build/index.js`.

## HTTP streaming

Run the server as a standalone HTTP service with `MCP_TRANSPORT=httpStream`. See [Environment variables](index.md#environment-variables). In Docker, publish the port on localhost only: `docker run -p 127.0.0.1:3000:3000 ...`.

!!! warning
    The HTTP transport has no authentication. Don't expose the port beyond localhost without an authenticating reverse proxy, or anyone who can reach it can spend your query credits.
