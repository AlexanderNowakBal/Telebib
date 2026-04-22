-- Seed data for local development / E2E tests
-- Run after migrations.

-- Insert a demo workspace (requires a user to already exist in auth.users)
-- Replace '00000000-0000-0000-0000-000000000001' with a real user ID from your Supabase project.

do $$
declare
  demo_user_id uuid := '00000000-0000-0000-0000-000000000001';
  demo_ws_id   uuid := uuid_generate_v4();
  demo_board_id uuid := uuid_generate_v4();
  col_todo_id  uuid := uuid_generate_v4();
  col_wip_id   uuid := uuid_generate_v4();
  col_done_id  uuid := uuid_generate_v4();
begin
  -- Profile (upsert)
  insert into public.profiles (id, display_name) values (demo_user_id, 'Alice Démo')
  on conflict (id) do nothing;

  -- Workspace
  insert into public.workspaces (id, name, slug) values (demo_ws_id, 'Démo Workspace', 'demo')
  on conflict do nothing;

  -- Member (owner)
  insert into public.workspace_members (workspace_id, user_id, role)
  values (demo_ws_id, demo_user_id, 'owner') on conflict do nothing;

  -- Board
  insert into public.boards (id, workspace_id, name) values (demo_board_id, demo_ws_id, 'Board Démo')
  on conflict do nothing;

  -- Columns
  insert into public.columns (id, board_id, name, position, is_done_column, version) values
    (col_todo_id, demo_board_id, 'À faire', 1024, false, 1),
    (col_wip_id,  demo_board_id, 'En cours', 2048, false, 1),
    (col_done_id, demo_board_id, 'Fait', 3072, true, 1)
  on conflict do nothing;

  -- Cards
  insert into public.cards (board_id, column_id, title, priority, position, version) values
    (demo_board_id, col_todo_id, 'Préparer la démo client', 'high', 1024, 1),
    (demo_board_id, col_todo_id, 'Réviser la documentation', 'medium', 2048, 1),
    (demo_board_id, col_wip_id,  'Implémentation du board', 'high', 1024, 1),
    (demo_board_id, col_done_id, 'Setup du projet', 'low', 1024, 1)
  on conflict do nothing;
end $$;
