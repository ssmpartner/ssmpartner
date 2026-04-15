---
name: SSM SSO System
description: Custom SSO with central auth, per-project access control, and audit logging
type: feature
---
## Architecture
SSM Partner = **Auth Master**. Other projects (SSM Recruit etc.) authenticate via the `sso-auth` edge function API.

## Database Tables
- `sso_projects` — registered projects (project_key, name, api_url, api_secret)
- `project_access` — per-user per-project access (user_id, project_id, active, granted_by)
- `auth_audit_log` — login/access activity (user_id, user_email, project_key, action, ip, user_agent, metadata)

## SSO Auth API (`sso-auth` edge function)
External projects call these actions:
- `verify` — authenticate user (email+password) and check project access, returns user info + sso_token
- `check_access` — quick boolean check if user has access to a project
- `get_user_info` — full user profile with role and project list

Admin actions (require superadmin auth):
- `grant_access` / `revoke_access` — toggle user's project access
- `audit_log` — fetch activity history

## How Other Projects Integrate
```typescript
const response = await fetch("https://nopqgykpyaieyizvhuma.supabase.co/functions/v1/sso-auth", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-sso-api-key": "PROJECT_API_SECRET",
  },
  body: JSON.stringify({
    action: "verify",
    email: userEmail,
    password: userPassword,
    project_key: "ssm-recruit",
  }),
});
```

## Admin UI
- `/admin/sso` — Zugangsmatrix (user × project grid), Projektübersicht, Aktivitätslog
- `/admin/users` — Benutzerverwaltung (erstellen, Rollen, Passwort-Reset)

## Future: Microsoft 365
When available, Microsoft Entra ID replaces email/password login. The `sso-auth` function will be extended with an OAuth flow.
