
CREATE OR REPLACE FUNCTION public.publish_notification(
  p_title text,
  p_message text,
  p_tenant_id UUID,
  p_user_id UUID
) RETURNS VOID AS $$
BEGIN
  INSERT INTO notifications (tenant_id, user_id, title, message, type, created_at)
  VALUES (p_tenant_id, p_user_id, p_title, p_message, 'admin', now());
END;
$$ LANGUAGE plpgsql;
