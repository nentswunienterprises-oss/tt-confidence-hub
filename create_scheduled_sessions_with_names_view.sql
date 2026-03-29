-- Migration: Create view for scheduled_sessions with parent and tutor names/emails
CREATE OR REPLACE VIEW public.scheduled_sessions_with_names AS
SELECT
  ss.*,
  p.full_name AS parent_full_name,
  pu.email AS parent_email,
  t.full_name AS tutor_full_name,
  t.email AS tutor_email
FROM
  public.scheduled_sessions ss
LEFT JOIN public.parents p ON ss.parent_id = p.id::text
LEFT JOIN public.users pu ON p.user_id = pu.id
LEFT JOIN public.tutor_applications t ON ss.tutor_id = t.id;
