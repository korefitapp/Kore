import { NutriShell } from "./_components/NutriShell";

export default function NutriLoading() {
  return (
    <div className="min-h-screen flex bg-[#F8FAFC] dark:bg-[#0B1120] text-kore-ink">
      {/* Fake Sidebar */}
      <div className="hidden lg:flex w-64 bg-white dark:bg-[#0B1120] border-r border-kore-border flex-col p-4 animate-pulse">
        <div className="w-32 h-8 bg-kore-bg rounded-lg mb-8" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-full h-10 bg-kore-bg rounded-xl" />
          ))}
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Fake Topbar */}
        <div className="h-16 bg-white dark:bg-[#0B1120]/80 border-b border-kore-border flex items-center justify-between px-6 animate-pulse">
          <div className="w-64 h-8 bg-kore-bg rounded-xl" />
          <div className="w-10 h-10 bg-kore-bg rounded-full" />
        </div>

        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-[1440px] mx-auto animate-pulse">
            
            {/* Fake Header */}
            <div className="space-y-2 mb-8">
              <div className="w-32 h-4 bg-kore-border rounded-full" />
              <div className="w-96 h-8 bg-kore-border rounded-full" />
              <div className="w-64 h-4 bg-kore-bg rounded-full" />
            </div>

            {/* Fake KpiGrid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-28 bg-white dark:bg-[#111827] border border-kore-border rounded-2xl p-4 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-11 h-11 bg-kore-bg rounded-xl" />
                    <div className="w-8 h-8 bg-kore-bg rounded-lg" />
                  </div>
                  <div className="w-32 h-4 bg-kore-bg rounded-full mt-auto" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                {/* Fake PatientsTable */}
                <div className="bg-white dark:bg-[#111827] border border-kore-border rounded-2xl h-[400px] p-5">
                  <div className="w-48 h-6 bg-kore-bg rounded-full mb-6" />
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="w-full h-12 bg-kore-bg rounded-xl" />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Fake AgendaToday */}
                <div className="bg-white dark:bg-[#111827] border border-kore-border rounded-2xl h-[280px] p-5">
                  <div className="w-32 h-6 bg-kore-bg rounded-full mb-6" />
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-full h-14 bg-kore-bg rounded-xl" />
                    ))}
                  </div>
                </div>
                
                {/* Fake MealPlansToBuild */}
                <div className="bg-white dark:bg-[#111827] border border-kore-border rounded-2xl h-[220px] p-5">
                  <div className="w-40 h-6 bg-kore-bg rounded-full mb-6" />
                  <div className="space-y-3">
                    {[1, 2].map(i => (
                      <div key={i} className="w-full h-12 bg-kore-bg rounded-xl" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
