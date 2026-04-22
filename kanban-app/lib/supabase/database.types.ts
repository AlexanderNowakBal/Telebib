// Placeholder — regenerate with: npx supabase gen types typescript --project-id YOUR_PROJECT_ID
// This file is auto-generated; do not edit manually.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          locale: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string;
          avatar_url?: string | null;
          locale?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          display_name?: string;
          avatar_url?: string | null;
          locale?: string;
          updated_at?: string;
        };
      };
      workspaces: {
        Row: {
          id: string;
          name: string;
          slug: string;
          default_locale: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          default_locale?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          default_locale?: string;
          updated_at?: string;
        };
      };
      workspace_members: {
        Row: {
          workspace_id: string;
          user_id: string;
          role: string;
          joined_at: string;
        };
        Insert: {
          workspace_id: string;
          user_id: string;
          role?: string;
          joined_at?: string;
        };
        Update: {
          role?: string;
        };
      };
      boards: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          description: string;
          archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          description?: string;
          archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          archived?: boolean;
          updated_at?: string;
        };
      };
      columns: {
        Row: {
          id: string;
          board_id: string;
          name: string;
          position: number;
          is_done_column: boolean;
          wip_limit: number | null;
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          board_id: string;
          name: string;
          position: number;
          is_done_column?: boolean;
          wip_limit?: number | null;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          position?: number;
          is_done_column?: boolean;
          wip_limit?: number | null;
          version?: number;
          updated_at?: string;
        };
      };
      cards: {
        Row: {
          id: string;
          board_id: string;
          column_id: string;
          title: string;
          description: string;
          assignee_id: string | null;
          priority: string;
          due_date: string | null;
          position: number;
          version: number;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          board_id: string;
          column_id: string;
          title: string;
          description?: string;
          assignee_id?: string | null;
          priority?: string;
          due_date?: string | null;
          position: number;
          version?: number;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          assignee_id?: string | null;
          priority?: string;
          due_date?: string | null;
          position?: number;
          version?: number;
          archived_at?: string | null;
          updated_at?: string;
        };
      };
      labels: {
        Row: {
          id: string;
          board_id: string;
          name: string;
          color_token: string;
        };
        Insert: {
          id?: string;
          board_id: string;
          name: string;
          color_token: string;
        };
        Update: {
          name?: string;
          color_token?: string;
        };
      };
      card_labels: {
        Row: {
          card_id: string;
          label_id: string;
        };
        Insert: {
          card_id: string;
          label_id: string;
        };
        Update: Record<string, never>;
      };
    };
  };
}
