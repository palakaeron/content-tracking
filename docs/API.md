# API

All endpoints are prefixed with `/api/v1` and return `{ success, data, meta? }` or `{ success:false, error:{code,message,details?} }`.

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/signup` | Create user; sets refresh and CSRF cookies |
| POST | `/auth/login` | Login; sets refresh and CSRF cookies |
| POST | `/auth/refresh` | Rotate refresh token |
| POST | `/auth/logout` | Revoke refresh session family |
| GET/POST | `/content` | Paginated private list / create content |
| GET/PATCH/DELETE | `/content/:id` | Owner-scoped detail/update/soft-delete |
| POST | `/content/:id/scan` | Run configured detection provider |
| GET | `/analytics/summary` | Aggregated dashboard metrics |
| GET | `/alerts` | Owner-scoped detection alerts |
| PATCH | `/alerts/:id` | Update alert status |

Health checks: `GET /health` and `GET /api/v1/health` are available without authentication.

Use `Authorization: Bearer <access token>` after authentication. For state-changing requests send `X-CSRF-Token` equal to the readable `csrf` cookie.
