import { cn } from "@/lib/utils";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-[2rem] border border-white/85 bg-white/88 p-6 shadow-[0_24px_70px_-34px_rgba(15,23,42,0.18)] backdrop-blur dark:border-gray-800 dark:bg-gray-900",
        className
      )}
    >
      {children}
    </section>
  );
}
