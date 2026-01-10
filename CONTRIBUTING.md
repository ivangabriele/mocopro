# Contributing to MoCoPro

Thank you for your interest in contributing to MoCoPro! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to help maintain a welcoming community.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) >= 1.3
- [Podman](https://podman.io/) or [Docker](https://www.docker.com/)
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/mocopro.git
   cd mocopro
   ```
3. Install dependencies:
   ```bash
   bun install
   ```

## Development Workflow

### Running the CLI locally

```bash
bun run dev -- <command>
```

For example:
```bash
bun run dev -- install owner/repository
bun run dev -- list
```

### Code Quality

Before submitting a pull request, ensure your code passes all checks:

```bash
# Run all tests
bun test

# Run unit tests only
bun run test:unit

# Run linting and formatting
bun run test:lint

# Run type checking
bun run test:type
```

### Coding Standards

- **TypeScript**: Use strict mode with strong typings
- **Functions**: Keep functions small and focused
- **Files**: Keep files small with clear separation of concerns
- **Naming**: Use full words, no abbreviations
- **Comments**: No inline comments; use docstrings for modules and functions only
- **Testing**: All functions must be unit tested with full coverage in mind
- **Paradigm**: Follow functional programming principles

### Project Structure

```
src/
├── commands/       # CLI command handlers
├── core/           # Core business logic
├── libs/           # Utility libraries
└── types/          # TypeScript type definitions
```

Tests are colocated with source files in `__tests__/` directories.

## Submitting Changes

### Pull Request Process

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them with clear, descriptive messages

3. Push your branch and open a pull request

4. Ensure all CI checks pass

5. Wait for review and address any feedback

### Commit Messages

- Use clear, descriptive commit messages
- Start with a verb in present tense (e.g., "Add", "Fix", "Update")
- Keep the first line under 72 characters

## Reporting Issues

When reporting issues, please include:

- A clear description of the problem
- Steps to reproduce the issue
- Expected vs actual behavior
- Your environment (OS, Bun version, container runtime)

## Questions?

Feel free to open an issue for any questions about contributing.
