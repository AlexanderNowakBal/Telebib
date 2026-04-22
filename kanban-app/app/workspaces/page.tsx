"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface WorkspaceItem {
  workspace_id: string;
  role: string;
  workspaces: {
    id: string;
    name: string;
    slug: string;
    created_at: string;
  } | null;
}

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        window.location.href = "/sign-in";
        return;
      }
      const { data, error } = await supabase
        .from("workspace_members")
        .select("workspace_id, role, workspaces(id, name, slug, created_at)")
        .eq("user_id", user.id)
        .order("workspace_id", { ascending: true });
      if (error) setError(error.message);
      else setWorkspaces((data as WorkspaceItem[]) ?? []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Chargement…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-red-500" role="alert">
          Erreur : {error}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Mes espaces de travail</h1>
        <Link
          href="/workspaces/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Nouvel espace
        </Link>
      </div>

      {workspaces.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">Aucun espace de travail pour le moment.</p>
          <Link
            href="/workspaces/new"
            className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline"
          >
            Créez votre premier espace →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3" role="list">
          {workspaces.map((wm) => {
            const ws = wm.workspaces;
            if (!ws) return null;
            return (
              <li
                key={ws.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm transition hover:shadow-md"
              >
                <div>
                  <Link
                    href={`/w/${ws.slug}`}
                    className="text-base font-medium text-gray-900 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    {ws.name}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5 capitalize">{wm.role}</p>
                </div>
                <Link
                  href={`/w/${ws.slug}`}
                  aria-label={`Ouvrir l'espace ${ws.name}`}
                  className="text-sm text-gray-400 hover:text-indigo-600"
                >
                  →
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
