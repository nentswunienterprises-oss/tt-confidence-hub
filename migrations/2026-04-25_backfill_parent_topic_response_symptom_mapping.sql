ALTER TABLE parent_enrollments
ADD COLUMN IF NOT EXISTS topic_response_symptoms jsonb,
ADD COLUMN IF NOT EXISTS topic_response_signal_scores jsonb,
ADD COLUMN IF NOT EXISTS topic_recommended_starting_phases jsonb;

UPDATE parent_enrollments
SET
  topic_response_symptoms = jsonb_build_object(
    btrim(math_struggle_areas),
    COALESCE(response_symptoms, '[]'::jsonb)
  ),
  topic_response_signal_scores = jsonb_build_object(
    btrim(math_struggle_areas),
    COALESCE(response_signal_scores, '{}'::jsonb)
  ),
  topic_recommended_starting_phases = jsonb_build_object(
    btrim(math_struggle_areas),
    jsonb_build_object(
      'phase', recommended_starting_phase,
      'supportingSymptoms', COALESCE(response_symptoms, '[]'::jsonb)
    )
  )
WHERE
  COALESCE(topic_response_symptoms, '{}'::jsonb) = '{}'::jsonb
  AND COALESCE(topic_response_signal_scores, '{}'::jsonb) = '{}'::jsonb
  AND COALESCE(topic_recommended_starting_phases, '{}'::jsonb) = '{}'::jsonb
  AND NULLIF(btrim(math_struggle_areas), '') IS NOT NULL
  AND math_struggle_areas !~ '[,\n;\|]'
  AND jsonb_typeof(COALESCE(response_symptoms, '[]'::jsonb)) = 'array'
  AND jsonb_array_length(COALESCE(response_symptoms, '[]'::jsonb)) > 0;
