DO $$
BEGIN
  CREATE TYPE notification_channel AS ENUM ('action_required', 'informational');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_user_id varchar REFERENCES users(id) ON DELETE SET NULL,
  channel notification_channel NOT NULL DEFAULT 'informational',
  title varchar NOT NULL,
  message text NOT NULL,
  link varchar,
  entity_type varchar,
  entity_id varchar,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamp,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read_created
  ON notifications(recipient_user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created
  ON notifications(recipient_user_id, created_at DESC);

CREATE OR REPLACE FUNCTION create_notification_row(
  p_recipient_user_id varchar,
  p_channel notification_channel,
  p_title varchar,
  p_message text,
  p_link varchar DEFAULT NULL,
  p_entity_type varchar DEFAULT NULL,
  p_entity_id varchar DEFAULT NULL,
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
    p_entity_id
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION notify_scheduled_session_changes()
RETURNS trigger AS $$
DECLARE
  lesson_label text;
  parent_link text := '/client/parent/updates';
  tutor_link text := '/tutor/updates';
  student_link text := '/client/student/updates';
BEGIN
  lesson_label := upper(coalesce(NEW.type, 'session')) || ' lesson on ' || to_char(NEW.scheduled_time, 'Mon DD at HH12:MI PM');

  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'pending_tutor_confirmation' THEN
      PERFORM create_notification_row(
        NEW.tutor_id,
        'action_required',
        'New lesson awaiting confirmation',
        'You have a new ' || lower(coalesce(NEW.type, 'session')) || ' lesson to confirm: ' || lesson_label,
        tutor_link,
        'scheduled_session',
        NEW.id,
        NEW.parent_id
      );
    ELSIF NEW.status = 'pending_parent_confirmation' THEN
      PERFORM create_notification_row(
        NEW.parent_id,
        'action_required',
        'Lesson awaiting your confirmation',
        'A ' || lower(coalesce(NEW.type, 'session')) || ' lesson is waiting for your confirmation: ' || lesson_label,
        parent_link,
        'scheduled_session',
        NEW.id,
        NEW.tutor_id
      );
    ELSIF NEW.status = 'confirmed' THEN
      PERFORM create_notification_row(
        NEW.tutor_id,
        'informational',
        'Lesson confirmed',
        'Your ' || lower(coalesce(NEW.type, 'session')) || ' lesson has been confirmed: ' || lesson_label,
        tutor_link,
        'scheduled_session',
        NEW.id,
        NEW.parent_id
      );
      PERFORM create_notification_row(
        NEW.parent_id,
        'informational',
        'Lesson confirmed',
        'Your ' || lower(coalesce(NEW.type, 'session')) || ' lesson has been confirmed: ' || lesson_label,
        parent_link,
        'scheduled_session',
        NEW.id,
        NEW.tutor_id
      );
    END IF;

    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      IF NEW.status = 'confirmed' THEN
        PERFORM create_notification_row(
          NEW.tutor_id,
          'informational',
          'Lesson confirmed',
          'Your ' || lower(coalesce(NEW.type, 'session')) || ' lesson has been confirmed: ' || lesson_label,
          tutor_link,
          'scheduled_session',
          NEW.id,
          NEW.parent_id
        );
        PERFORM create_notification_row(
          NEW.parent_id,
          'informational',
          'Lesson confirmed',
          'Your ' || lower(coalesce(NEW.type, 'session')) || ' lesson has been confirmed: ' || lesson_label,
          parent_link,
          'scheduled_session',
          NEW.id,
          NEW.tutor_id
        );
      ELSIF NEW.status = 'completed' THEN
        PERFORM create_notification_row(
          NEW.tutor_id,
          'informational',
          'Lesson completed',
          'Your ' || lower(coalesce(NEW.type, 'session')) || ' lesson is now marked completed: ' || lesson_label,
          tutor_link,
          'scheduled_session',
          NEW.id,
          NEW.parent_id
        );
        PERFORM create_notification_row(
          NEW.parent_id,
          'informational',
          'Lesson completed',
          'Your ' || lower(coalesce(NEW.type, 'session')) || ' lesson is now marked completed: ' || lesson_label,
          parent_link,
          'scheduled_session',
          NEW.id,
          NEW.tutor_id
        );
      END IF;
    END IF;

    IF NEW.recording_status IS DISTINCT FROM OLD.recording_status THEN
      IF NEW.recording_status = 'recording_required' THEN
        PERFORM create_notification_row(
          NEW.tutor_id,
          'action_required',
          'Recording required',
          'Upload the recording for ' || lower(coalesce(NEW.type, 'session')) || ': ' || lesson_label,
          tutor_link,
          'scheduled_session',
          NEW.id,
          NEW.parent_id
        );
      ELSIF NEW.recording_status = 'recording_uploaded' THEN
        PERFORM create_notification_row(
          NEW.tutor_id,
          'informational',
          'Recording uploaded',
          'Recording received for ' || lower(coalesce(NEW.type, 'session')) || ': ' || lesson_label,
          tutor_link,
          'scheduled_session',
          NEW.id,
          NEW.parent_id
        );
        PERFORM create_notification_row(
          NEW.parent_id,
          'informational',
          'Recording uploaded',
          'Recording received for ' || lower(coalesce(NEW.type, 'session')) || ': ' || lesson_label,
          parent_link,
          'scheduled_session',
          NEW.id,
          NEW.tutor_id
        );
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_scheduled_session_changes ON scheduled_sessions;
CREATE TRIGGER trg_notify_scheduled_session_changes
AFTER INSERT OR UPDATE ON scheduled_sessions
FOR EACH ROW
EXECUTE FUNCTION notify_scheduled_session_changes();
