"use client";

import { Overview } from "./Overview";
import { MobileSidebar, Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function PersonalShell({ personalName }: { personalName: string }) {
  return (
    <div className="min-h-screen flex bg-kore-bg text-kore-ink">
      <Sidebar />
      <MobileSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="flex-1">
          <Overview personalName={personalName} />
        </main>
      </div>
    </div>
  );
}
