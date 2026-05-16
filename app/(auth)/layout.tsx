export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center overflow-x-hidden">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-[-12%] h-[min(560px,58vh)] w-[min(900px,110vw)] -translate-x-1/2 rounded-full bg-violet-600/18 blur-[130px]" />
        <div className="absolute bottom-[-18%] left-1/2 h-[min(480px,50vh)] w-[min(800px,100vw)] -translate-x-1/2 rounded-full bg-fuchsia-600/12 blur-[150px]" />
        <div className="absolute left-[-8%] top-1/3 h-[min(320px,38vh)] w-[min(380px,45vw)] -translate-y-1/2 rounded-full bg-violet-500/10 blur-[110px]" />
        <div className="absolute right-[-8%] top-1/2 h-[min(300px,36vh)] w-[min(360px,42vw)] -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[110px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(139,92,246,0.08),transparent_70%)]" />
      </div>

      <div className="relative z-10 flex w-full flex-col items-center px-4 pb-8 pt-10 sm:pt-14">
        {children}
      </div>
    </div>
  );
}
