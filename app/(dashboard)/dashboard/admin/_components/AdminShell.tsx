"use client";

import { Overview } from "./Overview";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AdminShell({ adminName }: { adminName: string }) {
  return (
    <div className="min-h-screen flex bg-kore-bg text-kore-ink">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="flex-1">
          <Overview adminName={adminName} />
        </main>
      </div>
    </div>
  );
}
