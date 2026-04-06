import { cn } from "@/lib/utils";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.25)] backdrop-blur",
        className
      )}
    >
      {children}
    </section>
  );
}
