"use client";

import { MobileSidebar, Sidebar } from "../_components/Sidebar";
import { Topbar } from "../_components/Topbar";

export default function FinanceiroLoading() {
  return (
    <div className="min-h-screen flex bg-kore-bg text-kore-ink">
      <Sidebar />
      <MobileSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />

        <main className="flex-1 px-3 sm:px-6 py-6 space-y-6 max-w-7xl mx-auto w-full animate-pulse">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="h-8 bg-kore-card border border-kore-border rounded-lg w-48"></div>
              <div className="h-4 bg-kore-card border border-kore-border rounded-lg w-32"></div>
            </div>
            <div className="h-10 bg-kore-card border border-kore-border rounded-xl w-36 self-start sm:self-auto"></div>
          </div>

          {/* KPIs Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-kore-card border border-kore-border rounded-2xl p-5 sm:p-6 shadow-kore-soft h-32"></div>
            ))}
          </div>

          {/* Grid Dividido Skeleton */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <div className="bg-kore-card border border-kore-border rounded-3xl h-[400px] shadow-kore-soft"></div>
            </div>
            <div className="xl:col-span-1">
              <div className="bg-kore-card border border-kore-border rounded-3xl h-[400px] shadow-kore-soft"></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
