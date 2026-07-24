# Security

Sentinel uses bcrypt cost 12, short-lived (15-minute) signed access tokens, and seven-day opaque refresh tokens in HTTP-only, Secure-in-production, SameSite=Strict cookies. Refreshes rotate; replay of a known session revokes that session family. Login and signup are rate limited, and failed attempts trigger a 15-minute lockout after five failures.

Every API edge validates Zod input; Prisma parameterizes database operations. Authenticated resource lookups are scoped to the current owner in service code, preventing IDOR. UUID identifiers are used throughout. Helmet sets hardened HTTP headers, CORS is restricted to `WEB_ORIGIN`, state-changing cookie-authenticated routes require a matching CSRF header/cookie, and production error responses do not expose stack traces.

Sensitive actions are append-only audit records with actor, action, IP, and timestamp. Secrets are environment-only and validated at startup. CI runs audit, lint, typecheck, tests, and builds.

Media uploads must be routed through private S3-compatible storage, with server-generated object keys, MIME plus magic-byte checks, strict size limits, and an antivirus gate before availability. Signed short-lived reads are required; buckets must not be public. The storage interface and environment configuration are present; provider credentials and malware scanner are operational deployment responsibilities.

Email verification and password-reset records are one-time/expiring by schema design. A transactional mail integration must be configured before enabling those endpoints. TOTP is intentionally represented as a settings capability pending a server-side verifier and encrypted secret store.
