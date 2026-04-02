-- Enable Realtime for links and folders tables
-- Required for cross-tab / cross-device live sync via Supabase Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE links;
ALTER PUBLICATION supabase_realtime ADD TABLE folders;

-- REPLICA IDENTITY FULL is required for postgres_changes to work with RLS.
-- Without it, Supabase cannot verify user_id on changed rows and will not
-- deliver events to the subscriber.
ALTER TABLE links   REPLICA IDENTITY FULL;
ALTER TABLE folders REPLICA IDENTITY FULL;
