export default function LoadingPersonal() {
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#111111] text-slate-900 dark:text-slate-100">
      {/* Sidebar Skeleton (escondida no mobile, visível no desktop) */}
      <div className="hidden lg:flex w-64 border-r border-slate-200 dark:border-[#222222] p-4 flex-col gap-4">
        <div className="h-8 w-32 bg-slate-200 dark:bg-[#222222] rounded-lg animate-pulse" />
        <div className="mt-8 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-full bg-slate-200 dark:bg-[#222222] rounded-lg animate-pulse" />
          ))}
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar Skeleton */}
        <header className="h-16 border-b border-slate-200 dark:border-[#222222] px-4 flex items-center justify-between">
          <div className="h-8 w-8 bg-slate-200 dark:bg-[#222222] rounded-lg lg:hidden animate-pulse" />
          <div className="h-10 w-64 bg-slate-200 dark:bg-[#222222] rounded-full animate-pulse ml-auto" />
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-[1440px] mx-auto w-full">
          {/* Header Texto */}
          <div className="space-y-2 mb-6">
            <div className="h-4 w-32 bg-slate-200 dark:bg-[#222222] rounded-md animate-pulse" />
            <div className="h-8 w-64 bg-slate-200 dark:bg-[#222222] rounded-lg animate-pulse" />
            <div className="h-4 w-48 bg-slate-200 dark:bg-[#222222] rounded-md animate-pulse" />
          </div>

          {/* KPIs Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl border border-slate-200 dark:border-[#222222] bg-white dark:bg-[#1a1a1a] p-4 animate-pulse">
                <div className="flex justify-between items-center mb-3">
                  <div className="h-11 w-11 rounded-xl bg-slate-200 dark:bg-[#222222]" />
                  <div className="h-8 w-12 rounded bg-slate-200 dark:bg-[#222222]" />
                </div>
                <div className="h-4 w-2/3 bg-slate-200 dark:bg-[#222222] rounded mt-4" />
              </div>
            ))}
          </div>

          {/* Grid Principal */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
            <div className="xl:col-span-2 space-y-6">
              {/* Tabela de Alunos Skeleton */}
              <div className="rounded-2xl border border-slate-200 dark:border-[#222222] bg-white dark:bg-[#1a1a1a] p-5 h-[400px] animate-pulse">
                <div className="h-6 w-48 bg-slate-200 dark:bg-[#222222] rounded mb-6" />
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 w-full bg-slate-200 dark:bg-[#222222] rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Agenda Skeleton */}
              <div className="rounded-2xl border border-slate-200 dark:border-[#222222] bg-white dark:bg-[#1a1a1a] p-5 h-[300px] animate-pulse">
                <div className="h-6 w-32 bg-slate-200 dark:bg-[#222222] rounded mb-6" />
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 w-full bg-slate-200 dark:bg-[#222222] rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
