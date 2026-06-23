"use client";

import { Overview } from "./Overview";
import { MobileSidebar, Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function NutriShell({ nutriName, dashboardData }: { nutriName: string, dashboardData: any }) {
  return (
    <div className="min-h-screen flex bg-kore-bg text-kore-ink">
      <Sidebar />
      <MobileSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="flex-1">
          <Overview nutriName={nutriName} dashboardData={dashboardData} />
        </main>
      </div>
    </div>
  );
}
