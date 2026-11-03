-- Row-level security: defense in depth for multi-tenancy.
--
-- The app sets two transaction-local settings (see src/lib/db.ts):
--   app.tenant_id  = the current tenant's id   (tenantDb)
--   app.bypass_rls = 'on'                      (systemDb: login, webhooks, public pages)
-- A query run without either setting sees zero rows and cannot write.
-- FORCE makes the policies apply to the table owner too (the app's own role).

CREATE OR REPLACE FUNCTION app_rls_allows(row_tenant text) RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT current_setting('app.bypass_rls', true) = 'on'
      OR (row_tenant IS NOT NULL AND row_tenant = current_setting('app.tenant_id', true))
$$;

ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tenant" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "Tenant"
  USING (app_rls_allows("id")) WITH CHECK (app_rls_allows("id"));

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'User', 'Session', 'AgentProfile', 'Property', 'Generation', 'Microsite',
    'Contact', 'Deal', 'Task', 'Note', 'Activity', 'SavedView',
    'ChecklistItem', 'Cma', 'AuditLog'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I USING (app_rls_allows("tenantId")) WITH CHECK (app_rls_allows("tenantId"))',
      t
    );
  END LOOP;
END $$;
