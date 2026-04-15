-- Add new roles to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'vertriebsleiter';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'agenturleiter';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'finanzcoach';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'trainee';