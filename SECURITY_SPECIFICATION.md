# Security & Risk Specification — Core & Visual Companion

## 1. Threat Modeling for Local Visual Companion

Because the C++ engine runs an embedded HTTP server on the user's local machine, the following attack vectors were evaluated and mitigated:

### 1.1 Localhost Restriction
- **Risk**: Unintended network exposure if the server listens on all interfaces (`0.0.0.0`).
- **Mitigation**: The socket explicitly binds to `127.0.0.1` (IPv4 loopback), preventing external devices on the local area network (LAN) from accessing the API or files.

### 1.2 Path Traversal Protection
- **Risk**: A malicious HTTP request such as `GET /../../Windows/System32/config` attempting to read sensitive OS files.
- **Mitigation**: The static file server strictly validates requested file paths, prevents `..` sequences, and only serves files strictly located within the sanitized `web/` subfolder.

### 1.3 Request Body Limits & Memory Exhaustion
- **Risk**: A client sending huge POST payloads.
- **Mitigation**: HTTP request headers and bodies are limited to 64KB max buffer size, and socket read operations are non-blocking with strict timeouts.

### 1.4 Input Sanitization & Delimiter Safety
- **Risk**: Injection of pipe delimiters (`|`) in guest names or table types.
- **Mitigation**: Input strings are sanitized to replace pipe characters with hyphens before writing to persistent text files.
