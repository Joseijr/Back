ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS secondary_phone text;

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS item_status text NOT NULL DEFAULT 'lost';

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'post_request',
  title text NOT NULL,
  content text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);