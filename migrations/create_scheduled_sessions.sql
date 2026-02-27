CREATE TABLE IF NOT EXISTS scheduled_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id varchar NOT NULL,
    tutor_id varchar NOT NULL,
    scheduled_time timestamp NOT NULL,
    type varchar NOT NULL,
    status varchar NOT NULL,
    parent_confirmed boolean DEFAULT false,
    tutor_confirmed boolean DEFAULT false,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);
