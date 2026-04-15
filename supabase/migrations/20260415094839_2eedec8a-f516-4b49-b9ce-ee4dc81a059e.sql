
-- Allow authenticated users to read projects they have active access to
CREATE POLICY "Users can read their assigned projects"
ON public.sso_projects
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT project_id FROM public.project_access
    WHERE user_id = auth.uid() AND active = true
  )
);
