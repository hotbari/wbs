CREATE TABLE calendar_events (
  id              UUID PRIMARY KEY,
  owner_user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(200) NOT NULL,
  description     VARCHAR(2000),
  location        VARCHAR(200),
  start_at        TIMESTAMPTZ NOT NULL,
  end_at          TIMESTAMPTZ NOT NULL,
  all_day         BOOLEAN NOT NULL DEFAULT FALSE,
  is_public       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL,
  updated_at      TIMESTAMPTZ NOT NULL,
  CONSTRAINT chk_event_range CHECK (end_at >= start_at)
);

CREATE INDEX idx_calendar_events_range  ON calendar_events (start_at, end_at);
CREATE INDEX idx_calendar_events_owner  ON calendar_events (owner_user_id);
CREATE INDEX idx_calendar_events_public ON calendar_events (is_public) WHERE is_public = TRUE;
