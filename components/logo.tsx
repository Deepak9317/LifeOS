export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-orange-300 to-teal-300 text-sm font-black text-stone-950 shadow-lg shadow-amber-500/25">
        LO
      </div>
      {!compact ? <p className="text-base font-bold tracking-tight text-stone-950">LifeOS</p> : null}
    </div>
  );
}
