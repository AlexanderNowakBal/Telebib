-- RLS Policies
-- These policies enforce workspace-level role permissions.
-- Default deny is already enforced when RLS is enabled with no policies.

-- ─── Helper function: get user role in workspace ──────────────────────────────
create or replace function public.get_workspace_role(ws_id uuid, uid uuid)
returns text language sql security definer stable as $$
  select role from public.workspace_members
  where workspace_id = ws_id and user_id = uid
  limit 1;
$$;

-- ─── Profiles ────────────────────────────────────────────────────────────────

create policy "Users can view own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

-- ─── Workspaces ──────────────────────────────────────────────────────────────

create policy "Members can view their workspaces"
  on public.workspaces for select
  using (
    exists (
      select 1 from public.workspace_members
      where workspace_id = id and user_id = auth.uid()
    )
  );

create policy "Authenticated users can create workspaces"
  on public.workspaces for insert
  with check (auth.uid() is not null);

create policy "Owners can update workspace"
  on public.workspaces for update
  using (get_workspace_role(id, auth.uid()) = 'owner');

create policy "Owners can delete workspace"
  on public.workspaces for delete
  using (get_workspace_role(id, auth.uid()) = 'owner');

-- ─── Workspace Members ────────────────────────────────────────────────────────

create policy "Members can view workspace members"
  on public.workspace_members for select
  using (
    exists (
      select 1 from public.workspace_members wm2
      where wm2.workspace_id = workspace_members.workspace_id
        and wm2.user_id = auth.uid()
    )
  );

create policy "Admins can insert members"
  on public.workspace_members for insert
  with check (
    get_workspace_role(workspace_id, auth.uid()) in ('owner', 'admin')
  );

create policy "Owners can change roles"
  on public.workspace_members for update
  using (get_workspace_role(workspace_id, auth.uid()) = 'owner');

create policy "Admins can remove members"
  on public.workspace_members for delete
  using (get_workspace_role(workspace_id, auth.uid()) in ('owner', 'admin'));

-- ─── Boards ──────────────────────────────────────────────────────────────────

create policy "Members can view boards"
  on public.boards for select
  using (
    get_workspace_role(workspace_id, auth.uid()) is not null
  );

create policy "Admins can create boards"
  on public.boards for insert
  with check (
    get_workspace_role(workspace_id, auth.uid()) in ('owner', 'admin')
  );

create policy "Admins can update boards"
  on public.boards for update
  using (
    get_workspace_role(workspace_id, auth.uid()) in ('owner', 'admin')
  );

-- ─── Columns ─────────────────────────────────────────────────────────────────

create policy "Members can view columns"
  on public.columns for select
  using (
    exists (
      select 1 from public.boards b
      join public.workspace_members wm on wm.workspace_id = b.workspace_id
      where b.id = columns.board_id and wm.user_id = auth.uid()
    )
  );

create policy "Admins can manage columns"
  on public.columns for all
  using (
    exists (
      select 1 from public.boards b
      where b.id = columns.board_id
        and get_workspace_role(b.workspace_id, auth.uid()) in ('owner', 'admin')
    )
  );

-- ─── Cards ───────────────────────────────────────────────────────────────────

create policy "Members can view cards"
  on public.cards for select
  using (
    exists (
      select 1 from public.boards b
      join public.workspace_members wm on wm.workspace_id = b.workspace_id
      where b.id = cards.board_id and wm.user_id = auth.uid()
    )
  );

create policy "Members can create cards"
  on public.cards for insert
  with check (
    exists (
      select 1 from public.boards b
      where b.id = cards.board_id
        and get_workspace_role(b.workspace_id, auth.uid()) in ('owner', 'admin', 'member')
    )
  );

create policy "Members can update cards"
  on public.cards for update
  using (
    exists (
      select 1 from public.boards b
      where b.id = cards.board_id
        and get_workspace_role(b.workspace_id, auth.uid()) in ('owner', 'admin', 'member')
    )
  );

-- ─── Labels ──────────────────────────────────────────────────────────────────

create policy "Members can view labels"
  on public.labels for select
  using (
    exists (
      select 1 from public.boards b
      join public.workspace_members wm on wm.workspace_id = b.workspace_id
      where b.id = labels.board_id and wm.user_id = auth.uid()
    )
  );

create policy "Members can manage labels"
  on public.labels for all
  using (
    exists (
      select 1 from public.boards b
      where b.id = labels.board_id
        and get_workspace_role(b.workspace_id, auth.uid()) in ('owner', 'admin', 'member')
    )
  );

-- ─── Card Labels ─────────────────────────────────────────────────────────────

create policy "Members can view card labels"
  on public.card_labels for select
  using (
    exists (
      select 1 from public.cards c
      join public.boards b on b.id = c.board_id
      join public.workspace_members wm on wm.workspace_id = b.workspace_id
      where c.id = card_labels.card_id and wm.user_id = auth.uid()
    )
  );

create policy "Members can manage card labels"
  on public.card_labels for all
  using (
    exists (
      select 1 from public.cards c
      join public.boards b on b.id = c.board_id
      where c.id = card_labels.card_id
        and get_workspace_role(b.workspace_id, auth.uid()) in ('owner', 'admin', 'member')
    )
  );
