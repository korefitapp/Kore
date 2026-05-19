"use client";

import { Overview } from "./Overview";
import { MobileSidebar, Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import type { PendingProfessional } from "./types";

export function AdminShell({
  adminName,
  pending,
}: {
  adminName: string;
  pending: PendingProfessional[];
}) {
  return (
    <div className="min-h-screen flex bg-kore-bg text-kore-ink">
      <Sidebar />
      <MobileSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="flex-1">
          <Overview adminName={adminName} pending={pending} />
        </main>
      </div>
    </div>
  );
}
