export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f4ee,#f3efe7_52%,#f8f6f2)] dark:bg-[linear-gradient(180deg,#0f1115,#17191f_52%,#111318)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1520px] items-center px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </div>
    </div>
  );
}
