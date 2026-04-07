import Image from "next/image";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="overflow-hidden rounded-2xl shadow-[0_14px_28px_-18px_rgba(45,212,191,0.5)]">
        <Image
          alt="LifeOS logo"
          className="size-11 rounded-2xl object-cover"
          height={44}
          priority
          src="/lifeos-logo.png"
          width={44}
        />
      </div>
      {!compact ? <p className="text-base font-bold tracking-tight text-stone-950">LifeOS</p> : null}
    </div>
  );
}
