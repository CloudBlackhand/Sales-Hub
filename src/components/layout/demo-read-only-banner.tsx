export function DemoReadOnlyBanner() {
  return (
    <div
      role="status"
      className="shrink-0 border-b border-amber-500/40 bg-amber-500/15 px-4 py-2 text-center text-sm text-amber-100"
    >
      Modo demonstração — dados do CRM são só leitura; login continua ativo.
    </div>
  );
}
