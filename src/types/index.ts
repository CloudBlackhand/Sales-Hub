export type {
  User,
  Company,
  CompanyMember,
  Seller,
  Product,
  Customer,
  Sale,
  SaleItem,
  PostSaleActivity,
  Commission,
  FinancialTransaction,
  CompanySettings,
} from "@/generated/prisma";

export {
  CompanyPlan,
  MemberRole,
  CommissionType,
  CommissionStatus,
  ProductType,
  SaleType,
  SaleStatus,
  PostSaleType,
  ActivityStatus,
  TransactionType,
} from "@/generated/prisma";

// ─── DTO types for server actions (portable to a future API) ───

export interface PaginationParams {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Company context (carried across server actions) ───

export interface CompanyContext {
  companyId: string;
  userId: string;
  role: import("@/generated/prisma").MemberRole;
}
