"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SaleFormActionsProps {
  loading: boolean;
  onCancel: () => void;
}

export function SaleFormActions({ loading, onCancel }: SaleFormActionsProps) {
  return (
    <div className="flex gap-3 pt-2">
      <Button
        type="button"
        variant="ghost"
        className="flex-1 text-gray-400 hover:bg-gray-800 hover:text-white"
        onClick={onCancel}
      >
        Cancelar
      </Button>
      <Button type="submit" className="flex-1 bg-blue-600 text-white hover:bg-blue-700" disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Criar venda
      </Button>
    </div>
  );
}
