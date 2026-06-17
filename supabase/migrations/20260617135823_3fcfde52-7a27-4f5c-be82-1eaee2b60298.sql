
DO $$
DECLARE
  rec RECORD;
  current_keep uuid;
  current_key text;
  current_last timestamptz;
BEGIN
  current_keep := NULL;
  current_key := NULL;
  current_last := NULL;

  FOR rec IN
    SELECT id, COALESCE(source,'') || '|' || COALESCE(page_url,'') AS k, created_at
    FROM chat_sessions
    ORDER BY COALESCE(source,''), COALESCE(page_url,''), created_at ASC
  LOOP
    IF current_key IS DISTINCT FROM rec.k OR rec.created_at - current_last > interval '30 minutes' THEN
      current_keep := rec.id;
      current_key := rec.k;
      current_last := rec.created_at;
    ELSE
      UPDATE chat_messages SET session_id = current_keep WHERE session_id = rec.id;
      DELETE FROM chat_sessions WHERE id = rec.id;
      current_last := rec.created_at;
    END IF;
  END LOOP;

  UPDATE chat_sessions s
  SET updated_at = COALESCE((SELECT MAX(created_at) FROM chat_messages WHERE session_id = s.id), s.updated_at);
END $$;
