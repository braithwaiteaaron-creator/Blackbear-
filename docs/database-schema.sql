CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'enterprise');
CREATE TYPE quiz_tier_completed AS ENUM ('beginner', 'intermediate', 'advanced', 'full');
CREATE TYPE device_type AS ENUM ('mobile', 'tablet', 'desktop');
CREATE TYPE certification_tier AS ENUM ('foundation', 'developing', 'advanced', 'expert');
CREATE TYPE organization_subscription AS ENUM ('team', 'enterprise');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  organization TEXT,
  role TEXT,
  linkedin_url TEXT,
  subscription_tier subscription_tier NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE quiz_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier_completed quiz_tier_completed NOT NULL,
  total_score INTEGER NOT NULL CHECK (total_score BETWEEN 0 AND 15),
  beginner_score INTEGER NOT NULL CHECK (beginner_score BETWEEN 0 AND 5),
  intermediate_score INTEGER NOT NULL CHECK (intermediate_score BETWEEN 0 AND 5),
  advanced_score INTEGER NOT NULL CHECK (advanced_score BETWEEN 0 AND 5),
  time_to_complete INTEGER NOT NULL CHECK (time_to_complete >= 0),
  device_type device_type NOT NULL,
  traffic_source TEXT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE question_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL CHECK (question_id BETWEEN 1 AND 15),
  selected_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_on_question INTEGER NOT NULL CHECK (time_on_question >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  certification_tier certification_tier NOT NULL,
  badge_url TEXT NOT NULL,
  credly_badge_id TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  share_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  subscription_type organization_subscription NOT NULL,
  seat_count INTEGER NOT NULL DEFAULT 1,
  admin_user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE organization_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  total_participants INTEGER NOT NULL DEFAULT 0,
  average_score NUMERIC(5, 2) NOT NULL DEFAULT 0,
  beginner_avg NUMERIC(5, 2) NOT NULL DEFAULT 0,
  intermediate_avg NUMERIC(5, 2) NOT NULL DEFAULT 0,
  advanced_avg NUMERIC(5, 2) NOT NULL DEFAULT 0,
  top_knowledge_gaps JSONB NOT NULL DEFAULT '[]'::jsonb,
  report_url TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
