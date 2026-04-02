-- Enable Realtime for links and folders tables
-- Required for cross-tab / cross-device live sync via Supabase Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE links;
ALTER PUBLICATION supabase_realtime ADD TABLE folders;
