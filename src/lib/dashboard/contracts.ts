import { Customer, FinancialTransaction } from "@/lib/prisma-types";

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
  totalAmount: unknown;
  saleDate: Date;
  seller: { id: string; name: string; code: string };
  customer: { id: string; name: string } | null;
}

export type CustomersListResponse = DashboardPageResult<Customer>;
export type SalesListResponse = DashboardPageResult<SalesListItem>;
export type TransactionsListResponse = DashboardPageResult<FinancialTransaction>;

export interface CommissionListItem {
  id: string;
  baseAmount: unknown;
  rate: unknown;
  amount: unknown;
  type: string;
  status: string;
  createdAt: Date;
  paidAt: Date | null;
  seller: { id: string; name: string; code: string };
  sale: { id: string; number: number; saleDate: Date };
}

export type CommissionsListResponse = DashboardPageResult<CommissionListItem>;
