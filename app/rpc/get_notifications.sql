CREATE OR REPLACE FUNCTION 
  p_user_id UUID,
  p_since TIMESTAMPTZ
) RETURNS TABLE (
  id UUID,
  tenant_id UUID,
  user_id UUID,
  title TEXT,
  message TEXT,
  type TEXT,
  created_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT id, tenant_id, user_id, title, message, type, created_at, read_at
  FROM notifications
  WHERE user_id = p_user_id
  AND (read_at IS NULL OR created_at > p_since)
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql;
