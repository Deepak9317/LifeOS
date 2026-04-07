export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.16),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(251,191,36,0.16),_transparent_28%),linear-gradient(180deg,_#f8fafc,_#eff8f5_45%,_#f8fafc)] dark:bg-[linear-gradient(180deg,#020617,#0f172a_52%,#111827)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1520px] items-center px-4 py-12 sm:px-6">
        {children}
      </div>
    </div>
  );
}
