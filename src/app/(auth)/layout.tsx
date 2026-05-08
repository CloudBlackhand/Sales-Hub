export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-2 inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600/90 text-sm font-black text-white shadow-[0_0_0_1px_rgba(59,130,246,0.5)]">
              O!
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-100">Sales Hub</span>
          </div>
          <p className="text-sm text-zinc-500">Plataforma de gestão comercial</p>
        </div>
        {children}
      </div>
    </div>
  );
}
