ALTER TABLE student_communication_messages
ADD COLUMN IF NOT EXISTS reply_to_message_id varchar REFERENCES student_communication_messages(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS student_communication_messages_reply_to_idx
  ON student_communication_messages(reply_to_message_id);
