import type { Seller } from "@/lib/prisma-types";

export interface SaleFormDialogProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  sellers: Seller[];
  onSuccess: () => void;
}
