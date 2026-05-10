export function DemoReadOnlyBanner() {
  return (
    <div
      role="status"
      className="shrink-0 border-b border-amber-500/50 bg-amber-500/20 px-4 py-2.5 text-center text-amber-50"
    >
      <p className="text-base font-semibold uppercase tracking-[0.35em] text-amber-100">DEMONSTRATIVO</p>
      <p className="mt-1 text-xs text-amber-100/90">Dados do CRM em só leitura — login ativo.</p>
    </div>
  );
}
