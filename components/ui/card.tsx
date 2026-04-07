import { cn } from "@/lib/utils";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-[2rem] border border-amber-100/70 bg-[rgba(255,253,249,0.88)] p-6 shadow-[0_26px_70px_-38px_rgba(120,53,15,0.14)] backdrop-blur",
        className
      )}
    >
      {children}
    </section>
  );
}
