CREATE OR REPLACE FUNCTION create_notification_row(
  p_recipient_user_id varchar,
  p_channel notification_channel,
  p_title varchar,
  p_message text,
  p_link varchar DEFAULT NULL,
  p_entity_type varchar DEFAULT NULL,
  p_entity_id uuid DEFAULT NULL,
  p_actor_user_id varchar DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO notifications (
    recipient_user_id,
    actor_user_id,
    channel,
    title,
    message,
    link,
    entity_type,
    entity_id
  )
  VALUES (
    p_recipient_user_id,
    p_actor_user_id,
    p_channel,
    p_title,
    p_message,
    p_link,
    p_entity_type,
    p_entity_id::text
  );
END;
$$ LANGUAGE plpgsql;
