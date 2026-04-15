---
name: SSM SSO System
description: Custom SSO with central auth, per-project access control, and audit logging
type: feature
---
## Architecture
SSM Partner = **Auth Master**. Other projects authenticate via the `sso-auth` edge function API.
No self-registration — all users are created centrally by admins.

## Registered Projects
| Key | Name | Roles |
|-----|------|-------|
| ssm-partner | SSM Partner Website | app_role enum (superadmin, admin, backoffice, ...) |
| ssm-recruit | SSM Recruit | app_role enum (superadmin, admin, backoffice, analyst, teamleiter, controlling, geschaeftsleitung, hr, agency_manager) |
| ssm-cockpit | SSM Cockpit | user_role enum (super_admin, vertriebsleiter, agenturleiter, berater, teamleiter, verkaufsleiter) |

## Role Mapping (SSM Partner → other projects)
| SSM Partner Role | SSM Recruit | SSM Cockpit |
|-----------------|-------------|-------------|
| superadmin | superadmin | super_admin |
| admin | admin | vertriebsleiter |
| teamleiter | teamleiter | teamleiter |
| agency_manager | agency_manager | agenturleiter |

## Database Tables
- `sso_projects` — registered projects (project_key, name, api_url, api_secret)
- `project_access` — per-user per-project access (user_id, project_id, active, granted_by)
- `auth_audit_log` — login/access activity (user_id, user_email, project_key, action, ip, user_agent, metadata)

## SSO Auth API (`sso-auth` edge function)
External projects call:
- `verify` — authenticate user + check project access → user info + sso_token
- `check_access` — quick boolean check
- `get_user_info` — full profile with role + project list

Admin actions (superadmin auth required):
- `grant_access` / `revoke_access` — toggle user's project access
- `generate_secret` — generate/rotate API secret for a project
- `audit_log` — fetch activity history

## Login Flows
1. **API-basiert**: Projekt sendet Credentials an SSO-API `verify` endpoint
2. **Redirect-basiert**: Projekt leitet zu `/login?project_key=ssm-cockpit&redirect_uri=https://...&state=...` weiter. Nach Login wird mit sso_token zurückgeleitet.

## User Creation
Beim Erstellen eines Benutzers unter `/admin/users` können direkt Projektzugriffe zugewiesen werden (Checkboxen). Die Benutzertabelle zeigt zugewiesene Projekte an.

## Admin UI
- `/admin/sso` — Zugangsmatrix, Projekte & API-Keys (generieren/kopieren), Aktivitätslog
- `/admin/users` — Benutzerverwaltung mit Projektzugriff bei Erstellung

## Sidebar Position
Benutzer + SSO & Zugriff are in bottomLinks, below Einstellungen.

## Future: Microsoft 365
When available, Microsoft Entra ID replaces email/password.
