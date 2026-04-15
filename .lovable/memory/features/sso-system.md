---
name: SSM SSO System
description: Custom SSO with central auth, per-project access control, and audit logging
type: feature
---
## Architecture
SSM Partner = **Auth Master**. Other projects authenticate via the `sso-auth` edge function API.
No self-registration — all users are created centrally by admins.

## Registered Projects
| Key | Name |
|-----|------|
| ssm-partner | SSM Partner Website |
| ssm-recruit | SSM Recruit |
| ssm-cockpit | SSM Cockpit |

## Unified Roles (all projects)
superadmin, admin, vertriebsleiter, agenturleiter, teamleiter, finanzcoach, trainee, controlling, geschaeftsleitung, hr, backoffice, analyst
(Legacy: agency_manager → replaced by agenturleiter)

## Standard Agencies (all projects)
Urtenen-Schönbühl, Regensdorf, Rothenburg, Olten, Lugano, Spreitenbach, Adliswil

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
2. **Redirect-basiert**: Projekt leitet zu `/login?project_key=ssm-cockpit&redirect_uri=https://...&state=...` weiter

## User Creation
Beim Erstellen eines Benutzers unter `/admin/users` können direkt Projektzugriffe zugewiesen werden (Checkboxen).

## Admin UI
- `/admin/sso` — Zugangsmatrix, Projekte & API-Keys, Aktivitätslog
- `/admin/users` — Benutzerverwaltung mit Projektzugriff bei Erstellung

## Sidebar Position
Benutzer + SSO & Zugriff are in bottomLinks, below Einstellungen.
