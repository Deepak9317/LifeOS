export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 via-cyan-400 to-amber-300 text-sm font-black text-slate-950 shadow-lg shadow-teal-500/25">
        LO
      </div>
      {!compact ? <p className="text-base font-bold tracking-tight text-slate-950 dark:text-white">LifeOS</p> : null}
    </div>
  );
}
