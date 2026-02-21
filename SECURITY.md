# Security Policy

## Reporting a vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public issue
2. Email [info@openpoem.org](mailto:info@openpoem.org) with details
3. Include steps to reproduce if possible

You can expect a response within 7 days.

## Scope

This is an MCP server that runs locally. It does not:
- Accept network connections (stdio transport only)
- Store or transmit credentials
- Access the filesystem beyond what Deno permissions allow

The CLI (`cli.ts`) sends spec text to a user-configured LLM API endpoint. No data is sent anywhere without explicit user configuration.
