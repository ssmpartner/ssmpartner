---
name: User Management & Roles
description: User management with profiles, user_roles, app_role enum matching SSM Recruit structure
type: feature
---
- `profiles` table (id FK auth.users, display_name, avatar_url) with auto-create trigger
- `user_roles` table with `app_role` enum: superadmin, admin, backoffice, analyst, teamleiter, controlling, geschaeftsleitung, hr, agency_manager
- `has_role()` and `get_user_role()` security definer functions to avoid RLS recursion
- `manage-users` edge function for CRUD (create, update_role, update_email, reset_password, delete, list)
- Admin UI at /admin/users with role badges, inline role editing, password reset
- AuthContext loads profile + role, exposes `isSuperadmin` and `isAdmin`
- Existing users: bilel.chagra@ssmpartner.ch = superadmin, ivo.branco@ssmpartner.ch = admin
- Structure mirrors SSM Recruit for future cross-project SSO via Microsoft 365
