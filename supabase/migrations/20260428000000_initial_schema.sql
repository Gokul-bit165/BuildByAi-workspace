-- Create custom types
CREATE TYPE user_role AS ENUM ('member', 'admin');
CREATE TYPE project_status AS ENUM ('active', 'completed', 'archived');
CREATE TYPE inquiry_status AS ENUM ('new', 'read', 'replied');
CREATE TYPE phase_status AS ENUM ('locked', 'active', 'completed');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'done');

-- Create users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  role user_role DEFAULT 'member',
  github_username TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create projects table (public portfolio)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image TEXT,
  tags TEXT[] DEFAULT '{}',
  status project_status DEFAULT 'active',
  github_url TEXT,
  demo_url TEXT,
  client_id UUID, -- References clients(id) later
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create team_members table (public facing team info)
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  role_title TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blog_posts table
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content_md TEXT NOT NULL,
  cover_image TEXT,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create contact_inquiries table
CREATE TABLE contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status inquiry_status DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  company TEXT,
  avatar_url TEXT,
  portal_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key to projects for client_id now that clients table exists
ALTER TABLE projects ADD CONSTRAINT fk_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;

-- Create client_projects table (internal workspace projects)
CREATE TABLE client_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  current_phase UUID, -- Will reference phases(id) later
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create phases table
CREATE TABLE phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  status phase_status DEFAULT 'locked',
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key to client_projects for current_phase
ALTER TABLE client_projects ADD CONSTRAINT fk_current_phase FOREIGN KEY (current_phase) REFERENCES phases(id) ON DELETE SET NULL;

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID REFERENCES phases(id) ON DELETE CASCADE,
  client_project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  priority task_priority DEFAULT 'medium',
  status task_status DEFAULT 'todo',
  due_date TIMESTAMPTZ,
  time_logged_mins INTEGER DEFAULT 0 CHECK (time_logged_mins >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table (chat)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_ai BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create files table
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_client_visible BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create wiki_pages table
CREATE TABLE wiki_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content_md TEXT NOT NULL,
  edited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create standups table
CREATE TABLE standups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  yesterday TEXT NOT NULL,
  today TEXT NOT NULL,
  blockers TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create time_entries table
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  minutes INTEGER NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create github_events table
CREATE TABLE github_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  repo TEXT NOT NULL,
  event_type TEXT NOT NULL,
  message TEXT NOT NULL,
  author TEXT NOT NULL,
  sha TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up Row Level Security (RLS)

-- Helper to check if user is admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE standups ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_events ENABLE ROW LEVEL SECURITY;

-- Policies for public access
CREATE POLICY "Public can view active projects" ON projects FOR SELECT USING (status = 'active');
CREATE POLICY "Public can view visible team members" ON team_members FOR SELECT USING (is_visible = true);
CREATE POLICY "Public can view published blog posts" ON blog_posts FOR SELECT USING (published_at IS NOT NULL AND published_at <= NOW());
CREATE POLICY "Public can submit contact inquiries" ON contact_inquiries FOR INSERT WITH CHECK (true);

-- Policies for team members (authenticated users)
CREATE POLICY "Team members can view all data" ON users FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Team members can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- For simplicity in MVP, team members can read/write everything in workspace tables
CREATE POLICY "Team members full access to client_projects" ON client_projects FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Team members full access to phases" ON phases FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Team members full access to tasks" ON tasks FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Team members full access to messages" ON messages FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Team members full access to files" ON files FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Team members full access to wiki_pages" ON wiki_pages FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Team members full access to standups" ON standups FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Team members full access to time_entries" ON time_entries FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Team members full access to github_events" ON github_events FOR ALL USING (auth.uid() IS NOT NULL);

-- Admin only policies
CREATE POLICY "Admins full access to projects" ON projects FOR ALL USING (is_admin());
CREATE POLICY "Admins full access to team_members" ON team_members FOR ALL USING (is_admin());
CREATE POLICY "Admins full access to blog_posts" ON blog_posts FOR ALL USING (is_admin());
CREATE POLICY "Admins full access to contact_inquiries" ON contact_inquiries FOR ALL USING (is_admin());
CREATE POLICY "Admins full access to clients" ON clients FOR ALL USING (is_admin());

-- Client Portal Policies (based on token in some contexts, but RLS uses auth.uid() usually. 
-- For unauthenticated portal access we might need to use a different approach, e.g. bypassing RLS via service role or token matching)
-- For MVP, we will use Supabase service role key in server actions for portal access since clients don't log in.

-- Add indexes
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_messages_channel ON messages(channel);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tasks and blog_posts
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to automatically create a users table record when a new auth.users account is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
