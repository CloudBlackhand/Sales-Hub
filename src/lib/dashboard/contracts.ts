import type { Customer, FinancialTransaction } from "@/lib/prisma-types";

export interface DashboardPageResult<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages?: number;
}

export interface SalesListItem {
  id: string;
  number: number;
  type: string;
  status: string;
  totalAmount: number;
  saleDate: Date;
  seller: { id: string; name: string; code: string };
  customer: { id: string; name: string } | null;
}

export type CustomersListResponse = DashboardPageResult<Customer>;
export type SalesListResponse = DashboardPageResult<SalesListItem>;

/** Lançamento com valores monetários já convertidos para número (JSON/API). */
export type TransactionListItem = Omit<FinancialTransaction, "amount"> & { amount: number };

export type TransactionsListResponse = DashboardPageResult<TransactionListItem>;

export interface CommissionListItem {
  id: string;
  baseAmount: number;
  rate: number;
  amount: number;
  type: string;
  status: string;
  createdAt: Date;
  paidAt: Date | null;
  seller: { id: string; name: string; code: string };
  sale: { id: string; number: number; saleDate: Date };
}

export type CommissionsListResponse = DashboardPageResult<CommissionListItem>;
