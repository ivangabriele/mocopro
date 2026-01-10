# MoCoPro

A CLI tool to install, run, and manage MCP servers locally using containers, with built-in configuration for popular MCP clients.

Like Smithery, but free and local.

> [!NOTE]  
> Self-hosting on your own servers coming soon!

## Compatibility

- Installable MCP Servers
  - Any GitHub-hosted MCP Server with a root `Dockerfile` or `smithery.yaml` file.
  - _Other Git Hosters coming soon._
- Integrations
  - Claude CLI
  - _Other MCP Clients coming soon._

## Installation

### NPM Package

**Requirements:**
- [Node.js](https://nodejs.org/) >= 24 or [Bun](https://bun.sh/) >= 1.3
- [Docker](https://www.docker.com/) or [Podman](https://podman.io/)

```sh
# With npm
npm install -g mocopro

# With Bun
bun install -g mocopro

# With mise
mise use -g node@24 # if not already installed
mise use -g npm:mocopro
```

### Self-Contained Binary

> [!NOTE]  
> Since it contains a full Node.js runtime, be aware of the size: ~60-110MB.

#### Linux, macOS and Windows WSL

```sh
curl -fsSL https://raw.githubusercontent.com/ivangabriele/mocopro/main/install.sh | bash
```

#### Non-WSL Windows

> [!WARNING]  
> Not recommended. Consider either using npm or WSL.

Download [the latest release](https://github.com/ivangabriele/mocopro/releases).

## Uninstallation

```sh
mocopro self-uninstall
```

> [!NOTE]  
> If you installed the self-contained binary on **non-WSL Windows**, this command won't work. You need to manually:
> 1. Stop and remove all your Docker/Podman MCP Server containers.
> 2. Delete the exe file wherever you pasted it.
> 3. Delete the `C:\Users\<username>\AppData\Local\mocopro` directory, if you want to remove all your data (settings and installed servers).

## Usage

### Install a server

```bash
# From owner/repository format
mocopro install drumnation/unsplash-smart-mcp-server

# From full GitHub URL
mocopro install https://github.com/drumnation/unsplash-smart-mcp-server

# With specific branch or tag
mocopro install drumnation/unsplash-smart-mcp-server#v1.0.0
```

### List installed servers

```bash
mocopro list
```

### Set environment variables

```bash
# Set one or more environment variables
mocopro env set unsplash-smart-mcp-server UNSPLASH_ACCESS_KEY=your_api_key

# List environment variables
mocopro env list unsplash-smart-mcp-server

# Unset environment variables
mocopro env unset unsplash-smart-mcp-server UNSPLASH_ACCESS_KEY
```

### Start a server

```bash
# Start in foreground (Ctrl+C to stop)
mocopro start unsplash-smart-mcp-server

# Start in background
mocopro start unsplash-smart-mcp-server --detach
```

### Stop a server

```bash
mocopro stop unsplash-smart-mcp-server
```

### Update a server

```bash
mocopro update unsplash-smart-mcp-server
```

### Uninstall a server

```bash
mocopro uninstall unsplash-smart-mcp-server
```

### Configure for Claude CLI

Add a server to Claude CLI configuration:

```bash
# Add to local configuration (.mcp.json in current directory)
mocopro setup claude add unsplash-smart-mcp-server

# Add to global configuration (~/.claude.json)
mocopro setup claude add unsplash-smart-mcp-server --global
```

Remove a server from Claude CLI configuration:

```bash
# Remove from local configuration
mocopro setup claude remove unsplash-smart-mcp-server

# Remove from global configuration
mocopro setup claude remove unsplash-smart-mcp-server --global
```

## MCP Server Requirements

MoCoPro can install MCP servers from GitHub that have either:

- A `Dockerfile` at the repository root, or
- A `smithery.yaml` configuration file at the repository root

## Data Storage

MoCoPro stores data in `~/.mocopro/`:

```
~/.mocopro/
├── registry.json    # Installed servers metadata
└── repos/           # Cloned repository sources
```

## Container Runtime

MoCoPro automatically detects and uses Podman if available, falling back to Docker. The runtime can be overridden by setting the `MOCOPRO_RUNTIME` environment variable:

```bash
MOCOPRO_RUNTIME=docker mocopro start my-server
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

[AGPL-3.0](LICENSE.md)
