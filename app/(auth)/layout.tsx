export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center overflow-x-hidden px-4 pt-10 pb-6 sm:pt-14">
      {children}
    </div>
  );
}
